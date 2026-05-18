# Contributing to Debo

First off, thank you for considering contributing to Debo! We value your help in building a better Life Intelligence System.

## 🕯️ Our Philosophy: Editorial Calm

Debo is designed to be a "quietly-confident" space for reflection. When contributing UI changes:
- **Prioritize Typography**: Use large, readable headings and JetBrains Mono for metadata.
- **Warm Aesthetics**: Avoid pure whites and blacks; use the cream canvas (\`#f7f7f4\`) and warm ink (\`#26251e\`).
- **Minimal Depth**: No drop shadows. Use 1px hairlines for separation.
- **Generous Rhythm**: Maintain an 80px vertical rhythm between major sections.

## 🛠️ Development Setup

### 1. Prerequisites
- [Bun](https://bun.sh/) (Runtime & Package Manager)
- [Neon](https://neon.tech/) (Postgres Database)
- [Stack Auth](https://stack-auth.com/) (Authentication)
- [Qdrant](https://qdrant.tech/) (Vector Search)

### 2. Initial Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/debo.git
cd debo

# Install dependencies
bun install
```

### 3. Environment Variables
Each app has its own environment requirements. Copy the relevant `.env.example` files:
```bash
cp apps/app/.env.example apps/app/.env.local
cp apps/web/.env.example apps/web/.env.local
```

### 4. Database & Auth
```bash
# Sync your database schema (scoped to the db package)
bun run db:push
```

### 5. Run Development Server
```bash
# Run the main application
bun dev

# Or run specific apps
bun run dev:web
bun run dev:api
```

## 💻 Monorepo Structure

Debo uses a **Bun monorepo** to separate concerns:

- **`apps/*`**: Deployable applications (Web, App, API, Agents).
- **`packages/*`**: Shared logic and configuration used across apps.

When adding a new feature:
1. **Shared Logic**: If the logic (e.g., a new DB table or AI utility) is used by multiple apps, add it to the corresponding package in `packages/`.
2. **UI Components**: Add shared components to `packages/ui`.
3. **App Logic**: Add app-specific routes, actions, or components to the relevant app in `apps/`.

- **React 19 & Next.js 16**: Use functional components, Server Components by default, and Server Actions for data mutations.
- **TypeScript**: Strict type safety is required. Avoid \`any\`.
- **Styling**: Tailwind CSS v4. Stick to the design tokens defined in \`tailwind.config.ts\`.
- **Orchestration**: Agent logic should be added to \`src/mastra/agents\` and tools to \`src/mastra/tools\`.
- **Database**: Use Drizzle ORM for all database operations.

## 🌿 Branching & PRs

1. Create a branch: \`git checkout -b feat/your-feature-name\` or \`fix/bug-name\`.
2. Make your changes and ensure they follow the design philosophy.
3. Run linting: \`bun run lint\`.
4. Open a Pull Request against the \`main\` branch.
5. Provide a clear description and screenshots (for UI changes).

## 🚩 Reporting Issues

- **Bug Reports**: Provide steps to reproduce, expected vs. actual behavior, and environment details.
- **Feature Requests**: Explain the "Why" and "How" it fits into the Life Intelligence System.

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
