import { config } from "./config.js";
import app from "./app.js";
import { SERVER_STARTUP_RETRY_DELAY_MS, SERVER_STARTUP_RETRY_MAX } from "./constants.js";

let retries = 0;
let server = null;

function startServer() {
  server = app
    .listen(config.port, () => {
      retries = 0;
      console.log(`Backend is running on port ${config.port}`);
    })
    .on("error", (error: any) => {
      if (error?.code === "EADDRINUSE" && retries < SERVER_STARTUP_RETRY_MAX) {
        retries += 1;
        console.warn(
          `Port ${config.port} is busy. Retry ${retries}/${SERVER_STARTUP_RETRY_MAX} in ${SERVER_STARTUP_RETRY_DELAY_MS}ms...`
        );

        setTimeout(() => {
          startServer();
        }, SERVER_STARTUP_RETRY_DELAY_MS);

        return;
      }

      console.error("Server startup failed:", error);
      process.exit(1);
    });
}

startServer();

process.on("SIGINT", () => {
  server?.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server?.close(() => process.exit(0));
});
