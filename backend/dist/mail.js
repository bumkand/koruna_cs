"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = sendConfirmationEmail;
exports.verifySmtpConfiguration = verifySmtpConfiguration;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : smtpPort === 465;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendConfirmationEmail(to, bibNumber, termsUrl) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_USER a SMTP_PASS musí být nastavené pro odesílání potvrzovacích e-mailů');
    }
    const from = process.env.SMTP_FROM || `"Koruna CS" <${process.env.SMTP_USER}>`;
    const textBody = `Děkujeme za registraci! Vaše startovní číslo je: ${bibNumber}` +
        (termsUrl ? `\n\nPodmínky závodu naleznete na: ${termsUrl}` : '');
    try {
        await transporter.sendMail({
            from,
            to,
            subject: 'Potvrzení registrace – Koruna Českého středohoří',
            text: textBody,
        });
        console.log('E-mail úspěšně odeslán na', to);
    }
    catch (error) {
        console.error('Chyba při odesílání e-mailu:', error);
        throw error;
    }
}
async function verifySmtpConfiguration() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_USER a SMTP_PASS musí být nastavené');
    }
    await transporter.verify();
}
