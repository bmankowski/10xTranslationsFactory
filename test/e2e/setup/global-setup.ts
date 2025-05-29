import { FullConfig } from "@playwright/test";
import { seedTestData } from "./seed-data";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Running global E2E test setup...");
  
  // Set environment variables for Supabase if not already set
  if (!process.env.PUBLIC_SUPABASE_URL) {
    process.env.PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
  }
  
  // Wait for web server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    await seedTestData();
    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
}

export default globalSetup; 