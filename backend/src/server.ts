import { createServer } from "node:http";
import { createApp } from "./app";
import { hydrateStoreFromInsforge } from "./data/insforgeRepository";
import { registerWebSocket } from "./websocket";

const port = 4001;
const app = createApp();
const server = createServer(app);

registerWebSocket(server);

async function start() {
  try {
    await hydrateStoreFromInsforge();
  } catch (error) {
    console.error("InsForge hydration failed. Starting with empty runtime telemetry state.");
    console.error(error);
  }

  server.listen(port, () => {
    console.log("Backend running on http://127.0.0.1:4001");
  });
}

server.on("error", (error) => {
  console.error("Backend failed to start on http://127.0.0.1:4001");
  console.error(error);
  process.exit(1);
});

void start();
