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