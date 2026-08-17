import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

function resolveGoogleCredentialsPath() {
  const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;

  if (!configuredPath) {
    return undefined;
  }

  if (path.isAbsolute(configuredPath)) {
    return fs.existsSync(configuredPath) ? configuredPath : undefined;
  }

  const candidates = [
    path.resolve(process.cwd(), configuredPath),
    path.resolve(__dirname, '..', configuredPath),
    path.resolve(__dirname, '..', '..', configuredPath),
  ];

  return candidates.find(candidate => fs.existsSync(candidate));
}

const keyFile = resolveGoogleCredentialsPath();

const auth = keyFile
  ? new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  : new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

export async function appendRegistrationToSheet(data: any[]) {
  try {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('Missing GOOGLE_SHEET_ID environment variable');
    }

    if (!keyFile) {
      throw new Error('Missing or inaccessible Google service-account JSON. Set GOOGLE_APPLICATION_CREDENTIALS to a protected file path.');
    }

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const tab = process.env.GOOGLE_SHEET_TAB || 'Registrace';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });
    console.log('Úspěšně zapsáno do Google Sheets');
  } catch (error) {
    console.error('Chyba při zápisu do Google Sheets:', error);
  }
}
