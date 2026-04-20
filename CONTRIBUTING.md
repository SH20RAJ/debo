# Contributing to Debo

First off, thank you for considering contributing to Debo! We value community contributions and strive to make this process as smooth as possible.

## 🚀 How to Contribute
1. Fork the repository and create your branch from `main`.
2. Follow the codebase architecture outlined in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
3. If you've modified Next.js or Cloudflare code, run tests and ensure the Next.js build passes.
4. Issue a Pull Request clearly explaining your change.

## 🛠 Guidelines
* Keep PRs concise. One logical change per PR.
* Write components modularly. Keep `page.tsx` and `layout.tsx` strictly server components; push interactive state to client components deeper in the tree.
* Avoid custom CSS unless absolutely necessary; utilize pure Tailwind V4 / Shadcn utilities.

## 💡 Reporting Bugs
If you find a bug, please create an Issue using the GitHub issue tracker. Ensure you include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Browser, Node version)
