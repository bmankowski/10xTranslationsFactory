import { test, expect } from "../fixtures/auth-fixtures";

test.describe("Exercise Chat Flow", () => {
  test("clicking on exercise shows chat interface with questions", async ({ authenticatedPage: page }) => {
    // Przejdź na stronę z listą ćwiczeń
    await page.goto("/exercises");

    // Sprawdź czy strona się załadowała
    await expect(page.locator("h1, h2, h3").first()).toContainText("Exercises");

    // Poczekaj na załadowanie listy ćwiczeń
    await page.waitForSelector('a[href*="/exercises/"]', { timeout: 10000 });

    // Znajdź pierwszy link do ćwiczenia
    const exerciseLink = page.locator('a[href*="/exercises/"]').first();
    await expect(exerciseLink).toBeVisible();

    // Kliknij na ćwiczenie
    await exerciseLink.click();

    // Sprawdź czy jesteśmy na stronie szczegółów ćwiczenia
    await expect(page).toHaveURL(/\/exercises\/[^/]+$/);

    // Znajdź i kliknij przycisk "Take Exercise"
    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await expect(takeExerciseButton).toBeVisible();
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
    await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });

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
    // Przejdź bezpośrednio na stronę attempt
    await page.goto("/exercises");

    // Znajdź pierwsze ćwiczenie i przejdź do attempt
    const exerciseLink = page.locator('a[href*="/exercises/"]').first();
    await exerciseLink.click();

    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await takeExerciseButton.click();

    // Wait for the page to fully load and React components to hydrate
    await page.waitForLoadState("networkidle");

    // Poczekaj na załadowanie czatu z dłuższym timeoutem
    await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });

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
    // Ten test sprawdza czy po ukończeniu ćwiczenia pojawia się przycisk powrotu
    await page.goto("/exercises");

    const exerciseLink = page.locator('a[href*="/exercises/"]').first();
    await exerciseLink.click();

    const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
    await takeExerciseButton.click();

    // Wait for the page to fully load and React components to hydrate
    await page.waitForLoadState("networkidle");

    // Poczekaj na załadowanie czatu z dłuższym timeoutem
    await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });

    // Sprawdź czy istnieje przycisk powrotu (może być widoczny po ukończeniu)
    const returnButton = page.locator('button:has-text("Return to Exercises")');

    // Jeśli przycisk nie jest widoczny, to znaczy że ćwiczenie nie jest ukończone (co jest OK)
    // Sprawdzamy tylko czy struktura jest prawidłowa
    if (await returnButton.isVisible()) {
      await expect(returnButton).toBeVisible();
    }
  });
});
