# AI System

This document explains how Debo turns journal data into grounded AI responses.

## 1. Prompt Design

Debo uses a system prompt that tells the model to act as a private life companion and journal analyst. The prompt has four jobs:

1. Keep the tone warm and precise.
2. Prevent invented facts.
3. Prioritize retrieved context over model guesses.
4. Encourage pattern-level answers when the evidence supports them.

The prompt also includes the current date and a formatted retrieval block so the model can anchor time-sensitive responses.

## 2. Tooling

Debo exposes tools for three retrieval tasks:

- Search journal entries.
- Retrieve persistent memories.
- Fetch recent entries.

These tools are intentionally narrow. They return evidence, not freeform prose, so the model stays grounded in the user's actual history.

## 3. Reasoning Flow

The AI flow is:

1. Receive the user message.
2. Build retrieval context from journals and memories.
3. Rank and deduplicate sources.
4. Add the retrieved evidence to the system prompt.
5. Let the model answer with citations and streaming output.

This makes the model's reasoning observable. The system is not trying to hide retrieval behind a magic answer. It is trying to make the answer explainable.

## 4. Retrieval Context

Debo does not rely on one source of truth.

Journal entries provide the raw historical record. Structured memory provides durable facts and preferences. Recent entries provide freshness. The ranking layer merges those sources so the model sees the most relevant evidence first.

## 5. Citation Strategy

Every response should carry citations where possible.

The citation payload is passed through the UI message metadata so the client can render the sources behind the answer. This supports trust, auditability, and follow-up questions.

## 6. Streaming

The assistant streams its response to the UI. Streaming improves perceived speed and makes multi-step reasoning feel responsive instead of blocked.

## 7. Safety and Accuracy

Debo is optimized for personal memory, which means false confidence is a real risk. The system should prefer saying "I do not have enough context yet" over inventing details. When evidence is thin, it should ask for clarification or point to the most relevant source it found.

## 8. Provider Routing

Model requests flow through Cloudflare AI Gateway. That gives Debo a single place to manage providers, track usage, and change model backends without touching the rest of the orchestration layer.

## 9. What the System Should Never Do

Debo should not:

- Invent journal facts.
- Hide the source of a claim.
- Pretend a memory exists when no memory was retrieved.
- Answer from generic model priors when personal data is available.

That discipline is what makes the product feel trustworthy.

## 10. Memory Engine Deep Dive

Debo's first-party memory engine is the core of its "Life Intelligence." It operates in three phases:

1. **Extraction**: Using structured LLM calls to identify "Memory Atoms"—atomic facts about preferences, people, recurring events, and values from raw journal text.
2. **Deduplication & Merging**: If a user mentions a preference for "morning coffee" multiple times, the engine merges these into a single durable memory node with a "confidence" score.
3. **Retrieval**: When a query is made, the engine performs a hybrid search:
   - **Semantic Search**: Finding memories related to the query's meaning.
   - **Entity Search**: Finding memories explicitly linked to people or places mentioned in the query.

## 11. Multi-modal Voice Reasoning

With the integration of LiveKit, the AI system now handles a **Real-time Loop**:

- **VAD-Triggered Reasoning**: The system can "think" while the user is still speaking, preparing retrieval queries based on the initial few seconds of audio.
- **Interruption Handling**: If the user interrupts, the AI orchestration layer immediately halts generation and resets the retrieval state for the new input.
- **Emotional Mirroring**: The system prompt includes "Voice Tone" instructions that dynamically adjust based on the sentiment of the user's audio input.

## 12. Privacy-Aware Retrieval

Before any data is sent to the LLM via the Cloudflare AI Gateway:
- **PII Scrubbing (Optional)**: In high-privacy mode, the system can scrub sensitive identifiers, replacing them with tokens that are mapped back locally.
- **Context Truncation**: Only the most relevant snippets are sent, minimizing the amount of personal data exposed to the model provider.