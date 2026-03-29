"""
ingest.py — Script d'ingestion RAG pour le SaaS notarial Preo-IA
Ingère les documents PDF/DOCX/TXT vers Supabase (table documents_rag)
avec embeddings Mistral (mistral-embed, 1024 dimensions)
"""

import os
import re
import sys
import time
import argparse
from pathlib import Path

import httpx
import tiktoken
import pdfplumber
from docx import Document as DocxDocument
from dotenv import load_dotenv
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

TABLE_RAG = os.getenv("TABLE_RAG", "documents_rag")
MAX_TOKENS = 800
OVERLAP_TOKENS = 100
EMBEDDING_MODEL = "mistral-embed"
EMBEDDING_DIM = 1024

TOKENIZER = tiktoken.get_encoding("cl100k_base")

HEADERS_SUPA = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# Mapping sous-dossiers templates → type_acte
TEMPLATE_TYPE_ACTE = {
    "constitution_societe": "constitution_societe",
    "vente_immobiliere": "vente_immobiliere",
    "succession": "succession",
    "donation": "donation",
    "ouverture_credit": "ouverture_credit",
}

# Mapping dossiers 00-07 → categorie
FOLDER_CATEGORIE = {
    "00_code_civil_ci": "code_civil",
    "01_foncier_rural": "foncier_rural",
    "02_foncier_urbain_acd": "foncier_urbain",
    "03_ohada_actes_uniformes": "ohada",
    "04_tarifs_statut_notariat": "tarifs_notariat",
    "05_code_commerce_droit_affaires": "commerce_affaires",
    "06_successions_donations_liberalites": "successions_donations",
    "07_fiscalite_enregistrement": "fiscalite",
}


# ---------------------------------------------------------------------------
# 1. Détection des metadata depuis le chemin du fichier
# ---------------------------------------------------------------------------
def detect_metadata(filepath: str, base_folder: str) -> dict:
    rel = os.path.relpath(filepath, base_folder).replace("\\", "/")
    parts = rel.split("/")
    folder_name = parts[0].lower() if parts else ""

    if folder_name.startswith("08_"):
        subfolder = parts[1].lower() if len(parts) > 1 else ""
        type_acte = TEMPLATE_TYPE_ACTE.get(subfolder)
        return {
            "tenant_id": "essai",
            "type_source": "modele_essai",
            "type_acte": type_acte,
            "categorie": "modele_acte",
            "fichier_source": rel,
        }
    else:
        categorie = FOLDER_CATEGORIE.get(folder_name, folder_name)
        return {
            "tenant_id": "commun",
            "type_source": "texte_legal",
            "type_acte": None,
            "categorie": categorie,
            "fichier_source": rel,
        }


# ---------------------------------------------------------------------------
# 2. Extraction de texte
# ---------------------------------------------------------------------------
def extract_text(filepath: str) -> str:
    ext = Path(filepath).suffix.lower()

    if ext == ".pdf":
        return _extract_pdf(filepath)
    elif ext == ".docx":
        return _extract_docx(filepath)
    elif ext == ".doc":
        return _extract_doc(filepath)
    elif ext == ".txt":
        return Path(filepath).read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(f"Format non supporté : {ext}")


def _extract_pdf(filepath: str) -> str:
    pages = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)


def _extract_docx(filepath: str) -> str:
    doc = DocxDocument(filepath)
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _extract_doc(filepath: str) -> str:
    # Fallback: try reading as text, or skip
    try:
        return Path(filepath).read_text(encoding="utf-8", errors="replace")
    except Exception:
        print(f"  [WARN] Format .doc non supporté nativement, skip: {filepath}")
        return ""


# ---------------------------------------------------------------------------
# 3. Chunking intelligent
# ---------------------------------------------------------------------------
def count_tokens(text: str) -> int:
    return len(TOKENIZER.encode(text))


def chunk_text(text: str, doc_type: str = "texte_legal") -> list[str]:
    if not text.strip():
        return []

    if doc_type == "texte_legal":
        return _chunk_legal(text)
    else:
        return _chunk_modele(text)


def _chunk_legal(text: str) -> list[str]:
    """Découpe par article/section pour les textes légaux."""
    # Patterns de découpe : Article X, ARTICLE X, Art. X, TITRE, CHAPITRE, Section
    pattern = r"(?=(?:^|\n)\s*(?:Article|ARTICLE|Art\.?)\s+\d+|(?:^|\n)\s*(?:TITRE|CHAPITRE|SECTION|Chapitre|Section|Titre)\s+[IVXLCDM\d]+)"
    sections = re.split(pattern, text)
    sections = [s.strip() for s in sections if s.strip()]

    chunks = []
    for section in sections:
        if count_tokens(section) <= MAX_TOKENS:
            chunks.append(section)
        else:
            chunks.extend(_split_by_tokens(section))

    return _merge_small_chunks(chunks)


def _chunk_modele(text: str) -> list[str]:
    """Découpe par clause/paragraphe pour les modèles d'actes."""
    # Découpe sur les séparations naturelles
    pattern = r"(?=\n={3,}|\n-{3,}|\n(?:Article|ARTICLE)\s+[A-Z]?\d+|\n(?:PREMIÈRE|DEUXIÈME|TROISIÈME|SECTION)\s)"
    sections = re.split(pattern, text)
    sections = [s.strip() for s in sections if s.strip()]

    chunks = []
    for section in sections:
        if count_tokens(section) <= MAX_TOKENS:
            chunks.append(section)
        else:
            chunks.extend(_split_by_tokens(section))

    return _merge_small_chunks(chunks)


def _split_by_tokens(text: str) -> list[str]:
    """Découpe un texte long en chunks avec overlap."""
    tokens = TOKENIZER.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + MAX_TOKENS, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = TOKENIZER.decode(chunk_tokens)
        if chunk_text.strip():
            chunks.append(chunk_text.strip())
        start += MAX_TOKENS - OVERLAP_TOKENS
    return chunks


def _merge_small_chunks(chunks: list[str], min_tokens: int = 50) -> list[str]:
    """Fusionne les chunks trop petits avec le suivant."""
    if not chunks:
        return []
    merged = []
    buffer = ""
    for chunk in chunks:
        if buffer:
            combined = buffer + "\n\n" + chunk
            if count_tokens(combined) <= MAX_TOKENS:
                buffer = combined
                continue
            else:
                merged.append(buffer)
                buffer = chunk
        else:
            if count_tokens(chunk) < min_tokens:
                buffer = chunk
            else:
                buffer = chunk
    if buffer:
        merged.append(buffer)
    return merged


# ---------------------------------------------------------------------------
# 4. Génération d'embeddings via Mistral
# ---------------------------------------------------------------------------
def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Génère les embeddings par batch de 10 (limite Mistral)."""
    all_embeddings = []
    batch_size = 10

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        emb = _call_mistral_embed(batch)
        all_embeddings.extend(emb)
        if i + batch_size < len(texts):
            time.sleep(0.3)  # Rate limit friendly

    return all_embeddings


def _call_mistral_embed(texts: list[str], retries: int = 3) -> list[list[float]]:
    """Appel API Mistral avec retry."""
    for attempt in range(retries):
        try:
            resp = httpx.post(
                "https://api.mistral.ai/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {MISTRAL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"model": EMBEDDING_MODEL, "input": texts},
                timeout=60,
            )
            if resp.status_code == 429:
                wait = 2 ** (attempt + 1)
                print(f"  [WARN] Rate limit, attente {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            return [item["embedding"] for item in data["data"]]
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
                continue
            raise RuntimeError(f"Mistral API failed after {retries} attempts: {e}")
    return []


# ---------------------------------------------------------------------------
# 5. Insertion Supabase
# ---------------------------------------------------------------------------
def check_already_ingested(fichier_source: str) -> bool:
    """Vérifie si un fichier a déjà été ingéré."""
    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/{TABLE_RAG}",
        params={
            "select": "id",
            "fichier_source": f"eq.{fichier_source}",
            "limit": "1",
        },
        headers=HEADERS_SUPA,
        timeout=30,
    )
    return resp.status_code == 200 and len(resp.json()) > 0


def insert_chunks(rows: list[dict]) -> int:
    """Insère les chunks par batch de 50."""
    inserted = 0
    batch_size = 50

    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        resp = httpx.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE_RAG}",
            headers=HEADERS_SUPA,
            json=batch,
            timeout=60,
        )
        if resp.status_code in (200, 201):
            inserted += len(batch)
        else:
            print(f"  [ERROR] Supabase insert failed: {resp.status_code} {resp.text[:200]}")
    return inserted


def delete_tenant_data(tenant_id: str):
    """Supprime toutes les données d'un tenant."""
    resp = httpx.delete(
        f"{SUPABASE_URL}/rest/v1/{TABLE_RAG}",
        params={"tenant_id": f"eq.{tenant_id}"},
        headers=HEADERS_SUPA,
        timeout=60,
    )
    if resp.status_code in (200, 204):
        print(f"[INFO] Données tenant '{tenant_id}' supprimées")
    else:
        print(f"[ERROR] Suppression tenant '{tenant_id}': {resp.status_code}")


# ---------------------------------------------------------------------------
# 6. Ingestion d'un fichier
# ---------------------------------------------------------------------------
def ingest_file(filepath: str, base_folder: str, stats: dict) -> bool:
    filename = os.path.basename(filepath)
    meta = detect_metadata(filepath, base_folder)

    # Check idempotence
    if check_already_ingested(meta["fichier_source"]):
        print(f"[SKIP] {meta['fichier_source']} (déjà ingéré)")
        stats["skipped"] += 1
        return True

    print(f"[INFO] Fichier : {meta['fichier_source']}")
    t0 = time.time()

    # Extract text
    try:
        text = extract_text(filepath)
    except Exception as e:
        print(f"  [ERROR] Extraction échouée : {e}")
        stats["errors"] += 1
        return False

    if not text.strip():
        print(f"  [WARN] Fichier vide, skip")
        stats["skipped"] += 1
        return True

    token_count = count_tokens(text)
    print(f"  [INFO] Extraction : {token_count:,} tokens")

    # Chunk
    doc_type = "modele" if meta["type_source"] == "modele_essai" else "texte_legal"
    chunks = chunk_text(text, doc_type)
    chunks = [c for c in chunks if c.strip()]

    if not chunks:
        print(f"  [WARN] 0 chunks, skip")
        stats["skipped"] += 1
        return True

    print(f"  [INFO] Chunking : {len(chunks)} chunks")

    # Embeddings
    try:
        embeddings = generate_embeddings(chunks)
    except Exception as e:
        print(f"  [ERROR] Embeddings échoués : {e}")
        stats["errors"] += 1
        return False

    print(f"  [INFO] Embeddings : {len(embeddings)}/{len(chunks)} générés")

    # Build rows
    rows = []
    for chunk, emb in zip(chunks, embeddings):
        row = {
            "tenant_id": meta["tenant_id"],
            "type_source": meta["type_source"],
            "type_acte": meta["type_acte"],
            "categorie": meta["categorie"],
            "fichier_source": meta["fichier_source"],
            "contenu": chunk,
            "embedding": emb,
            "metadata": {
                "filename": filename,
                "tokens": count_tokens(chunk),
            },
        }
        rows.append(row)

    # Insert
    inserted = insert_chunks(rows)
    elapsed = time.time() - t0
    print(
        f"  [OK] {filename} — {inserted} chunks en {elapsed:.1f}s "
        f"(tenant={meta['tenant_id']})"
    )

    stats["files"] += 1
    stats["chunks"] += inserted
    return True


# ---------------------------------------------------------------------------
# 7. Ingestion d'un dossier
# ---------------------------------------------------------------------------
SUPPORTED_EXT = {".pdf", ".docx", ".doc", ".txt"}


def collect_files(folder: str, tenant_filter: str = None) -> list[str]:
    """Collecte tous les fichiers supportés, avec filtre tenant optionnel."""
    files = []
    for root, _, filenames in os.walk(folder):
        for fn in sorted(filenames):
            ext = Path(fn).suffix.lower()
            if ext not in SUPPORTED_EXT:
                continue
            filepath = os.path.join(root, fn)

            if tenant_filter:
                rel = os.path.relpath(filepath, folder).replace("\\", "/")
                parts = rel.split("/")
                folder_name = parts[0].lower()
                if tenant_filter == "essai" and not folder_name.startswith("08_"):
                    continue
                if tenant_filter == "commun" and folder_name.startswith("08_"):
                    continue

            files.append(filepath)
    return files


def ingest_folder(folder: str, tenant_filter: str = None):
    print(f"[INFO] Démarrage ingestion : {folder}")
    t0 = time.time()

    files = collect_files(folder, tenant_filter)
    print(f"[INFO] {len(files)} fichiers à traiter\n")

    stats = {"files": 0, "chunks": 0, "errors": 0, "skipped": 0}

    for filepath in tqdm(files, desc="Ingestion", unit="fichier"):
        ingest_file(filepath, folder, stats)
        print()

    elapsed = time.time() - t0
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)

    print("=" * 60)
    print(f"[DONE] Ingestion terminée")
    print(f"  Fichiers traités  : {stats['files']}")
    print(f"  Fichiers skippés  : {stats['skipped']}")
    print(f"  Chunks totaux     : {stats['chunks']:,}")
    print(f"  Erreurs           : {stats['errors']}")
    print(f"  Durée totale      : {minutes}m {seconds:02d}s")
    print("=" * 60)


# ---------------------------------------------------------------------------
# 8. Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Ingestion RAG Notariat")
    parser.add_argument("--folder", help="Dossier RAG à ingérer")
    parser.add_argument("--file", help="Fichier unique à ingérer")
    parser.add_argument(
        "--tenant",
        choices=["commun", "essai"],
        help="Ingérer uniquement un tenant",
    )
    parser.add_argument("--reset", help="Supprimer et réingérer un tenant")
    args = parser.parse_args()

    # Vérifications
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[FATAL] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env")
        sys.exit(1)
    if not MISTRAL_API_KEY:
        print("[FATAL] MISTRAL_API_KEY manquant dans .env")
        sys.exit(1)

    # Reset tenant
    if args.reset:
        delete_tenant_data(args.reset)

    # Ingestion
    if args.file:
        base = args.folder or os.path.dirname(args.file)
        stats = {"files": 0, "chunks": 0, "errors": 0, "skipped": 0}
        ingest_file(args.file, base, stats)
        print(f"\n[DONE] {stats['chunks']} chunks insérés")
    elif args.folder:
        ingest_folder(args.folder, args.tenant)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
