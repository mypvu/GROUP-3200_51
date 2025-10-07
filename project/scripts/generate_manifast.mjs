// Node 20+
//
// Usage:
//   node .github/scripts/build-manifest.mjs --root data/database --base "/<repo>/"
//   For a site at domain root, use: --base "/"
//   Optionally set BUILD_SHA in env to append ?v=<sha8> to generated file URLs.
//
// Layout (no extra layers):
//   <ROOT>/<version>/<stage>/*.xlsx
//
// What this script does:
// 1) Writes a manifest.json in each <version>/<stage>/ listing its .xlsx files.
// 2) Writes a version-level manifest.json in each <version>/ summarizing its stages.
// 3) Writes a top-level <ROOT>/database-index.json summarizing all versions and the global latest.

import { promises as fs } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// ----- CLI args -----
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((v, i, a) => (v.startsWith("--") ? [v.slice(2), a[i + 1]] : []))
    .filter(Boolean)
);

// Root of the database (e.g., "data/database")
const ROOT  = args.root || "data/database";
// Public base URL prefix for generated file URLs (ends with "/")
const BASE  = (args.base || "/").replace(/\/?$/, "/");
// Optional short build id for URL cache-busting
const BUILD = (process.env.BUILD_SHA || "").slice(0, 8);

// ----- helpers -----
const isDir = async (p) => {
  try { return (await fs.stat(p)).isDirectory(); }
  catch { return false; }
};

const list = async (p) => {
  try { return await fs.readdir(p); }
  catch { return []; }
};

const toPosix = (rel) => rel.split(path.sep).join("/");

function fileUrl(relPosix) {
  const u = BASE.replace(/\/+$/, "") + "/" + relPosix.replace(/^\/+/, "");
  return encodeURI(u) + (BUILD ? `?v=${BUILD}` : "");
}

async function sha256(file) {
  return await new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(file)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

/**
 * Build a manifest for all .xlsx files inside a given stage directory.
 * Returns: { updatedAt, files: [ { name, path, url, size, sha256, lastModified } ] }
 */
async function manifestForStage(rootAbs, stageAbs) {
  const names = (await list(stageAbs)).filter((n) => /\.xlsx$/i.test(n));
  const items = [];
  let latest = 0;

  for (const name of names) {
    const abs = path.join(stageAbs, name);
    const st = await fs.stat(abs);
    latest = Math.max(latest, st.mtimeMs);
    const rel = path.relative(rootAbs, abs);
    items.push({
      name,
      path: toPosix(rel),
      url: fileUrl(toPosix(rel)),
      size: st.size,
      sha256: await sha256(abs),
      lastModified: new Date(st.mtimeMs).toISOString(),
    });
  }

  return {
    updatedAt: new Date(latest || Date.now()).toISOString(),
    files: items.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function build() {
  const rootAbs = path.resolve(ROOT);
  if (!(await isDir(rootAbs))) throw new Error(`Not found: ${rootAbs}`);

  // Collect <version> directories directly under ROOT (e.g., v1, v2)
  const versionDirs = [];
  for (const n of await list(rootAbs)) {
    const p = path.join(rootAbs, n);
    if (await isDir(p)) versionDirs.push(p);
  }

  const index = { base: BASE, build: BUILD, latest: null, versions: [] };
  const latestCandidates = [];

  for (const vdir of versionDirs) {
    const versionName = path.basename(vdir);

    // Collect <stage> directories under each version (e.g., stage_1, stage_2)
    const stageDirs = [];
    for (const n of await list(vdir)) {
      const p = path.join(vdir, n);
      if (await isDir(p)) stageDirs.push(p);
    }

    const versionSummary = {
      name: versionName,
      manifest: null,     // path to <version>/manifest.json
      updatedAt: null,
      stages: [],         // array of { name, manifest, updatedAt }
    };

    // Build a stage manifest inside each stage directory
    for (const sdir of stageDirs) {
      const stageName = path.basename(sdir);
      const mf = await manifestForStage(rootAbs, sdir);

      // Write <version>/<stage>/manifest.json
      const stageManifestPath = path.join(sdir, "manifest.json");
      await fs.writeFile(
        stageManifestPath,
        JSON.stringify({ version: versionName, stage: stageName, ...mf }, null, 2)
      );

      const entry = {
        name: stageName,
        manifest: toPosix(path.relative(rootAbs, stageManifestPath)),
        updatedAt: mf.updatedAt,
      };

      versionSummary.stages.push(entry);
      latestCandidates.push({
        version: versionName,
        stage: stageName,
        manifest: entry.manifest,
        updatedAt: mf.updatedAt,
      });
    }

    // Sort stages by name for stable output
    versionSummary.stages.sort((a, b) => a.name.localeCompare(b.name));

    // Determine the latest stage within this version
    const latestStage =
      [...versionSummary.stages].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0] || null;

    versionSummary.updatedAt = latestStage?.updatedAt || null;

    // Write <version>/manifest.json
    const versionManifestPath = path.join(vdir, "manifest.json");
    const versionManifest = {
      version: versionName,
      latest: latestStage,
      stages: versionSummary.stages,
    };
    await fs.writeFile(versionManifestPath, JSON.stringify(versionManifest, null, 2));
    versionSummary.manifest = toPosix(path.relative(rootAbs, versionManifestPath));

    // Add to top-level index
    index.versions.push(versionSummary);
  }

  // Sort versions by name (lexical). If you prefer newest by mtime, sort by updatedAt instead.
  index.versions.sort((a, b) => a.name.localeCompare(b.name));

  // Compute global latest across all (version, stage) pairs
  latestCandidates.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  index.latest = latestCandidates[0] || null;

  // Write <ROOT>/database-index.json
  const outIndex = path.join(rootAbs, "database-index.json");
  await fs.writeFile(outIndex, JSON.stringify(index, null, 2));
  console.log(`Wrote ${outIndex}`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
