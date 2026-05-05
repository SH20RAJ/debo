# Contributing to Debo

First off, thank you for considering contributing to Debo! It's people like you that make Debo such a great tool.

## How Can I Contribute?

### Reporting Bugs
*   Check the [Issues](https://github.com/SH20RAJ/debo/issues) to see if the bug has already been reported.
*   If not, open a new issue. Include as much detail as possible, including steps to reproduce, expected behavior, and actual behavior.

### Suggesting Enhancements
*   Open a new issue with the tag "enhancement".
*   Explain the feature you'd like to see and why it would be useful.

### Pull Requests
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Make your changes.
4.  Ensure your code follows the project's style (TypeScript, functional components, Tailwind v4).
5.  Commit your changes (`git commit -m 'Add some amazing feature'`).
6.  Push to the branch (`git push origin feature/amazing-feature`).
7.  Open a Pull Request.

## Development Setup

### Prerequisites
*   [Bun](https://bun.sh/)
*   A [Neon](https://neon.tech/) database (for Postgres)
*   [Stack Auth](https://stack-auth.com/) account
*   [NVIDIA NIM](https://build.nvidia.com/explore/discover) API Key (for LLM inference)

### Setup Steps
1.  Clone your fork.
2.  `bun install`
3.  `cp .env.example .env.local` and fill in your keys.
4.  `bun run db:push` to sync your database schema.
5.  `bun run dev` to start the development server.

## Code of Conduct
This project and everyone participating in it is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
