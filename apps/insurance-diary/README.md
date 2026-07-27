# Pamiętnik Ubezpieczeniowy — klikalny mockup

Pełna kopia **Eyris Vite TypeScript starter** + ekrany PL dla bety worker UX.

## Start

```bash
# z root monorepo
pnpm install
pnpm dev:insurance
```

URL: http://127.0.0.1:5177

## Ścieżka demo

1. Telefon → **Wyślij kod**
2. OTP: **`1234`**
3. Wyszukaj firmę (min. 3 znaki), np. `Jan` → wybierz **Janusz Sp. z o.o.**
4. **Rozpocznij pracę** → zielony kafelek na osi
5. Czerwony FAB → triage → zdjęcie/głos (mock) → **Zapisz dowód**
6. **Zakończ zmianę** → szary kafelek
7. Hamburger → profil / lead prawny / polisy

Stan w `localStorage` (`insurance-diary-mock`). Bez API / SMS / KRS.
