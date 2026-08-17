"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendRegistrationToSheet = appendRegistrationToSheet;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function resolveGoogleCredentialsPath() {
    const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
    if (!configuredPath) {
        return undefined;
    }
    if (path_1.default.isAbsolute(configuredPath)) {
        return fs_1.default.existsSync(configuredPath) ? configuredPath : undefined;
    }
    const candidates = [
        path_1.default.resolve(process.cwd(), configuredPath),
        path_1.default.resolve(__dirname, '..', configuredPath),
        path_1.default.resolve(__dirname, '..', '..', configuredPath),
    ];
    return candidates.find(candidate => fs_1.default.existsSync(candidate));
}
const keyFile = resolveGoogleCredentialsPath();
const auth = keyFile
    ? new googleapis_1.google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    : new googleapis_1.google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
async function appendRegistrationToSheet(data) {
    try {
        if (!process.env.GOOGLE_SHEET_ID) {
            throw new Error('Missing GOOGLE_SHEET_ID environment variable');
        }
        if (!keyFile) {
            throw new Error('Missing or inaccessible Google service-account JSON. Set GOOGLE_APPLICATION_CREDENTIALS to a protected file path.');
        }
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
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
    }
    catch (error) {
        console.error('Chyba při zápisu do Google Sheets:', error);
    }
}
