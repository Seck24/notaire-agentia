"""
verify_rag.py — Vérifie que l'ingestion RAG est correcte
et teste la recherche sémantique
"""

import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
TABLE_RAG = os.getenv("TABLE_RAG", "documents_rag")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


def query_supabase(sql: str):
    """Exécute une requête SQL via le Management API."""
    token = os.getenv("SUPABASE_ACCESS_TOKEN", "sbp_0d79968b8d8ce036e8ec6791b60c8bca952ba8f9")
    ref = "rbujxzyvsftvzyxfifke"
    resp = httpx.post(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={"query": sql},
        timeout=30,
    )
    return resp.json()


def get_embedding(text: str) -> list[float]:
    resp = httpx.post(
        "https://api.mistral.ai/v1/embeddings",
        headers={
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        },
        json={"model": "mistral-embed", "input": [text]},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["data"][0]["embedding"]


def test_search(query: str, type_acte: str = None, cabinet: str = "commun"):
    """Teste la recherche RAG via la fonction Supabase."""
    emb = get_embedding(query)
    emb_str = "[" + ",".join(str(x) for x in emb) + "]"

    if type_acte:
        sql = f"SELECT * FROM recherche_rag('{emb_str}'::vector(1024), '{cabinet}', '{type_acte}', 5);"
    else:
        sql = f"SELECT * FROM recherche_rag('{emb_str}'::vector(1024), '{cabinet}', NULL, 5);"

    results = query_supabase(sql)
    return results


def main():
    print("=" * 60)
    print("VÉRIFICATION RAG — Notariat Agent IA")
    print("=" * 60)

    # 1. Statistiques
    print("\n--- 1. Statistiques par tenant/type ---")
    stats = query_supabase(
        "SELECT tenant_id, type_source, type_acte, categorie, COUNT(*) as nb_chunks "
        "FROM documents_rag GROUP BY 1,2,3,4 ORDER BY 1,2,3,4;"
    )

    if isinstance(stats, list) and stats:
        total = 0
        for row in stats:
            nb = int(row.get("nb_chunks", 0))
            total += nb
            ta = row.get("type_acte") or "-"
            cat = row.get("categorie") or "-"
            print(
                f"  {row['tenant_id']:10s} | {row['type_source']:15s} | "
                f"{ta:25s} | {cat:25s} | {nb:>5d} chunks"
            )
        print(f"\n  TOTAL : {total:,} chunks")
        check1 = total > 0
    else:
        print(f"  Résultat inattendu : {stats}")
        check1 = False

    # 2. Fichiers uniques
    print("\n--- 2. Fichiers ingérés ---")
    files = query_supabase(
        "SELECT fichier_source, COUNT(*) as chunks "
        "FROM documents_rag GROUP BY fichier_source ORDER BY fichier_source;"
    )
    if isinstance(files, list):
        for f in files:
            print(f"  {f['fichier_source']:60s} | {str(f['chunks']):>4s} chunks")
        print(f"\n  {len(files)} fichiers ingérés")
        check2 = len(files) > 0
    else:
        check2 = False

    # 3. Test recherche sémantique
    print("\n--- 3. Tests de recherche sémantique ---")

    test_queries = [
        ("Conditions de validité d'une vente immobilière en Côte d'Ivoire", None),
        ("Constitution d'une SARL en droit OHADA", "constitution_societe"),
        ("Droits du conjoint survivant dans une succession", None),
        ("Donation immobilière avec réserve d'usufruit", "donation"),
        ("Inscription hypothécaire et nantissement", "ouverture_credit"),
    ]

    check3 = True
    for query, type_acte in test_queries:
        print(f"\n  Q: \"{query}\"")
        if type_acte:
            print(f"     (filtre type_acte={type_acte})")
        try:
            results = test_search(query, type_acte)
            if isinstance(results, list) and results:
                for i, r in enumerate(results[:3]):
                    score = float(r.get("similarite", 0))
                    source = r.get("fichier_source", "?")
                    contenu = r.get("contenu", "")[:100]
                    print(f"     [{i+1}] score={score:.3f} | {source}")
                    print(f"         {contenu}...")
            else:
                print(f"     Aucun résultat (ou erreur: {str(results)[:100]})")
                check3 = False
        except Exception as e:
            print(f"     [ERROR] {e}")
            check3 = False

    # 4. Rapport final
    print("\n" + "=" * 60)
    print("RAPPORT FINAL")
    print("=" * 60)
    print(f"  {'Chunks en base':40s} {'✅' if check1 else '❌'}")
    print(f"  {'Fichiers ingérés':40s} {'✅' if check2 else '❌'}")
    print(f"  {'Recherche sémantique':40s} {'✅' if check3 else '❌'}")
    print("=" * 60)


if __name__ == "__main__":
    main()
