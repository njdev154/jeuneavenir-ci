import { copyFile, lstat, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowedDirectories = ["assets", "css", "data", "js"];
const allowedExtensions = {
  assets: new Set([".avif", ".gif", ".jpeg", ".jpg", ".mp4", ".png", ".svg", ".webm", ".webp", ".woff", ".woff2"]),
  css: new Set([".css"]),
  data: new Set([".json"]),
  js: new Set([".js"])
};

async function copyAllowedFiles(sourceDirectory, destinationDirectory, extensions) {
  await mkdir(destinationDirectory, { recursive: true });

  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    const sourcePath = path.join(sourceDirectory, entry.name);
    const destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isSymbolicLink()) {
      throw new Error(`Le site public ne peut pas inclure de lien symbolique : ${sourcePath}`);
    }

    if (entry.isDirectory()) {
      await copyAllowedFiles(sourcePath, destinationPath, extensions);
      continue;
    }

    if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      await copyFile(sourcePath, destinationPath);
    }
  }
}

export async function buildPublicSite(outputDirectory = path.join(projectRoot, "dist")) {
  const resolvedOutput = path.resolve(outputDirectory);
  if (resolvedOutput === projectRoot) {
    throw new Error("Le répertoire de publication ne peut pas être la racine du dépôt.");
  }

  try {
    const existingOutput = await lstat(resolvedOutput);
    if (!existingOutput.isDirectory() || existingOutput.isSymbolicLink()) {
      throw new Error(`Le chemin de publication doit être un dossier normal : ${resolvedOutput}`);
    }
    await rm(resolvedOutput, { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  await mkdir(resolvedOutput, { recursive: true });

  const rootEntries = await readdir(projectRoot, { withFileTypes: true });
  const pages = rootEntries.filter(entry => entry.isFile() && entry.name.endsWith(".html"));
  if (!pages.some(page => page.name === "index.html")) {
    throw new Error("La page d'accueil index.html est introuvable.");
  }

  for (const page of pages) {
    await copyFile(path.join(projectRoot, page.name), path.join(resolvedOutput, page.name));
  }

  for (const directory of allowedDirectories) {
    await copyAllowedFiles(
      path.join(projectRoot, directory),
      path.join(resolvedOutput, directory),
      allowedExtensions[directory]
    );
  }

  console.log(`Export public prêt : ${pages.length} pages HTML et ${allowedDirectories.length} répertoires autorisés.`);
  return resolvedOutput;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPublicSite();
}
