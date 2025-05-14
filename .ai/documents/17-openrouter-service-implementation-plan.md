# Przewodnik wdrożenia usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter ma na celu integrację z API OpenRouter, aby uzupełniać czaty oparte na LLM. Główne funkcje usługi to:

1. Odbieranie wiadomości od użytkownika i przygotowywanie komunikatów systemowych.
2. Budowanie żądań do API z właściwie sformatowanym payloadem, który zawiera komunikat systemowy, komunikat użytkownika, response_format, nazwę modelu oraz parametry modelu.
3. Przetwarzanie i walidacja odpowiedzi otrzymanej z API według zdefiniowanego schematu JSON.
4. Centralna obsługa błędów, logowanie oraz mechanizmy retry w razie problemów.

## 2. Opis konstruktora
Konstruktor usługi odpowiada za:

- Inicjalizację konfiguracji, m.in. klucza API, endpointu oraz domyślnych parametrów (np. temperatura, max_tokens).
- Ustalenie stałego komunikatu systemowego, który będzie wysyłany razem z wiadomościami użytkownika.
- Konfigurację narzędzi takich jak logger oraz mechanizmów zabezpieczeń.

## 3. Publiczne metody i pola
**Metody:**

1. `initService(config: OpenRouterConfig)`: Inicjuje usługę, ustawiając niezbędne parametry konfiguracyjne oraz konfigurację API.
2. `sendMessage(userMessage: string, additionalParams?: ModelParams): Promise<Response>`: Wysyła zapytanie do OpenRouter API, łącząc komunikat systemowy z wiadomością użytkownika i dodatkowymi parametrami modelu.
3. `parseResponse(response: any): ParsedResponse`: Waliduje i przetwarza odpowiedź API, stosując zdefiniowany response_format.
4. `handleError(error: any): void`: Centralna metoda do obsługi błędów, która loguje oraz reaguje na nieoczekiwane sytuacje.

**Pola:**

- `apiEndpoint: string` – adres endpointu OpenRouter API.
- `apiKey: string` – klucz autoryzacyjny do API.
- `defaultModelParams: ModelParams` – domyślne ustawienia parametrów modelu (np. temperature, max_tokens, top_p).
- `systemMessage: string` – stały komunikat systemowy (np. "System: Wsparcie czatu za pomocą OpenRouter").
- `responseFormat: object` – schemat JSON określający strukturę odpowiedzi, np.:
  ```json
  { "type": "json_schema", "json_schema": { "name": "chat_response", "strict": true, "schema": { "text": "string", "language": "string" } } }
  ```

## 4. Prywatne metody i pola
**Metody:**

1. `_buildRequestPayload(userMessage: string, additionalParams?: ModelParams): RequestPayload`: Łączy komunikat systemowy z wiadomością użytkownika i dodatkowymi parametrami, tworząc kompletny payload dla API.
2. `_performApiCall(payload: RequestPayload): Promise<any>`: Wykonuje wywołanie API, implementując logikę retry oraz timeout.
3. `_validateResponseStructure(response: any): boolean`: Sprawdza, czy odpowiedź z API jest zgodna ze zdefiniowanym `responseFormat`.

**Pola:**

- `_retryLimit: number` – maksymalna liczba prób ponowienia wywołania API w przypadku błędów sieciowych.
- `_timeoutDuration: number` – czas oczekiwania na odpowiedź API przed zgłoszeniem błędu timeout.
- `_logger: Logger` – narzędzie do rejestrowania zdarzeń oraz błędów.

## 5. Obsługa błędów
Usługa powinna uwzględniać następujące scenariusze błędów:

1. **Błąd sieciowy:** Brak połączenia, timeout lub przerwanie połączenia.
   - Rozwiązanie: Implementacja retry logic oraz mechanizmu awaryjnego (fallback).
2. **Błąd walidacji odpowiedzi:** Odpowiedź niezgodna ze schematem `responseFormat`.
   - Rozwiązanie: Logowanie błędu, walidacja struktury oraz zwracanie odpowiedniego komunikatu błędu.
3. **Błąd autoryzacji:** Niewłaściwy lub brak klucza API.
   - Rozwiązanie: Natychmiastowe przerwanie operacji i powiadomienie o problemie.
4. **Błąd przetwarzania:** Nieoczekiwane lub błędnie sformatowane dane.
   - Rozwiązanie: Zastosowanie bloków try-catch oraz wcześniejsza walidacja danych wejściowych.

## 6. Kwestie bezpieczeństwa
- **Bezpieczne przechowywanie klucza API:** Użycie zmiennych środowiskowych oraz narzędzi do zarządzania sekretami.
- **Szyfrowanie komunikacji:** Wymuszenie połączeń HTTPS dla wszystkich wywołań API.
- **Walidacja danych:** Dokładna kontrola danych wejściowych, aby uniknąć ataków takich jak SQL Injection lub XSS.
- **Rate limiting i monitoring:** Implementacja mechanizmów ograniczających liczbę zapytań oraz monitorowanie nietypowych zachowań systemowych.

## 7. Plan wdrożenia krok po kroku
1. **Konfiguracja środowiska:**
   - Zmienne środowiskowe  (OPENROUTER_API_KEY, OPENROUTER_API_ENDPOINT) w pliku .env
   - Utworzyć plik modułu src/lib/openrouter.ts

2. **Implementacja komponentu inicjalizacyjnego:**
   - Utworzyć konstruktor usługi, który wczyta konfigurację, ustawi `systemMessage` oraz domyślne `defaultModelParams`.
   - Zaimplementować mechanizm pobierania zmiennych środowiskowych.

3. **Implementacja głównych metod publicznych:**
   - Zaimplementować `sendMessage`, która przygotowuje payload za pomocą `_buildRequestPayload` i wykonuje wywołanie API korzystając z `_performApiCall`.
   - Zaimplementować `parseResponse` w celu walidacji i przetwarzania odpowiedzi przy użyciu `_validateResponseStructure`.

4. **Konfiguracja elementów integracji z OpenRouter API:**
   - **Komunikat systemowy:**
     1. Ustalić stały komunikat domyślny, "System: Wsparcie czatu za pomocą OpenRouter".
   - **Komunikat użytkownika:**
     1. Przekazywać wiadomość użytkownika bezpośrednio z interfejsu, np.: "Jaki jest status mojej przesyłki?".
   - **Ustrukturyzowane odpowiedzi (response_format):**
     1. Zdefiniować schemat JSON:
        ```json
        { "type": "json_schema", "json_schema": { "name": "chat_response", "strict": true, "schema": { "text": "string", "language": "string" } } }
        ```
   - **Nazwa modelu:**
     1. Określić predefiniowaną nazwę modelu, np.: "openrouter-base". Jak domyślny model chciałbym korzystać z 4o-mini
   - **Parametry modelu:**
     1. Ustalić domyślne parametry, np.: `{ temperature: 0.7, max_tokens: 400, top_p: 1, frequency_penalty: 0 }`.

5. **Implementacja obsługi komunikatów:**
   - W metodzie `sendMessage` scalić komunikat systemowy z wiadomością użytkownika oraz dodatkowe parametry, tworząc kompletny payload.

6. **Implementacja obsługi błędów i logiki retry:**
   - Zaimplementować centralny mechanizm `handleError` i stosować go przy kluczowych wywołaniach API.
   - Skonfigurować wartości `_retryLimit` oraz `_timeoutDuration` w `_performApiCall`.

