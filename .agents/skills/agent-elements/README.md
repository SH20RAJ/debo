# Agent Elements skill

Source for the `21st-dev/agent-elements` skill referenced on
[https://agent-elements.21st.dev/docs/skills](https://agent-elements.21st.dev/docs/skills).

A **skill** is a bundle of project-aware context an AI assistant (Claude Code,
Cursor, etc.) loads when it detects an Agent Elements project, so it picks the
right components, prop shapes, and composition patterns instead of
hallucinating.

## Files

- [`SKILL.md`](./SKILL.md) — the skill content. YAML frontmatter at the top is
  the canonical Claude Code / skills.sh format: `name` + `description` drive
  when the skill is triggered, the markdown body is loaded as context.

## Distribution

The [skills.sh](https://skills.sh) CLI (maintained by{" "}
[vercel-labs/skills](https://github.com/vercel-labs/skills)) identifies skills
by GitHub `<owner>/<repo>`, so the install command is:

```bash
npx skills add 21st-dev/agent-elements
```

The CLI searches standard locations (`skills/`, root `SKILL.md`,
`.claude/skills/`, etc.) recursively — because our bundle lives at
`skills/agent-elements/SKILL.md` inside this repo, nothing extra is needed
beyond having the file committed and pushed to GitHub. Once the repo is
public, `npx skills add 21st-dev/agent-elements` drops `SKILL.md` into
`~/.claude/skills/agent-elements/` (or the equivalent path for other
assistants).

To appear in the [skills.sh](https://skills.sh) directory (leaderboard,
search), follow their author onboarding — the CLI install works regardless.

## Manual install for Claude Code

You can install this skill without the CLI:

```bash
mkdir -p ~/.claude/skills/agent-elements
curl -L https://raw.githubusercontent.com/21st-dev/agent-elements/main/skills/agent-elements/SKILL.md \
  -o ~/.claude/skills/agent-elements/SKILL.md
```

Claude Code picks it up on the next start (see the
[Claude Code skills docs](https://docs.claude.com/en/docs/claude-code/skills)).

## Maintenance

Keep [`SKILL.md`](./SKILL.md) in sync with:

- The component catalog in
  [`app/data/component-docs.ts`](../../app/data/component-docs.ts).
- The post-install target paths in
  [`scripts/build-registry.mts`](../../scripts/build-registry.mts) — if those
  change, the `Paths` section here must follow.
- The import table in
  [`app/data/component-docs.ts`](../../app/data/component-docs.ts)
  (`COMPONENT_IMPORT_PATH`).
