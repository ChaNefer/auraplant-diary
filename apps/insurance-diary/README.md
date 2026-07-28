# Pamiętnik Ubezpieczeniowy — klikalny mockup (deep flow)

Pełny **Eyris Vite TS starter** + mięsisty flow dla demo ze wspólniczkami (compliance / prawo).

Frontend-only. ZK i płatności są **symulowane**.

## Start

```bash
pnpm install
pnpm dev:insurance
```

URL: http://127.0.0.1:5177

Jeśli stary stan w przeglądarce przeszkadza: wyczyść `localStorage` klucz `insurance-diary-mock-v2`.

## Ścieżka demo (dla wspólniczek)

1. Telefon → OTP **`1234`**
2. **Dane formalne** (jawne do polisy) + komunikat zaufania
3. **Zakup B2C** — 30/90 dni, BLIK lub Apple Pay (mock), karencja od jutra
4. **Skarbiec** — PIN 6 cyfr (lub seed + PIN) + checkbox utraty klucza
5. Dashboard: pasek **niebieski**, selektor **2–3 firm**
6. **Rozpocznij pracę** → modal BHP (4 plansze) → wpis na osi → pasek **zielony** + zegar
7. Czerwony FAB → wypadek → zdjęcie/głos → **Zapisz dowód**
8. Pod czerwonym wpisem: **Skonsultuj z prawnikiem** → zaznacz dowody → PIN → toast **Żylet**
9. Profil: dane jawne vs „Pamiętnik chroniony PIN-em”; opcjonalnie „Symuluj 14h zmiany”

## Co udowadnia prototyp

| Temat | Jak widać w UI |
|---|---|
| Polisa vs ZK | Dane formalne jawne; Pamiętnik za PIN-em |
| Compliance BHP | Bloker check-inu + twardy wpis na osi |
| Lead gen Prawa Ręka | CTA kontekstowe + explicit consent + PIN |
| Model biznesowy | B2C zakup + kwalifikowana paczka dowodów |
