import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { journals, user } from '../db/schema';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

const sampleJournals = [
  { title: "Monday Morning", content: "Started the week with a strong coffee. The commute was unusually smooth today. Had a productive meeting about the new project. Feeling optimistic." },
  { title: "Grocery Run", content: "Stopped by the store on the way home. Forgot the milk, as usual. Picked up some fresh basil for the pasta tonight. The store was packed." },
  { title: "Evening Walk", content: "Took a long walk around the neighborhood. The air is starting to feel like autumn. Saw a beautiful sunset over the park." },
  { title: "Work Frustrations", content: "Spent three hours debugging a simple issue. Turned out to be a typo in the config file. Typical Tuesday. At least it's fixed now." },
  { title: "Dinner with Sarah", content: "Met Sarah for Thai food. We talked about her upcoming trip to Japan. I'm a bit jealous, but happy for her. The green curry was spicy!" },
  { title: "Lazy Sunday", content: "Spent the whole morning reading. Didn't even change out of my pajamas until noon. It was exactly what I needed after a busy week." },
  { title: "Gym Session", content: "Hit the gym for the first time in two weeks. My muscles are going to be so sore tomorrow. But it felt good to move." },
  { title: "Rainy Afternoon", content: "Stuck inside because of the heavy rain. Listened to some jazz and caught up on emails. There's something cozy about the sound of rain on the roof." },
  { title: "Cooking Experiment", content: "Tried making sourdough bread for the first time. It didn't rise as much as I hoped, but it still tasted okay with some salted butter." },
  { title: "Movie Night", content: "Watched that new sci-fi movie everyone's talking about. The visuals were stunning, but the plot was a bit confusing. Still, a good distraction." },
  { title: "Cleaning Day", content: "Finally tackled the spare room. Found a box of old photos from college. Spent way too much time reminiscing instead of cleaning." },
  { title: "Coffee Date", content: "Quick coffee with Mark. He's starting a new job next month. He seems excited but nervous. We promised to catch up more often." },
  { title: "Gardening Progress", content: "The tomatoes are finally starting to turn red! The peppers are still small, but the herbs are thriving. Gardening is surprisingly therapeutic." },
  { title: "Busy Thursday", content: "Back-to-back meetings all day. Barely had time for lunch. Feeling pretty drained tonight. Looking forward to the weekend." },
  { title: "Art Gallery Visit", content: "Went to the local gallery after work. There was an interesting exhibit on modern photography. Some of the portraits were really powerful." },
  { title: "Breakfast Ritual", content: "I love the quiet of the house in the morning before everyone else wakes up. Just me, my oatmeal, and the news. It's my favorite part of the day." },
  { title: "Weekend Trip", content: "Drove out to the coast for the day. The ocean was grey and choppy, but the walk on the beach was refreshing. Had fish and chips for lunch." },
  { title: "New Hobby?", content: "Bought a set of watercolors today. I haven't painted since high school. Let's see if I still have any skill. It's just for fun." },
  { title: "Family Call", content: "Called my parents. They're doing well. Mom is busy with her garden, and Dad is still obsessed with his crossword puzzles. Same as always." },
  { title: "Morning Run", content: "Managed to get out for a run before the sun got too high. The park was full of dog walkers. Feeling energized for the day ahead." },
  { title: "Late Night Coding", content: "Got into a flow state tonight. Managed to finish the feature I've been working on. There's something about the quiet of the night that helps me focus." },
  { title: "Library Trip", content: "Returned a bunch of overdue books and picked up a few new ones. I think I have enough reading material to last me the rest of the month." },
  { title: "Small Wins", content: "Finally fixed the leaky faucet in the kitchen. It's been bothering me for weeks. It's amazing how much better I feel now that it's done." },
  { title: "Lunch with Colleagues", content: "Went to that new sandwich shop with the team. The food was great, but the service was a bit slow. We ended up being late for our afternoon meeting." },
  { title: "Sunset at the Lake", content: "Drove down to the lake to watch the sunset. The water was like glass. It was so peaceful. I really need to do this more often." },
  { title: "Baking Cookies", content: "Made a batch of chocolate chip cookies. The house smells amazing. I might have eaten a bit too much cookie dough, though." },
  { title: "Organizing the Bookshelf", content: "Spent the afternoon re-organizing my books by color. It looks much more aesthetic now, even if it's harder to find things." },
  { title: "Planning the Garden", content: "Started sketching out ideas for the spring garden. I want to add more flowers this year to attract bees and butterflies." },
  { title: "Meditation Session", content: "Tried a guided meditation this morning. It was hard to keep my mind from wandering, but I felt a bit calmer afterwards." },
  { title: "Repairing the Fence", content: "Spent the morning fixing the loose board on the garden fence. It's not perfect, but it's much more secure now. Feeling productive." },
  { title: "Visit to the Farmer's Market", content: "Picked up some fresh eggs, local honey, and the most beautiful peaches. I love supporting local growers. The atmosphere was so lively." },
  { title: "Evening Reflection", content: "Sitting on the porch with a glass of tea. Thinking about how much has changed in the last year. Mostly for the better, I think." },
  { title: "Yoga Class", content: "Went to a beginner yoga class. I'm definitely not flexible, but I enjoyed the focus on breathing. I'll probably go back next week." },
  { title: "Sorting Old Clothes", content: "Finally went through my closet and pulled out everything I haven't worn in a year. Dropped two big bags off at the donation center." },
  { title: "New Recipe Success", content: "Made a Moroccan tagine tonight. It was full of flavor and actually turned out exactly like the photo in the cookbook. A rare success!" },
  { title: "Early Night", content: "Feeling a bit under the weather. Decided to skip the party and just go to bed early with a cup of tea and a good book. Hopefully I'll feel better tomorrow." },
  { title: "Commute Observations", content: "Noticed a new mural being painted on the side of the old warehouse. It's really bright and colorful. It's nice to see some art in the industrial area." },
  { title: "Desk Organization", content: "Cleaned off my workspace. It's amazing how much easier it is to focus when there isn't a pile of random papers staring at me." },
  { title: "Unexpected Phone Call", content: "Got a call from an old friend I haven't spoken to in years. We talked for over an hour. It was so good to hear his voice and catch up on everything." },
  { title: "Morning Mist", content: "The valley was completely filled with mist this morning. It looked like a scene from a movie. I wish I had my camera with me." },
  { title: "Productive Saturday", content: "Got through my entire to-do list! Laundry, groceries, cleaning, and even squeezed in some time for my hobby. Feeling very accomplished." },
  { title: "Quiet Evening", content: "Just sitting by the fire with a book. The house is so still. It's the perfect way to end a long week." }
];

async function seed() {
  try {
    // 1. Get the first user
    const users = await db.select().from(user).limit(1);
    if (users.length === 0) {
      console.error("No users found in database. Please create a user first.");
      return;
    }
    const userId = users[0].id;
    console.log(`Seeding journals for user: ${users[0].name} (${userId})`);

    // 2. Insert journals
    for (const j of sampleJournals) {
      await db.insert(journals).values({
        id: uuidv4(),
        userId: userId,
        title: j.title,
        content: j.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`Successfully seeded ${sampleJournals.length} journals.`);
  } catch (error) {
    console.error("Error seeding journals:", error);
  }
}

seed();
