import os
import re
from typing import List, Dict

POLICY_PATH = os.path.join(os.path.dirname(__file__), "data", "policy.md")

class PolicyRAG:
    """
    RAG module for index & retrieval of airline disruption policies.
    Uses chunking and semantic keyword similarity scoring.
    """
    def __init__(self, policy_path: str = POLICY_PATH):
        self.policy_path = policy_path
        self.chunks: List[Dict[str, str]] = []
        self._load_and_chunk_policy()

    def _load_and_chunk_policy(self):
        if not os.path.exists(self.policy_path):
            self.chunks = [{"title": "Default Policy", "content": "Standard airline disruption procedures apply."}]
            return

        with open(self.policy_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Split policy document by H2 headers (##)
        raw_sections = re.split(r'\n(?=##\s+)', content)
        
        for idx, section in enumerate(raw_sections):
            section = section.strip()
            if not section:
                continue
            
            lines = section.split('\n')
            title = lines[0].replace('#', '').strip() if lines[0].startswith('#') else f"Section {idx + 1}"
            body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section
            
            if body:
                self.chunks.append({
                    "id": f"chunk_{idx+1}",
                    "title": title,
                    "content": body
                })

    def retrieve_relevant_policy(self, query: str, top_k: int = 2) -> List[Dict[str, str]]:
        """
        Retrieve top_k most relevant policy sections based on query.
        """
        if not self.chunks:
            return []

        query_words = set(re.findall(r'\w+', query.lower()))
        
        scored_chunks = []
        for chunk in self.chunks:
            chunk_text = (chunk['title'] + " " + chunk['content']).lower()
            chunk_words = set(re.findall(r'\w+', chunk_text))
            
            # Match score based on word overlap and keyword weights
            match_score = len(query_words.intersection(chunk_words))
            
            # Boost specific domain terms
            domain_terms = ['voucher', 'hotel', 'unaccompanied', 'wheelchair', 'connection', 'mct', 'priority', 'compensation', 'business', 'interline']
            for term in domain_terms:
                if term in query.lower() and term in chunk_text:
                    match_score += 3
            
            scored_chunks.append((match_score, chunk))

        # Sort by match score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "id": chunk["id"],
                "title": chunk["title"],
                "content": chunk["content"],
                "relevance_score": float(score)
            })
            
        return results

# Singleton instance
rag_engine = PolicyRAG()

def get_policy_context(query: str, top_k: int = 2) -> str:
    """
    Convenience function returning formatted policy text for LLM prompts.
    """
    results = rag_engine.retrieve_relevant_policy(query, top_k=top_k)
    formatted = []
    for r in results:
        formatted.append(f"--- Policy Section: {r['title']} ---\n{r['content']}")
    return "\n\n".join(formatted)
