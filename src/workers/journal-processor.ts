import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { journals } from '../db/schema';
import { eq } from 'drizzle-orm';

interface QueueMessage {
    type: string;
    journalId: string;
    userId: string;
    content: string;
}

export default {
    async queue(batch: MessageBatch<QueueMessage>, env: any): Promise<void> {
        const sql = neon(env.DATABASE_URL);
        const db = drizzle(sql);

        for (const message of batch.messages) {
            const { journalId, userId, content } = message.body;

            try {
                // 1. Generate Embeddings
                const aiResult = await env.AI.run('@cf/baai/bge-large-en-v1.5', { text: [content] });
                const values = aiResult.data[0];
                const vectorizeId = crypto.randomUUID();

                // 2. Fetch existing journal to see if we need to cleanup old vectors
                const [existing] = await db.select().from(journals).where(eq(journals.id, journalId));

                // 3. Insert into Vectorize
                await env.VECTOR_INDEX.insert([
                    {
                        id: vectorizeId,
                        values,
                        metadata: { userId, journalId }
                    }
                ]);

                // 4. Update NeonDB with the new vectorizeId
                await db.update(journals)
                    .set({ vectorizeId, updatedAt: new Date() })
                    .where(eq(journals.id, journalId));

                // 5. Cleanup old vector if it existed
                if (existing?.vectorizeId) {
                    await env.VECTOR_INDEX.deleteByIds([existing.vectorizeId]);
                }

                console.log(`Successfully processed journal ${journalId} for user ${userId}`);
            } catch (err) {
                console.error(`Error processing journal ${journalId}:`, err);
                // Retrying is handled by Cloudflare Queues if we throw
                throw err;
            }
        }
    }
};
