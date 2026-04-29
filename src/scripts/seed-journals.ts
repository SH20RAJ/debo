import { db } from "@/db";
import { user, journals } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SEED_DATA = [
  {
    title: "The Architecture of Debo",
    content: "Today I spent a lot of time thinking about the architecture of Debo. It needs to be edge-ready, using Cloudflare Workers and Neon Serverless. The memory engine is the most exciting part — extracting facts and entities to build a long-term context for the user. I'm using Drizzle ORM which makes database interactions feel really smooth. One challenge is ensuring that the RAG pipeline is both fast and accurate. I'm exploring Qdrant for vector storage because of its high performance."
  },
  {
    title: "Morning Routine and Focus",
    content: "Started my morning with a deep work session on the journal's text editor. I'm using Tiptap because of its extensibility. It's important that the interface feels premium and alive. I've been experimenting with glassmorphism and subtle micro-animations to make the UI feel modern. I feel focused and motivated to get the core features stabilized by the end of the week. Drinking a lot of black coffee helps."
  },
  {
    title: "Drizzle and Database Migrations",
    content: "Ran into some tricky issues with drizzle-kit today. The interactive prompts for renaming columns can be a bit confusing if the database state has drifted. I ended up writing a manual stabilization script to apply unique indexes directly. This bypassed the limitations of the automated tools and got the memory engine working again. It's a good reminder that sometimes you need to go closer to the metal (or in this case, the SQL)."
  },
  {
    title: "Cloudflare Workers AI",
    content: "Integrated Cloudflare Workers AI into the extraction pipeline. The Llama 3.3 model is surprisingly fast and accurate for entity extraction. I'm also using the Qwen embedding model. There was an unauthorized error earlier because of environment variable overrides, but I managed to fix it by explicitly configuring the OpenAI client. The AI Gateway is a great way to manage and monitor these API calls."
  },
  {
    title: "Gym and Physical Health",
    content: "Hit the gym for a heavy leg day. Squats and deadlifts always clear my head after a long day of coding. It's easy to neglect physical health when you're deep in a project like Debo, but I've noticed that my cognitive performance is much better when I stay active. I'm aiming for at least 4 sessions a week now."
  },
  {
    title: "Design System Thinking",
    content: "Refining the design system for Debo. I'm sticking to Shadcn and Tailwind V4. The color palette is mostly dark with vibrant accents. I want the journal to feel like a sanctuary for thoughts — calm, organized, and beautiful. I'm avoiding generic AI aesthetics in favor of something more curated and premium. Typography is key, so I'm using Inter and Outfit."
  },
  {
    title: "Vector Database Strategy",
    content: "Qdrant is now set up and working. The integration with the journal's search feature is impressive. It can find entries not just by keywords, but by semantic meaning. This is exactly what a modern journal needs. I'm planning to implement a 'memory timeline' where users can see how their thoughts on a specific topic have evolved over time."
  },
  {
    title: "Late Night Coding",
    content: "There's something peaceful about coding at 2 AM. No notifications, just me and the code. I fixed the 'server-only' import issue that was blocking the test scripts. Now the memory engine verification is passing consistently. I feel a sense of relief getting this milestone done. Tomorrow I'll focus on the RAG retrieval logic."
  },
  {
    title: "Learning Rust",
    content: "I've started dabbling in Rust to understand how tools like Qdrant and Bun are built under the hood. The memory safety features are fascinating, though the borrow checker is definitely a hurdle at first. I don't think I'll use it for Debo's frontend, but maybe for some high-performance backend modules in the future."
  },
  {
    title: "Product Launch Strategy",
    content: "Thinking about how to launch Debo. I want to target the developer community first. They'll appreciate the technical stack and the open-source spirit of the project. I'll probably post on Product Hunt and Hacker News. The '30tools' community has also been a great source of inspiration for building useful, high-quality mini-apps."
  },
  {
    title: "Meditation and Mental Clarity",
    content: "Took 20 minutes to meditate this evening. My mind has been racing with feature ideas for Debo. Meditation helps me step back and prioritize what's actually important. Quality over quantity is my mantra for this week. I want the core journal experience to be flawless before I add more AI gimmicks."
  },
  {
    title: "Debugging Edge Cases",
    content: "Spent the afternoon debugging a weird edge case in the memory extraction where empty strings were being sent to the LLM. Added some robust normalization and filtering to handle that. It's these small details that make a product feel production-ready. The system now handles messy user input much more gracefully."
  },
  {
    title: "Networking and Collaboration",
    content: "Had a great call with Shaswat today. He gave me some feedback on the UI design. Collaboration is so important in the early stages of a project. He suggested making the 'Memories' section more interactive, maybe using a graph visualization. I love that idea, though it might take some time to implement correctly."
  },
  {
    title: "The Importance of Logging",
    content: "Implementing better logging across the application. Using the AI Gateway logs has been a lifesaver for debugging 401 errors. I'm also adding structured logs to the database operations. When things break at the edge, you need to know exactly why, and good logs are the only way to do that."
  },
  {
    title: "Refactoring Server Actions",
    content: "Cleaned up the server actions for journal creation. They were getting a bit bloated. I moved the memory storage and vector indexing into a background process logic. This keeps the UI responsive even when the AI processing takes a few seconds. Next.js server actions are powerful, but you have to use them carefully."
  },
  {
    title: "Weekend Trip Plans",
    content: "Planning a quick getaway this weekend to the mountains. I need a break from screens. A little bit of nature will do wonders for my creativity. I'll take a physical journal with me, ironically. Sometimes the best way to think about digital tools is to step away from them for a bit."
  },
  {
    title: "The Future of AI Companions",
    content: "Debo isn't just a journal; it's an evolving companion. I'm reading up on memory augmentation and how AI can help us remember things we'd otherwise forget. The goal is to create a 'second brain' that doesn't just store information, but actively helps you reflect and grow. It's an ambitious vision, but we're getting there step by step."
  },
  {
    title: "Typography and Readability",
    content: "Obsessing over the line-height and font-weight of the journal entries. If people are going to write their deepest thoughts here, the reading and writing experience has to be perfect. I switched to a slightly warmer background color to reduce eye strain during long writing sessions. It's much better now."
  },
  {
    title: "Handling Large Documents",
    content: "Tested the system with a 5000-word journal entry today. The chunking logic for vector storage worked well. I'm using a sliding window approach to ensure context isn't lost at the boundaries. The extraction engine still performs well, though I might need to implement parallel processing for extremely long texts."
  },
  {
    title: "Grateful for Progress",
    content: "Looking back at the code I wrote two weeks ago, the progress is clear. The system is so much more stable now. The memory engine is finally doing what it's supposed to do. I feel grateful for the tools and frameworks available to developers today. Building something like Debo would have taken months just a few years ago."
  },
  {
    title: "Reflecting on One Year",
    content: "It's been exactly a year since I started working on AI-driven apps. My first project was a simple chatbot, and now I'm building a complex memory-augmented journal. The learning curve has been steep, but incredibly rewarding. Debo is the culmination of everything I've learned about Next.js, Cloudflare, and Vector DBs."
  }
];

async function seedJournals() {
  console.log("Starting journal seeding...");

  try {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, "shaswatraj3@gmail.com")
    });

    if (!foundUser) {
      console.error("User shaswatraj3@gmail.com not found. Seed the user first.");
      process.exit(1);
    }

    console.log(`Seeding 21 journals for user: ${foundUser.email}`);

    // Batch insert for efficiency
    const journalEntries = SEED_DATA.map((data, index) => ({
      id: crypto.randomUUID(),
      userId: foundUser.id,
      title: data.title,
      content: data.content,
      // Spread them across the last month
      createdAt: new Date(Date.now() - (21 - index) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - (21 - index) * 24 * 60 * 60 * 1000)
    }));

    await db.insert(journals).values(journalEntries);

    console.log(`Successfully seeded ${journalEntries.length} journals.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed journals:", error);
    process.exit(1);
  }
}

seedJournals();
