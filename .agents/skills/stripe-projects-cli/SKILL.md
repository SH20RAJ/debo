---
name: stripe-projects-cli
description: Use the Stripe Projects CLI in this repository to manage deploying and access to third party services.
---

# Stripe Projects CLI

This repository is initialized for the Stripe project "debo".

# Workflow
0. Run `stripe projects llm-context` to get the LLM context for the project.
1. Start with `stripe projects status` or `stripe projects show` to inspect the current project, linked providers, and named resources.
2. Use `stripe projects catalog` or `stripe projects services` to browse available providers and services. When you know the provider, run `stripe projects catalog <provider> --json` or `stripe projects catalog <provider>` and copy the exact `<provider>/<service>` slug from the output.
3. Provision a resource with `stripe projects add <provider>/<service>`. Do not guess the `stripe projects add` argument. Run `stripe projects catalog <provider> --json` or `stripe projects catalog <provider>` and copy the exact `<provider>/<service>` slug before you run `stripe projects add`. Example: `stripe projects add databaseco/postgres --name primary-db`. Use `--name <resource>` to control the local resource name used by future resource commands and environment variable prefixes. If you omit `--name`, the CLI uses the provider/service default for the local resource name. When a service config field looks like a name, the CLI uses the current project name as the default value when that satisfies the field schema. Use `--config '<json>'` when the service requires configuration.
4. Review credentials with `stripe projects env`. Values are redacted by default, and you can use `stripe projects env --pull` to write them to local files.

## Optional notes
* If necessary, you can also link a provider with `stripe projects link <provider>` directly. But `stripe projects add <provider>/<service>` will guide you through provider authentication when needed.

# Working Agreement
- Commands can be run from the project root or nested directories inside the project.
- Do not hand-edit CLI-managed files under `.projects` or the generated `.env` output.
- NEVER look at any files in the .projects directory. The CLI manages everything for you.
- NEVER look at the .env file. The CLI manages everything for you.

# Agent mode
- You can use the `--json` flag when structured output will make follow-up steps easier.
- When you need to build a provisioning command programmatically, prefer `stripe projects catalog <provider> --json` so you can copy the exact `<provider>/<service>` slug without guessing.
- Use `--no-interactive` to disable prompts across commands. When you do, pass fully specified arguments and companion flags like `--yes` or `--accept-tos` when the command requires confirmation.

# Full command reference
- `stripe projects status` — view project, providers, and services
- `stripe projects catalog [provider]` — browse available services (optionally for one provider) and copy exact `provider/service` slugs
- `stripe projects add <provider>/<service>` — provision a service
- `stripe projects add databaseco/postgres --name primary-db` — example add command you can copy and adapt
    - `--name <resource>` — custom local resource name for future commands and env var prefixes
    - `--config '<json>'` — service configuration that can be passed with `projects add`
    - `--provider-config '<json>'` — provider link configuration (e.g. region)
    - `--force-provider-relink` — force a fresh provider link request during `add`
- `stripe projects add @database` — browse services by category (interactive only)
- `stripe projects remove <resource>` — remove a provisioned resource
- `stripe projects rotate <resource>` — rotate credentials for a resource
- `stripe projects upgrade <resource>` — change a resource's service tier
- `stripe projects open <provider>` — open provider dashboard in browser
- `stripe projects link <provider>` — link/re-link a provider
- `stripe projects link <provider> --force` — force a fresh provider re-link request
- `stripe projects env` — list credentials (redacted)
- `stripe projects env --pull` — fetch credentials and write them to `.env` files
- `stripe projects llm-context` — get provider-specific LLM guidance
- `stripe projects billing show` — view billing method
- `stripe projects billing add` — add or update billing method

# Billing
If you need to deploy paid services, use `stripe projects billing add` to configure payment, or `stripe projects billing show` to view your current method.

# Deployment
If you get asked to deploy your project, copy the following files to the remote host into the project root:
* .env file
* .projects/state.json
* .projects/state.local.json

Deploying a project might require to provision a provider that offers compute or hosting, and you may need to download their CLI.

# Troubleshooting
- If a command fails, run `stripe projects status --json` to understand the current state.
- If a provider shows status `PENDING_AUTH` or `EXPIRED`, run `stripe projects link <provider>` to re-authenticate. Add `--force` if you need a fresh re-link request regardless of local state.
- If credentials seem stale, run `stripe projects rotate <resource>` then `stripe projects env --pull`.

