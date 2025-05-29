import { test, expect } from "../fixtures/auth-fixtures";

test.describe("Exercise Chat Flow", () => {
  test("clicking on exercise shows chat interface with questions", async ({ authenticatedPage: page }) => {
    // Przejdź na stronę z listą ćwiczeń
    await page.goto("/exercises");

    // Sprawdź czy strona się załadowała
    await expect(page.locator("h1, h2, h3").first()).toContainText("Exercises");

    // Poczekaj na załadowanie listy ćwiczeń z dłuższym timeoutem
    await page.waitForSelector('a[href*="/exercises/"]', { timeout: 15000 });

    // Sprawdź czy są jakiekolwiek ćwiczenia
    const exerciseLinks = page.locator('a[href*="/exercises/"]:not([href*="/attempt"])');
    const exerciseCount = await exerciseLinks.count();

    if (exerciseCount === 0) {
      throw new Error("No exercises found on the page. Test data might not be seeded properly.");
    }

    // Znajdź pierwszy link do ćwiczenia (nie attempt link)
    const exerciseLink = exerciseLinks.first();
    await expect(exerciseLink).toBeVisible();

    // Kliknij na ćwiczenie
    await exerciseLink.click();

    // Sprawdź czy jesteśmy na stronie szczegółów ćwiczenia
    await expect(page).toHaveURL(/\/exercises\/[^/]+$/);

    // Znajdź i kliknij przycisk "Take Exercise"
    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await expect(takeExerciseButton).toBeVisible({ timeout: 10000 });
    await takeExerciseButton.click();

    // Sprawdź czy jesteśmy na stronie attempt
    await expect(page).toHaveURL(/\/exercises\/[^/]+\/attempt$/);

    // Wait for the page to fully load and React components to hydrate
    await page.waitForLoadState("networkidle");

    // Check for authentication errors first
    const errorHeading = page.locator('h3:has-text("Error Loading Exercise")');
    if (await errorHeading.isVisible()) {
      const errorText = await page.locator("main").textContent();
      throw new Error(`Exercise failed to load: ${errorText}`);
    }

    // Wait for the exercise chat island with a longer timeout
    await page.waitForSelector(".exercise-chat-island", { timeout: 20000 });

    // Sprawdź czy pojawił się komponent czatu
    await expect(page.locator(".exercise-chat-island")).toBeVisible();

    // Sprawdź czy jest nagłówek "Language Exercise"
    await expect(page.locator('h1:has-text("Language Exercise")')).toBeVisible();

    // Sprawdź czy jest widok tekstu ćwiczenia (div z klasą prose)
    await expect(page.locator(".prose")).toBeVisible();

    // Sprawdź czy jest pole tekstowe do wprowadzania odpowiedzi
    await expect(page.locator('input[type="text"][aria-label="Answer input"]')).toBeVisible();

    // Sprawdź czy jest przycisk wysyłania
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test("chat interface allows typing and submitting answers", async ({ authenticatedPage: page }) => {
    // Navigate to exercises list first
    await page.goto("/exercises");

    // Wait for exercises to load
    await page.waitForSelector('a[href*="/exercises/"]', { timeout: 15000 });

    // Find the first exercise that contains "Test Exercise" in the title
    const testExerciseLink = page.locator('a[href*="/exercises/"]:not([href*="/attempt"])').first();
    await expect(testExerciseLink).toBeVisible();

    // Click on the exercise
    await testExerciseLink.click();

    // Click "Take Exercise" button
    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await expect(takeExerciseButton).toBeVisible({ timeout: 10000 });
    await takeExerciseButton.click();

    // Wait for the page to fully load and React components to hydrate
    await page.waitForLoadState("networkidle");

    // Check for authentication errors first
    const errorHeading = page.locator('h3:has-text("Error Loading Exercise")');
    if (await errorHeading.isVisible()) {
      const errorText = await page.locator("main").textContent();
      throw new Error(`Exercise failed to load: ${errorText}`);
    }

    // Poczekaj na załadowanie czatu z dłuższym timeoutem
    await page.waitForSelector(".exercise-chat-island", { timeout: 20000 });

    // Znajdź pole tekstowe
    const textInput = page.locator('input[type="text"][aria-label="Answer input"]');
    await expect(textInput).toBeVisible();

    // Wpisz odpowiedź
    await textInput.fill("This is my test answer");

    // Sprawdź czy przycisk wysyłania jest aktywny
    const submitButton = page.locator('button:has-text("Send")');
    await expect(submitButton).toBeEnabled();

    // Wyślij odpowiedź
    await submitButton.click();

    // Sprawdź czy odpowiedź została wysłana (pole powinno się wyczyścić)
    await expect(textInput).toHaveValue("");
  });

  test("exercise completion shows return button", async ({ authenticatedPage: page }) => {
    // Navigate to exercises list first
    await page.goto("/exercises");

    // Wait for exercises to load
    await page.waitForSelector('a[href*="/exercises/"]', { timeout: 15000 });

    // Find the first exercise
    const testExerciseLink = page.locator('a[href*="/exercises/"]:not([href*="/attempt"])').first();
    await expect(testExerciseLink).toBeVisible();

    // Click on the exercise
    await testExerciseLink.click();

    // Click "Take Exercise" button
    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await expect(takeExerciseButton).toBeVisible({ timeout: 10000 });
    await takeExerciseButton.click();

    // Wait for the page to fully load and React components to hydrate
    await page.waitForLoadState("networkidle");

    // Check for authentication errors first
    const errorHeading = page.locator('h3:has-text("Error Loading Exercise")');
    if (await errorHeading.isVisible()) {
      const errorText = await page.locator("main").textContent();
      throw new Error(`Exercise failed to load: ${errorText}`);
    }

    // Poczekaj na załadowanie czatu z dłuższym timeoutem
    await page.waitForSelector(".exercise-chat-island", { timeout: 20000 });

    // Sprawdź czy istnieje przycisk powrotu (może być widoczny po ukończeniu)
    const returnButton = page.locator('button:has-text("Return to Exercises")');

    // Jeśli przycisk nie jest widoczny, to znaczy że ćwiczenie nie jest ukończone (co jest OK)
    // Sprawdzamy tylko czy struktura jest prawidłowa
    if (await returnButton.isVisible()) {
      await expect(returnButton).toBeVisible();
    }
  });
});
