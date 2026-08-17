"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const api_1 = require("./routes/api");
const mail_1 = require("./mail");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', api_1.apiRouter);
// Serve static frontend files
const frontendPath = path_1.default.resolve(__dirname, '..', '..', 'frontend');
app.use(express_1.default.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
(0, db_1.initDb)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server naslouchá na portu ${PORT}`);
    });
    (0, mail_1.verifySmtpConfiguration)().catch(err => {
        console.error('SMTP konfigurace není platná, potvrzovací e-maily nepůjdou odesílat:', err);
    });
}).catch(err => {
    console.error('Chyba inicializace databáze:', err);
});
