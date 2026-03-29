-- ============================================
-- Migration : Création de la fonction recherche_rag()
-- Projet : Notariat Agent IA
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- S'assurer que pgvector est activé
CREATE EXTENSION IF NOT EXISTS vector;

-- Fonction de recherche sémantique RAG
CREATE OR REPLACE FUNCTION recherche_rag(
  query_embedding vector(1024),
  match_count int DEFAULT 5,
  filter_tenant text[] DEFAULT ARRAY['commun']
)
RETURNS TABLE (
  id bigint,
  tenant_id text,
  type_source text,
  type_acte text,
  categorie text,
  contenu text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.tenant_id,
    d.type_source,
    d.type_acte,
    d.categorie,
    d.contenu,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents_rag d
  WHERE d.tenant_id = ANY(filter_tenant)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Index pour accélérer la recherche vectorielle (si pas déjà créé)
CREATE INDEX IF NOT EXISTS idx_documents_rag_embedding
  ON documents_rag
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Index sur tenant_id pour le filtrage
CREATE INDEX IF NOT EXISTS idx_documents_rag_tenant
  ON documents_rag (tenant_id);
