import "server-only";

export async function storeMemory(userId: string, extractedData: ExtractedMemory) {
  const facts = Array.from(
    new Set(
      extractedData.facts
        .map(normalizeContent)
        .filter((fact) => fact.length >= 4)
    )
  ).slice(0, 20);

  const entities = Array.from(
    new Set(
      extractedData.entities
        .map(normalizeName)
        .filter((entity) => entity.length >= 2)
    )
  ).slice(0, 20);

  const emotionalTopics = Array.from(
    new Set([...extractedData.emotions, ...extractedData.topics].map(normalizeName).filter(Boolean))
  ).slice(0, 20);

  if (facts.length === 0 && entities.length === 0 && emotionalTopics.length === 0) {
    return { factsInserted: 0, entitiesUpserted: 0 };
  }

  if (facts.length > 0) {
    await Promise.all(
      facts.map((fact) =>
        db
          .insert(memoryFacts)
          .values({
            id: crypto.randomUUID(),
            userId,
            content: fact,
            type: detectFactType(fact),
            weight: 1,
          })
          .onConflictDoUpdate({
            target: [memoryFacts.userId, memoryFacts.content],
            set: {
              weight: sql`${memoryFacts.weight} + 1`,
              createdAt: new Date(),
            },
          })
      )
    );
  }

  const entityPayloads = [
    ...entities.map((name) => ({ name, type: "person" })),
    ...emotionalTopics.map((name) => ({
      name,
      type: extractedData.emotions.includes(name) ? "emotion" : "topic",
    })),
  ];

  if (entityPayloads.length > 0) {
    await Promise.all(
      entityPayloads.map((entry) => {
        const normalizedName = normalizeName(entry.name).toLowerCase();

        return db
          .insert(memoryEntities)
          .values({
            id: crypto.randomUUID(),
            userId,
            name: entry.name,
            normalizedName,
            type: entry.type,
            frequency: 1,
          })
          .onConflictDoUpdate({
            target: [memoryEntities.userId, memoryEntities.type, memoryEntities.normalizedName],
            set: {
              name: entry.name,
              frequency: sql`${memoryEntities.frequency} + 1`,
              updatedAt: new Date(),
            },
          });
      })
    );
  }

  return {
    factsInserted: facts.length,
    entitiesUpserted: entityPayloads.length,
  };
}

function detectFactType(fact: string) {
  const lower = fact.toLowerCase();
  if (/(feel|stressed|anxious|excited|motivated|tired|worried|grateful|burned out)/.test(lower)) {
    return "emotion";
  }
  if (/(work|build|startup|product|design|code|engineer|study|school|project)/.test(lower)) {
    return "topic";
  }
  return "fact";
}
