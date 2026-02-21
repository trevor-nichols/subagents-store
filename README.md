# Agents Store

Public distribution repo for AgentWorkplace sub-agents.

This repo is designed for the current AgentWorkplace agents storefront flow:
- Frontend loads one or more remote `catalog.json` URLs.
- Backend fetches entries, validates package hashes, and installs agents into `CODEX_HOME/agents/<slug>/config.toml`.

## Repository layout

```text
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
```

## Add an agent

1. Add your agent folder under one of:
   - `agents/.curated/<slug>/`
   - `agents/.system/<slug>/`
   - `agents/.experimental/<slug>/`
2. Ensure each agent directory contains `config.toml`.
3. Optionally add `README.md`.
4. Add a manifest scaffold entry:

```bash
npm run manifest:add -- agents/.curated/<slug>
```

5. Update manifest metadata as needed (`version`, `summary`, `description`, `icon`, `roleName`).
6. Run validation:

```bash
npm run manifest:check
npm run verify:repro
```

## Manifest format

`catalog/agents.manifest.json` is the source of truth. Example:

```json
{
  "schemaVersion": 1,
  "agents": [
    {
      "id": "reviewer-agent",
      "slug": "reviewer",
      "roleName": "reviewer",
      "path": "agents/.curated/reviewer",
      "version": "1.0.0",
      "channel": "stable",
      "title": "Reviewer",
      "summary": "Security and correctness-focused code reviewer.",
      "shortDescription": "Security and correctness-focused code reviewer.",
      "description": "Find high-risk bugs, security concerns, and missing test coverage.",
      "icon": "🔍"
    }
  ]
}
```

Required:
- `id`
- `slug`
- `path`
- `version` (semver)

Optional:
- `roleName` (defaults to `slug`)
- `title` (defaults from slug)
- `summary` (defaults to `description`)
- `shortDescription` (defaults to `summary`)
- `description` (defaults to title)
- `icon` (defaults to `🤖`)
- `channel` (`stable` default, or `beta`)
- `assetName` (defaults to `<slug>-<version>.zip`)
- `readmeUrl` (optional URL surfaced in detail preview)

Manifest tooling:
- `npm run manifest:add -- <agent-dir>`: append a scaffolded entry.
- `npm run manifest:check`: fail if any `agents/*/*/config.toml` is not in the manifest.

## Build and publish

Generate ZIP assets + channel catalogs:

```bash
node scripts/build-catalog.mjs --repo <owner/repo> --tag <tag>
```

For CI/offline verification without mutating checked-in catalogs:

```bash
node scripts/build-catalog.mjs --repo <owner/repo> --tag <tag> --no-write-tracked
```

Example:

```bash
node scripts/build-catalog.mjs --repo your-org/agents-store --tag v1.0.0
```

Outputs:
- `dist/packages/*.zip`
- `dist/catalog/stable.json`
- `dist/catalog/beta.json`
- `dist/catalog/checksums.txt`
- Also updates tracked `catalog/stable.json` and `catalog/beta.json`.

Packaging is deterministic:
- Files are ordered lexicographically.
- File metadata is normalized before zipping.
- ZIPs are produced with `zip -X -0` to avoid platform-specific metadata drift.

The release workflow (`.github/workflows/release.yml`) runs on tags (`v*`), rebuilds assets, and fails if the tagged commit's tracked catalogs do not exactly match the release build output.

## AgentWorkplace configuration

Point AgentWorkplace at your hosted catalogs, for example:

```bash
VITE_AGENTS_CATALOG_URLS=https://raw.githubusercontent.com/<owner>/<repo>/main/catalog/stable.json,https://raw.githubusercontent.com/<owner>/<repo>/main/catalog/beta.json
```

Or use release assets if you prefer immutable catalog URLs per release.
