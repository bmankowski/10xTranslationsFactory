import { createClient } from "@supabase/supabase-js";

export async function seedTestData() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("🌱 Starting test data seeding...");

    // Get or create test user
    const testEmail = "bmankowski@gmail.com";
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    let testUser = userData?.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.log("Creating test user...");
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: "Test123",
        email_confirm: true,
      });
      
      if (createUserError) {
        throw new Error(`Failed to create test user: ${createUserError.message}`);
      }
      testUser = newUser.user;
    }

    if (!testUser) {
      throw new Error("Test user not found or created");
    }

    console.log(`✅ Test user ready: ${testUser.email} (${testUser.id})`);

    // Get language and proficiency level IDs
    const { data: languages, error: langError } = await supabase
      .from("languages")
      .select("*")
      .eq("code", "en")
      .single();

    if (langError || !languages) {
      throw new Error("English language not found in database");
    }

    const { data: proficiencyLevels, error: profError } = await supabase
      .from("proficiency_levels")
      .select("*")
      .eq("name", "intermediate")
      .single();

    if (profError || !proficiencyLevels) {
      throw new Error("Intermediate proficiency level not found in database");
    }

    // Create test exercise
    const testText = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: testUser.id,
      title: "Test Exercise: The Great Adventure",
      content: `Once upon a time, in a small village nestled between rolling hills and a crystal-clear river, there lived a young woman named Emma. Emma was known throughout the village for her curiosity and adventurous spirit. She spent her days exploring the nearby forests and climbing the ancient oak trees that dotted the landscape.

One morning, Emma discovered an old map hidden in her grandmother's attic. The map showed a path leading to a mysterious cave deep in the mountains. Legend had it that the cave contained a treasure that could grant one wish to whoever found it.

Excited by the possibility of adventure, Emma packed her backpack with supplies: water, food, a flashlight, and a warm blanket. She told her best friend Marcus about her plan, and he decided to join her on this exciting journey.

Together, they set off early the next morning, following the winding path marked on the ancient map. The journey was challenging but beautiful, with stunning views of the valley below and colorful wildflowers lining the trail.`,
      language_id: languages.id,
      proficiency_level_id: proficiencyLevels.id,
      topic: "Adventure Story",
      visibility: "public" as const,
      word_count: 185,
      is_deleted: false,
    };

    // Insert or update the test text
    const { error: textError } = await supabase
      .from("texts")
      .upsert(testText);

    if (textError) {
      throw new Error(`Failed to create test text: ${textError.message}`);
    }

    console.log("✅ Test exercise created");

    // Create test questions
    const testQuestions = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        text_id: testText.id,
        content: "What was Emma known for in the village?",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        text_id: testText.id,
        content: "Where did Emma find the old map?",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        text_id: testText.id,
        content: "What did the legend say about the cave?",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        text_id: testText.id,
        content: "Who joined Emma on her journey?",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        text_id: testText.id,
        content: "What supplies did Emma pack for the journey?",
      },
    ];

    // Delete existing questions for this text and insert new ones
    await supabase
      .from("questions")
      .delete()
      .eq("text_id", testText.id);

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(testQuestions);

    if (questionsError) {
      throw new Error(`Failed to create test questions: ${questionsError.message}`);
    }

    console.log("✅ Test questions created");
    console.log("🎉 Test data seeding completed successfully!");

    return {
      userId: testUser.id,
      textId: testText.id,
      questionIds: testQuestions.map(q => q.id),
    };

  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    throw error;
  }
}

export async function cleanupTestData() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseServiceKey) {
    console.warn("No SUPABASE_SERVICE_ROLE_KEY, skipping cleanup");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("🧹 Cleaning up test data...");
    
    // Delete test text (questions will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from("texts")
      .delete()
      .eq("id", "550e8400-e29b-41d4-a716-446655440000");

    if (error) {
      console.warn("Warning: Failed to cleanup test data:", error.message);
    } else {
      console.log("✅ Test data cleaned up");
    }
  } catch (error) {
    console.warn("Warning: Error during cleanup:", error);
  }
}

// Run seeding if called directly
if (process.argv[1]?.endsWith("seed-data.ts") || process.argv[1]?.endsWith("seed-data.js")) {
  seedTestData()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
} 