# Test info

- Name: Exercise Chat Flow >> clicking on exercise shows chat interface with questions
- Location: /home/bmankowski/projects/10xTranslationsFactory/test/e2e/exercises/exercise-chat.spec.ts:4:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('.exercise-chat-island') to be visible

    at /home/bmankowski/projects/10xTranslationsFactory/test/e2e/exercises/exercise-chat.spec.ts:43:16
```

# Page snapshot

```yaml
- banner:
  - link "10x Translations Factory":
    - /url: /
  - link "bmankowski@gmail.com":
    - /url: /profile
  - button "Logout"
- main:
  - img
  - paragraph: Loading exercise...
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { test, expect } from "../fixtures/auth-fixtures";
   2 |
   3 | test.describe("Exercise Chat Flow", () => {
   4 |   test("clicking on exercise shows chat interface with questions", async ({ authenticatedPage: page }) => {
   5 |     // Przejdź na stronę z listą ćwiczeń
   6 |     await page.goto("/exercises");
   7 |
   8 |     // Sprawdź czy strona się załadowała
   9 |     await expect(page.locator("h1, h2, h3").first()).toContainText("Exercises");
   10 |
   11 |     // Poczekaj na załadowanie listy ćwiczeń
   12 |     await page.waitForSelector('a[href*="/exercises/"]', { timeout: 10000 });
   13 |
   14 |     // Znajdź pierwszy link do ćwiczenia
   15 |     const exerciseLink = page.locator('a[href*="/exercises/"]').first();
   16 |     await expect(exerciseLink).toBeVisible();
   17 |
   18 |     // Kliknij na ćwiczenie
   19 |     await exerciseLink.click();
   20 |
   21 |     // Sprawdź czy jesteśmy na stronie szczegółów ćwiczenia
   22 |     await expect(page).toHaveURL(/\/exercises\/[^/]+$/);
   23 |
   24 |     // Znajdź i kliknij przycisk "Take Exercise"
   25 |     const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
   26 |     await expect(takeExerciseButton).toBeVisible();
   27 |     await takeExerciseButton.click();
   28 |
   29 |     // Sprawdź czy jesteśmy na stronie attempt
   30 |     await expect(page).toHaveURL(/\/exercises\/[^/]+\/attempt$/);
   31 |
   32 |     // Wait for the page to fully load and React components to hydrate
   33 |     await page.waitForLoadState("networkidle");
   34 |
   35 |     // Check for authentication errors first
   36 |     const errorHeading = page.locator('h3:has-text("Error Loading Exercise")');
   37 |     if (await errorHeading.isVisible()) {
   38 |       const errorText = await page.locator("main").textContent();
   39 |       throw new Error(`Exercise failed to load: ${errorText}`);
   40 |     }
   41 |
   42 |     // Wait for the exercise chat island with a longer timeout
>  43 |     await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
   44 |
   45 |     // Sprawdź czy pojawił się komponent czatu
   46 |     await expect(page.locator(".exercise-chat-island")).toBeVisible();
   47 |
   48 |     // Sprawdź czy jest nagłówek "Language Exercise"
   49 |     await expect(page.locator('h1:has-text("Language Exercise")')).toBeVisible();
   50 |
   51 |     // Sprawdź czy jest widok tekstu ćwiczenia (div z klasą prose)
   52 |     await expect(page.locator(".prose")).toBeVisible();
   53 |
   54 |     // Sprawdź czy jest pole tekstowe do wprowadzania odpowiedzi
   55 |     await expect(page.locator('input[type="text"][aria-label="Answer input"]')).toBeVisible();
   56 |
   57 |     // Sprawdź czy jest przycisk wysyłania
   58 |     await expect(page.locator('button:has-text("Send")')).toBeVisible();
   59 |   });
   60 |
   61 |   test("chat interface allows typing and submitting answers", async ({ authenticatedPage: page }) => {
   62 |     // Przejdź bezpośrednio na stronę attempt
   63 |     await page.goto("/exercises");
   64 |
   65 |     // Znajdź pierwsze ćwiczenie i przejdź do attempt
   66 |     const exerciseLink = page.locator('a[href*="/exercises/"]').first();
   67 |     await exerciseLink.click();
   68 |
   69 |     const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
   70 |     await takeExerciseButton.click();
   71 |
   72 |     // Wait for the page to fully load and React components to hydrate
   73 |     await page.waitForLoadState("networkidle");
   74 |
   75 |     // Poczekaj na załadowanie czatu z dłuższym timeoutem
   76 |     await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });
   77 |
   78 |     // Znajdź pole tekstowe
   79 |     const textInput = page.locator('input[type="text"][aria-label="Answer input"]');
   80 |     await expect(textInput).toBeVisible();
   81 |
   82 |     // Wpisz odpowiedź
   83 |     await textInput.fill("This is my test answer");
   84 |
   85 |     // Sprawdź czy przycisk wysyłania jest aktywny
   86 |     const submitButton = page.locator('button:has-text("Send")');
   87 |     await expect(submitButton).toBeEnabled();
   88 |
   89 |     // Wyślij odpowiedź
   90 |     await submitButton.click();
   91 |
   92 |     // Sprawdź czy odpowiedź została wysłana (pole powinno się wyczyścić)
   93 |     await expect(textInput).toHaveValue("");
   94 |   });
   95 |
   96 |   test("exercise completion shows return button", async ({ authenticatedPage: page }) => {
   97 |     // Ten test sprawdza czy po ukończeniu ćwiczenia pojawia się przycisk powrotu
   98 |     await page.goto("/exercises");
   99 |
  100 |     const exerciseLink = page.locator('a[href*="/exercises/"]').first();
  101 |     await exerciseLink.click();
  102 |
  103 |     const takeExerciseButton = page.locator('a:has-text("Take Exercise")');
  104 |     await takeExerciseButton.click();
  105 |
  106 |     // Wait for the page to fully load and React components to hydrate
  107 |     await page.waitForLoadState("networkidle");
  108 |
  109 |     // Poczekaj na załadowanie czatu z dłuższym timeoutem
  110 |     await page.waitForSelector(".exercise-chat-island", { timeout: 15000 });
  111 |
  112 |     // Sprawdź czy istnieje przycisk powrotu (może być widoczny po ukończeniu)
  113 |     const returnButton = page.locator('button:has-text("Return to Exercises")');
  114 |
  115 |     // Jeśli przycisk nie jest widoczny, to znaczy że ćwiczenie nie jest ukończone (co jest OK)
  116 |     // Sprawdzamy tylko czy struktura jest prawidłowa
  117 |     if (await returnButton.isVisible()) {
  118 |       await expect(returnButton).toBeVisible();
  119 |     }
  120 |   });
  121 | });
  122 |
```