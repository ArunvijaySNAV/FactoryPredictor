import { createClient } from "@insforge/sdk";
import projectConfig from "../../../.insforge/project.json";

export const insforge = createClient({
  baseUrl: projectConfig.oss_host,
  anonKey: projectConfig.api_key,
  isServerMode: true,
  timeout: 30000
});

