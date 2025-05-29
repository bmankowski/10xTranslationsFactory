import { FullConfig } from "@playwright/test";
import { cleanupTestData } from "./seed-data";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Running global E2E test teardown...");
  
  try {
    // Skip cleanup for now to let test data persist across test files
    // await cleanupTestData();
    console.log("✅ Global teardown completed successfully (cleanup skipped)");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw - teardown failures shouldn't break the build
  }
}

export default globalTeardown; 