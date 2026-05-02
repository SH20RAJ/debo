# 🔒 Debo Privacy Manifesto: Data Sovereignty by Design

**Last Updated: May 2, 2026**

At Debo, we believe that your memories and inner thoughts are the most sacred data you own. Our privacy architecture is designed not just to comply with laws, but to mathematically ensure **Data Sovereignty**.

## 1. The Zero-Knowledge Vision
We are architecting Debo to move toward a **Zero-Knowledge** model. This means that in the future, your journal entries will be encrypted client-side using keys only you possess. The "Life Intelligence" will be processed in secure enclaves or locally, ensuring that even we cannot read your raw thoughts.

## 2. Technical Data Safeguards
- **Edge-First Privacy**: Model traffic is routed through a private **Cloudflare AI Gateway**, scrubbing sensitive identifiers before they reach third-party inference engines.
- **Provider Isolation**: We do not "sell" your data to train generic models. Your entries are used strictly to build your personal memory graph.
- **Database Hardening**: Our **Neon Postgres** and **Qdrant** instances are isolated and encrypted at rest with industry-leading standards (AES-256).

## 3. Your Right to Memory
- **Full Portability**: You can export your entire structured memory graph and raw journals in human-readable JSON at any time.
- **The "Delete Everything" Switch**: Deletion in Debo means complete erasure from our database, vector index, and memory extraction caches.
- **Transparent Logging**: You can view every retrieval call made by the AI to see exactly which parts of your history were used to generate an answer.

## 4. Third-Party Intelligence
We leverage best-in-class models (OpenAI, Anthropic, Meta) for reasoning. However, we minimize the data sent to them by using **Contextual Snippets** instead of full document dumping.

## 5. Continuous Audit
As part of our **Radical Transparency** goal, our core retrieval and memory extraction logic is open-source. Anyone can audit how we handle your data on [GitHub](https://github.com/SH20RAJ/debo).

---
*Your life is private. Your AI should be too.*
