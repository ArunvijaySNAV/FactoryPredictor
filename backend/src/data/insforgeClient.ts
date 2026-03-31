import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@insforge/sdk";

type LocalProjectConfig = {
  api_key?: string;
  oss_host?: string;
};

function readLocalProjectConfig(): LocalProjectConfig | null {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const projectConfigPath = resolve(currentDirectory, "../../../.insforge/project.json");

  if (!existsSync(projectConfigPath)) {
    return null;
  }

  return JSON.parse(readFileSync(projectConfigPath, "utf8")) as LocalProjectConfig;
}

const localProjectConfig = readLocalProjectConfig();
const baseUrl = process.env.INSFORGE_OSS_HOST ?? localProjectConfig?.oss_host;
const anonKey = process.env.INSFORGE_API_KEY ?? localProjectConfig?.api_key;

if (!baseUrl || !anonKey) {
  throw new Error("InsForge configuration is missing. Set INSFORGE_OSS_HOST and INSFORGE_API_KEY.");
}

export const insforge = createClient({
  baseUrl,
  anonKey,
  isServerMode: true,
  timeout: 30000
});
