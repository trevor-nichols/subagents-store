You are working in the `agents-store` repo which is used as an AgentWorkplace sub-agent storefront.

Repository layout:

agents-store/
  catalog/
    agents.manifest.json   # Source-of-truth metadata for packaging
    stable.json            # Generated remote catalog for stable channel
    beta.json              # Generated remote catalog for beta channel
  agents/
    .curated/              # Curated agents
    .system/               # System/internal agents
    .experimental/         # Optional beta/experimental agents
  scripts/
    build-catalog.mjs      # Validate, package, hash, and generate catalogs

Rules:
1. Agent folders live under `agents/.curated/<slug>`, `agents/.system/<slug>`, or `agents/.experimental/<slug>`.
2. Each agent folder must include `config.toml`.
3. `README.md` is optional but recommended.
4. Keep `id` and `slug` stable once published.
5. Use `npm run manifest:add -- <agent-folder>` to scaffold manifest entries.
6. Run `npm run manifest:check` before commits.
7. Build release artifacts with `npm run build:catalog -- --repo <owner/repo> --tag <tag>`.

Manifest notes:
- Required: `id`, `slug`, `path`, `version`.
- Optional: `roleName`, `title`, `summary`, `shortDescription`, `description`, `icon`, `channel`, `assetName`, `readmeUrl`.
- `channel` defaults to `stable`; `agents/.experimental/*` typically map to `beta`.
