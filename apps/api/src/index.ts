import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

serve({ fetch: app.fetch, port, hostname: host }, (info) => {
  console.log(`MonoDiary API listening on http://${info.address}:${info.port}`);
});
