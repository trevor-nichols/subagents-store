#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const buildScript = resolve(repoRoot, "scripts/build-catalog.mjs");
const outputA = resolve(repoRoot, "dist/repro-a");
const outputB = resolve(repoRoot, "dist/repro-b");

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function runBuild(outputPath) {
  const args = [
    buildScript,
    "--repo",
    "trevor-nichols/subagents-store",
    "--tag",
    "v0.0.0-repro",
    "--output",
    outputPath,
    "--no-write-tracked",
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function listFilesRecursively(rootPath, relativeDir = "") {
  const currentPath = relativeDir ? resolve(rootPath, relativeDir) : rootPath;
  const entries = readdirSync(currentPath, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const files = [];

  for (const entry of entries) {
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(rootPath, relativePath));
      continue;
    }
    if (entry.isFile()) {
      files.push(relativePath);
      continue;
    }
    fail(`Unsupported file type in ${rootPath}: ${relativePath}`);
  }

  return files;
}

function sha256File(path) {
  const hash = createHash("sha256");
  hash.update(readFileSync(path));
  return hash.digest("hex");
}

function compareArtifacts(pathA, pathB) {
  if (!existsSync(pathA)) {
    fail(`Missing first build output at ${pathA}`);
  }
  if (!existsSync(pathB)) {
    fail(`Missing second build output at ${pathB}`);
  }

  const filesA = listFilesRecursively(pathA);
  const filesB = listFilesRecursively(pathB);
  const joinedA = filesA.join("\n");
  const joinedB = filesB.join("\n");
  if (joinedA !== joinedB) {
    fail(`Build outputs contain different files.\nA:\n${joinedA}\n\nB:\n${joinedB}`);
  }

  for (const relativePath of filesA) {
    const hashA = sha256File(resolve(pathA, relativePath));
    const hashB = sha256File(resolve(pathB, relativePath));
    if (hashA !== hashB) {
      fail(
        `Non-deterministic output for ${relativePath}.\nFirst:  ${hashA}\nSecond: ${hashB}`,
      );
    }
  }
}

function main() {
  rmSync(outputA, { recursive: true, force: true });
  rmSync(outputB, { recursive: true, force: true });

  try {
    runBuild(outputA);
    runBuild(outputB);
    compareArtifacts(outputA, outputB);
    console.log("Reproducibility check passed: two independent builds produced identical artifacts.");
  } finally {
    rmSync(outputA, { recursive: true, force: true });
    rmSync(outputB, { recursive: true, force: true });
  }
}

main();
