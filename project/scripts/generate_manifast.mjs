// Node 20+
// 用法：node .github/scripts/build-manifest.mjs --root docs --base "/<repo>/"
// 用户站点(根域)则 --base "/"
import { promises as fs } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).map((v,i,a)=> v.startsWith("--") ? [v.slice(2), a[i+1]]:[]).filter(Boolean)
);
const ROOT  = args.root || "data/database";
const BASE  = (args.base || "/").replace(/\/?$/, "/");
const BUILD = (process.env.BUILD_SHA || "").slice(0,8);

const isDir = async p => { try { return (await fs.stat(p)).isDirectory(); } catch { return false; } };
const list  = async p => { try { return await fs.readdir(p); } catch { return []; } };
const toPosix = rel => rel.split(path.sep).join("/");

function fileUrl(relPosix){
  const u = BASE.replace(/\/+$/,"") + "/" + relPosix.replace(/^\/+/,"");
  return encodeURI(u) + (BUILD ? `?v=${BUILD}` : "");
}
async function sha256(file){
  return await new Promise((resolve,reject)=>{
    const h = createHash("sha256");
    createReadStream(file).on("data",d=>h.update(d)).on("end",()=>resolve(h.digest("hex"))).on("error",reject);
  });
}

async function manifestForFiles(rootAbs, dirAbs){
  const names = (await list(dirAbs)).filter(n=>/\.xlsx$/i.test(n));
  const items = [];
  let latest = 0;
  for(const name of names){
    const abs = path.join(dirAbs, name);
    const st = await fs.stat(abs);
    latest = Math.max(latest, st.mtimeMs);
    const rel = path.relative(rootAbs, abs);
    items.push({
      name,
      path: toPosix(rel),
      url:  fileUrl(toPosix(rel)),
      size: st.size,
      sha256: await sha256(abs),
      lastModified: new Date(st.mtimeMs).toISOString(),
    });
  }
  return {
    updatedAt: new Date(latest || Date.now()).toISOString(),
    files: items.sort((a,b)=>a.name.localeCompare(b.name)),
  };
}

async function build(){
  const rootAbs = path.resolve(ROOT);
  const dbRoot  = path.join(rootAbs, "database_v1");
  if(!(await isDir(dbRoot))) throw new Error(`Not found: ${dbRoot}`);

  const index = { base: BASE, build: BUILD, latest: null, stages: [] };
  const latestCandidates = [];

  // 找所有 stage_x 目录
  const stageDirs = (await list(dbRoot))
    .map(n => path.join(dbRoot, n))
    .filter(async p => await isDir(p));

  for (const sdir of stageDirs){
    if(!(await isDir(sdir))) continue;
    const stageName = path.basename(sdir); // e.g. stage_1

    // 判断是“直接放文件”还是“有版本子目录”
    const entries = await list(sdir);
    const versionDirs = [];
    let hasXlsxHere = false;

    for(const n of entries){
      const p = path.join(sdir, n);
      if (await isDir(p)) {
        // 认为是一个版本目录（命名随意，比如 v1 / 2025-09-27）
        versionDirs.push(p);
      } else if (/\.xlsx$/i.test(n)) {
        hasXlsxHere = true;
      }
    }

    const stageEntry = { name: stageName, updatedAt: null, type: null, manifest: null, versions: [] };

    if (hasXlsxHere) {
      // 直接文件：写 stage 级 manifest.json
      const mf = await manifestForFiles(rootAbs, sdir);
      stageEntry.updatedAt = mf.updatedAt;
      stageEntry.type = "files";
      const out = path.join(sdir, "manifest.json");
      await fs.writeFile(out, JSON.stringify({ stage: stageName, ...mf }, null, 2));
      stageEntry.manifest = toPosix(path.relative(rootAbs, out));
      latestCandidates.push({ stage: stageName, version: null, manifest: stageEntry.manifest, updatedAt: mf.updatedAt });
    }

    if (versionDirs.length){
      // 为每个版本写 manifest，并写一个 stage 索引
      const vers = [];
      for (const vdir of versionDirs){
        const vname = path.basename(vdir);
        const mf = await manifestForFiles(rootAbs, vdir);
        const out = path.join(vdir, "manifest.json");
        await fs.writeFile(out, JSON.stringify({ stage: stageName, version: vname, ...mf }, null, 2));
        vers.push({ name: vname, manifest: toPosix(path.relative(rootAbs, out)), updatedAt: mf.updatedAt });
        latestCandidates.push({ stage: stageName, version: vname, manifest: toPosix(path.relative(rootAbs, out)), updatedAt: mf.updatedAt });
      }
      vers.sort((a,b)=> a.name.localeCompare(b.name));
      // stage 索引
      const stageIdxPath = path.join(sdir, "manifest.json");
      const latestV = [...vers].sort((a,b)=> a.updatedAt < b.updatedAt ? 1 : -1)[0] || null;
      const stageIdx = { stage: stageName, type: "versions", latest: latestV, versions: vers };
      await fs.writeFile(stageIdxPath, JSON.stringify(stageIdx, null, 2));

      stageEntry.type = "versions";
      stageEntry.versions = vers;
      stageEntry.manifest = toPosix(path.relative(rootAbs, stageIdxPath));
      stageEntry.updatedAt = latestV?.updatedAt || null;
    }

    index.stages.push(stageEntry);
  }

  // 选出全局 latest
  latestCandidates.sort((a,b)=> a.updatedAt < b.updatedAt ? 1 : -1);
  index.latest = latestCandidates[0] || null;

  // 总索引
  const outIndex = path.join(rootAbs, "database-index.json");
  await fs.writeFile(outIndex, JSON.stringify(index, null, 2));
  console.log(`Wrote ${outIndex}`);
}

build().catch(e=>{ console.error(e); process.exit(1); });
