import { existsSync } from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "out");
const docsDir = path.join(projectRoot, "docs");
const tempRoot = path.join(projectRoot, ".static-export-build");
const tempOutDir = path.join(tempRoot, "out");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const materialDir = path.join(projectRoot, "..", "material");

async function prepareTempProject() {
  if (existsSync(tempRoot)) {
    await rm(tempRoot, { recursive: true, force: true });
  }

  await mkdir(tempRoot, { recursive: true });

  const entriesToCopy = [
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "next-env.d.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "eslint.config.mjs",
  ];

  for (const entry of entriesToCopy) {
    const source = path.join(projectRoot, entry);

    if (!existsSync(source)) {
      continue;
    }

    const destination = path.join(tempRoot, entry);
    await cp(source, destination, {
      recursive: true,
      filter: (sourcePath) => {
        const normalized = sourcePath.replace(/\\/g, "/");
        return !normalized.includes("/src/app/api");
      },
    });
  }
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [nextBin, "build"],
      {
        cwd: tempRoot,
        stdio: "inherit",
        env: {
          ...process.env,
          STATIC_EXPORT: "1",
          LESSON_MATERIAL_DIR: materialDir,
        },
      },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Static export build failed with exit code ${code ?? "unknown"}.`));
    });
  });
}

async function copyOutToDocs() {
  if (existsSync(docsDir)) {
    await rm(docsDir, { recursive: true, force: true });
  }

  await mkdir(docsDir, { recursive: true });
  await cp(tempOutDir, docsDir, { recursive: true });
}

async function main() {
  try {
    if (existsSync(outDir)) {
      await rm(outDir, { recursive: true, force: true });
    }

    await prepareTempProject();
    await runNextBuild();
    await copyOutToDocs();
  } finally {
    if (existsSync(tempRoot)) {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});