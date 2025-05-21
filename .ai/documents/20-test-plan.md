# Plan Testów dla 10xTranslationsFactory

## 1. Wprowadzenie i cele testowania

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji 10xTranslationsFactory - platformy do nauki języków wykorzystującej zaawansowane narzędzia AI. Główne cele testowania to:

- Zapewnienie wysokiej jakości i stabilności wszystkich komponentów aplikacji
- Weryfikacja poprawnego działania funkcjonalności językowych
- Potwierdzenie bezpieczeństwa danych użytkowników i integracji z Supabase
- Weryfikacja wydajności interfejsu użytkownika i czasu odpowiedzi API
- Sprawdzenie poprawności integracji z modelami AI poprzez OpenRouter.ai

## 2. Zakres testów

Plan testów obejmuje następujące obszary aplikacji:

- Frontend - komponenty Astro i React, interfejs użytkownika
- Backend - integracja z Supabase, API endpoints
- Integracja z AI - wykorzystanie OpenRouter.ai do generowania zadań językowych
- Autoryzacja i uwierzytelnianie - proces rejestracji, logowania i zarządzania kontem
- Przepływy pracy użytkownika - generowanie ćwiczeń, rozwiązywanie zadań, śledzenie postępów

## 3. Typy testów

### 3.1 Testy jednostkowe

**Narzędzia**: Vitest, React Testing Library

**Zakres**:
- Testy komponentów React (formularze, filtry, komponenty UI)
- Testy funkcji pomocniczych w `/src/lib`
- Testy walidatorów formularzy
- Testy transformacji danych

**Priorytetowe komponenty**:
- `GenerateExerciseForm.tsx`
- `ExerciseChatIsland.tsx`
- `LanguageFilter.tsx`
- Funkcje helpery z `/src/lib/utils`

### 3.2 Testy integracyjne

**Narzędzia**: Playwright, Vitest

**Zakres**:
- Integracja frontendu z API
- Integracja z Supabase (baza danych, autoryzacja)
- Integracja z OpenRouter.ai
- Przepływ danych między komponentami

**Priorytetowe testy**:
- Proces generowania ćwiczeń i pytań
- Przesyłanie odpowiedzi i otrzymywanie oceny
- Filtrowanie ćwiczeń według języka i poziomu zaawansowania

### 3.3 Testy E2E (End-to-End)

**Narzędzia**: Playwright

**Zakres**:
- Kompleksowe przepływy użytkownika
- Nawigacja w aplikacji
- Procesy biznesowe end-to-end

**Priorytetowe scenariusze**:
- Rejestracja użytkownika → logowanie → generowanie ćwiczenia → udzielanie odpowiedzi
- Wyszukiwanie ćwiczeń → filtrowanie → przeglądanie → rozpoczęcie konwersacji
- Zarządzanie kontem użytkownika i preferencjami językowych

### 3.4 Testy API

**Narzędzia**: Postman, SuperTest

**Zakres**:
- Testy wszystkich endpointów API w `/src/pages/api`
- Walidacja schematów wejścia/wyjścia
- Obsługa błędów i przypadków brzegowych
- Autoryzacja endpoints

**Priorytetowe endpointy**:
- `/api/exercises` (GET, POST)
- `/api/auth/*`
- `/api/languages`
- `/api/proficiency-levels`

### 3.5 Testy wydajnościowe

**Narzędzia**: Lighthouse, k6

**Zakres**:
- Czas ładowania stron
- Wydajność renderowania UI
- Wydajność zapytań do bazy danych
- Limity obciążenia dla API
- Czas odpowiedzi przy generacji przez OpenRouter.ai

### 3.6 Testy bezpieczeństwa

**Narzędzia**: OWASP ZAP, SonarQube

**Zakres**:
- Audyt bezpieczeństwa autoryzacji
- Walidacja danych wejściowych
- Ochrona przed CSRF/XSS
- Bezpieczne przechowywanie danych w Supabase

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Generowanie ćwiczenia językowego

1. **Warunki wstępne**: Użytkownik jest zalogowany
2. **Kroki testowe**:
   - Wybór języka docelowego
   - Wybór poziomu zaawansowania
   - Wprowadzenie tematu ćwiczenia
   - Ustawienie widoczności ćwiczenia (publiczne/prywatne)
   - Kliknięcie przycisku "Generuj"
3. **Oczekiwany rezultat**:
   - System generuje ćwiczenie językowe z tekstem i pytaniami
   - Użytkownik zostaje przekierowany do widoku nowego ćwiczenia
   - Ćwiczenie jest zapisane w bazie danych
4. **Przypadki brzegowe**:
   - Generowanie z bardzo długim tematem
   - Obsługa problemów z połączeniem z OpenRouter.ai
   - Próba generowania bez wybrania języka lub poziomu

### 4.2 Filtrowanie i wyszukiwanie ćwiczeń

1. **Warunki wstępne**: Baza zawiera co najmniej 10 ćwiczeń
2. **Kroki testowe**:
   - Przejście do strony z listą ćwiczeń
   - Filtrowanie według języka
   - Filtrowanie według poziomu zaawansowania
   - Paginacja wyników
3. **Oczekiwany rezultat**:
   - Lista ćwiczeń jest poprawnie filtrowana
   - Paginacja działa prawidłowo
   - UI aktualizuje się bez przeładowania strony
4. **Przypadki brzegowe**:
   - Brak wyników dla wybranych filtrów
   - Duża liczba wyników

### 4.3 Konwersacja w ramach ćwiczenia (Chat)

1. **Warunki wstępne**: Użytkownik przegląda ćwiczenie
2. **Kroki testowe**:
   - Przeczytanie tekstu ćwiczenia
   - Udzielenie odpowiedzi na pytanie w interfejsie czatu
   - Otrzymanie informacji zwrotnej
   - Przejście do kolejnego pytania
3. **Oczekiwany rezultat**:
   - Odpowiedzi są zapisywane w bazie danych
   - System ocenia poprawność odpowiedzi
   - Interfejs czatu wyświetla historię konwersacji
4. **Przypadki brzegowe**:
   - Bardzo długie odpowiedzi
   - Przerwanie sesji w trakcie odpowiadania

### 4.4 Rejestracja i logowanie

1. **Warunki wstępne**: Użytkownik nie jest zalogowany
2. **Kroki testowe**:
   - Przejście do strony rejestracji
   - Wprowadzenie danych (email, hasło)
   - Weryfikacja emaila
   - Logowanie do systemu
3. **Oczekiwany rezultat**:
   - Konto jest poprawnie utworzone w Supabase
   - Email weryfikacyjny jest wysyłany
   - Użytkownik może się zalogować po weryfikacji
4. **Przypadki brzegowe**:
   - Rejestracja z istniejącym emailem
   - Próba logowania przed weryfikacją
   - Próba dostępu do chronionych zasobów bez logowania

## 5. Środowisko testowe

### 5.1 Środowiska

- **Lokalne**: Do testów jednostkowych i developmentu
- **Staging**: Do testów integracyjnych i E2E przed wdrożeniem
- **Produkcyjne**: Do testów weryfikacyjnych po wdrożeniu

### 5.2 Wymagania infrastrukturalne

- Instancja Supabase z bazą danych PostgreSQL
- Dostęp do API OpenRouter.ai
- Serwer Docker dla konteneryzacji
- DigitalOcean dla hostingu aplikacji

### 5.3 Dane testowe

- Zestaw przykładowych języków i poziomów zaawansowania
- Wstępnie wygenerowane ćwiczenia dla różnych języków
- Konta testowe użytkowników o różnych uprawnieniach

## 6. Narzędzia do testowania

- **Vitest** - Testy jednostkowe JavaScript/TypeScript
- **React Testing Library** - Testowanie komponentów React
- **Playwright** - Testy E2E i integracyjne
- **Postman/SuperTest** - Testowanie API
- **Lighthouse** - Audyt wydajności stron
- **k6** - Testy obciążeniowe
- **OWASP ZAP** - Testy bezpieczeństwa
- **GitHub Actions** - Automatyzacja CI/CD i testów

## 7. Harmonogram testów

1. **Przygotowanie** (Tydzień 1)
   - Konfiguracja środowisk testowych
   - Przygotowanie danych testowych
   - Stworzenie pierwszych testów jednostkowych

2. **Testowanie komponentów** (Tydzień 2-3)
   - Implementacja testów jednostkowych
   - Testowanie izolowanych komponentów
   - Code coverage > 80% dla kluczowych funkcjonalności

3. **Testy integracyjne** (Tydzień 4-5)
   - Testowanie integracji komponentów
   - Testowanie API i bazy danych
   - Weryfikacja przepływów danych

4. **Testy E2E** (Tydzień 6-7)
   - Implementacja scenariuszy E2E
   - Testowanie pełnych przepływów użytkownika
   - Wykrywanie i naprawa regresji

5. **Testy wydajnościowe i bezpieczeństwa** (Tydzień 8)
   - Audyt wydajności
   - Testy bezpieczeństwa
   - Optymalizacja wąskich gardeł

## 8. Kryteria akceptacji testów

### 8.1 Kryteria dla testów funkcjonalnych

- Wszystkie krytyczne scenariusze testowe muszą zakończyć się sukcesem
- Pokrycie kodu testami na poziomie minimum 80% dla kluczowych komponentów
- Brak błędów krytycznych i wysokiego priorytetu
- Wszystkie wymagania funkcjonalne są spełnione

### 8.2 Kryteria dla testów niefunkcjonalnych

- Czas odpowiedzi API < 300ms dla 95% zapytań
- Czas generowania ćwiczenia < 10 sekund
- Czas ładowania strony < 3 sekundy
- Aplikacja obsługuje do 1000 jednoczesnych użytkowników
- Brak krytycznych luk bezpieczeństwa

### 8.3 Proces raportowania i rozwiązywania problemów

- Wszystkie błędy są rejestrowane w systemie śledzenia błędów (np. GitHub Issues)
- Błędy krytyczne muszą być naprawione przed wdrożeniem
- Cotygodniowe spotkania przeglądu testów z zespołem developerskim
- Raporty z testów generowane automatycznie przez CI/CD

## 9. Strategie testowania specyficzne dla projektu

### 9.1 Testowanie integracji z AI

- Mockowanie odpowiedzi z OpenRouter.ai dla testów niższego poziomu
- Monitoring limitów API w OpenRouter.ai
- Testy różnych modeli AI dostępnych w OpenRouter.ai
- Weryfikacja jakości generowanych ćwiczeń dla różnych języków

### 9.2 Testowanie wielojęzyczności

- Testy dla wszystkich obsługiwanych języków
- Weryfikacja poprawności wyświetlania znaków specjalnych
- Sprawdzenie filtrowania i sortowania dla różnych alfabetów

### 9.3 Testowanie progresji nauki

- Weryfikacja systemu śledzenia postępów użytkownika
- Testowanie statystyk i historii aktywności
- Sprawdzenie rekomendacji ćwiczeń bazujących na postępach

## 10. Zarządzanie ryzykiem testowym

| Ryzyko | Prawdopodobieństwo | Wpływ | Strategia mitygacji |
|--------|-------------------|-------|---------------------|
| Problemy z dostępnością OpenRouter.ai | Średnie | Wysoki | Implementacja mechanizmu cache i retry, alternatywne modele |
| Problemy z wydajnością Supabase | Niskie | Wysoki | Monitoring, optymalizacja zapytań, indeksy |
| Problemy z jakością generowanych ćwiczeń | Średnie | Średni | Weryfikacja przez ludzi, ulepszanie promptów |
| Błędy w integracji z autentykacją | Niskie | Wysoki | Kompleksowe testy autentykacji, regularne audyty bezpieczeństwa |
| Problemy z responsywnością UI | Średnie | Średni | Testy na różnych urządzeniach, automatyczne testy UI | 