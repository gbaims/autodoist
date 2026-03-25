import { createApp } from "./src/app.ts";
import { loadConfig } from "./src/config.ts";

const config = loadConfig();
const app = createApp(config);

Deno.serve(app.fetch);
