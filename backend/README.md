# Koruna CS Backend

Express + TypeScript backend s napojením na SQLite a Google Sheets.

## Požadavky a spuštění

1. Zkopírujte `.env.example` na `.env` a upravte potřebné proměnné. Základní set proměnných zahrnuje:
   - `PORT` (výchozí 3000)
   - `TERMS_URL` (volitelné, odkaz na stránku podmínek; výchozí je `/terms.html`)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (vyžaduje App Password pro odesílání e-mailů s potvrzeními)
   - `GOOGLE_SHEET_ID` a `GOOGLE_SHEET_TAB` (ID a název listu v Google Sheets)
   - `GOOGLE_APPLICATION_CREDENTIALS` nebo `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` (cesta k JSON klíči servisního účtu koruna_cs)

2. Přístup ke Google Sheets:
   - Aplikace používá service account s e-mailem: \`sheets-bot@korunacs.iam.gserviceaccount.com\`
   - Vytvořte cílový list a **nasdílejte ho pro úpravy (Editor)** výše zmíněnému e-mailu.
   - Přejděte na záložku určenou pro zápis a její název uveďte do \`GOOGLE_SHEET_TAB\`. ID dokumentu z URL dejte do \`GOOGLE_SHEET_ID\`.

3. Gmail SMTP a App Password:
   - Ve svém Google účtu pro e-mail odchozí komunikace zapněte dvoufázové ověření.
   - V nastavení zabezpečení (App Passwords) si vygenerujte nové heslo a nastavte jej do `SMTP_PASS`.
   - Nepoužívejte běžné heslo ke Google účtu. Gmail pro SMTP odmítne přihlášení s chybou `535 5.7.8 Username and Password not accepted`, pokud není použité App Password nebo je `SMTP_USER`/`SMTP_PASS` špatně.
   - `SMTP_USER` musí být přesná Gmail adresa, která App Password vlastní.

4. Instalace závislostí:
   \`\`\`bash
   npm install
   \`\`\`

5. Spuštění serveru lokálně:
   \`\`\`bash
   # Vývojový server s automatickým restartem (nodemon/ts-node)
   npm run dev

   # Pro build
   npm run build
   npm start
   \`\`\`
