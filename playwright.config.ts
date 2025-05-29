import { defineConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

// Ensure .auth directory exists
const authDir = path.join(process.cwd(), ".auth");
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

export default defineConfig({
  testDir: "./test/e2e",
  workers: 1,
  fullyParallel: true,
  globalSetup: "./test/e2e/setup/global-setup.ts",
  globalTeardown: "./test/e2e/setup/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Start the web server before running tests
  webServer: {
    reuseExistingServer: true,
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120 * 1000,
  },
});
