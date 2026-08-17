import { Router } from 'express';
import { getDb } from '../db';
import { appendRegistrationToSheet } from '../sheets';
import { sendConfirmationEmail } from '../mail';

export const apiRouter = Router();

apiRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const REGISTRATION_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REGISTRATION_RATE_LIMIT_MAX_REQUESTS = 5;
const registrationAttemptLog = new Map<string, number[]>();

function getClientIp(req: any) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function isRateLimited(req: any) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const recentAttempts = (registrationAttemptLog.get(clientIp) || []).filter(
    timestamp => now - timestamp < REGISTRATION_RATE_LIMIT_WINDOW_MS
  );

  if (recentAttempts.length >= REGISTRATION_RATE_LIMIT_MAX_REQUESTS) {
    registrationAttemptLog.set(clientIp, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  registrationAttemptLog.set(clientIp, recentAttempts);
  return false;
}

// ==== PUBLIC API ====

apiRouter.post('/public/register', async (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Příliš mnoho pokusů. Zkuste to později.' });
  }

  const { firstName, lastName, address, phone, gender, email, birthYear, termsAccepted, honeypot } = req.body;

  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return res.status(400).json({ error: 'Neplatná data formuláře' });
  }

  if (!firstName || !lastName || !address || !phone || !gender || !email || !birthYear || !termsAccepted) {
    return res.status(400).json({ error: 'Chybí povinná data' });
  }

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Neplatný formát e-mailu' });
  }
  
  const g = gender.toUpperCase();
  if (g !== 'M' && g !== 'F') {
    return res.status(400).json({ error: 'Pohlaví musí být M nebo F' });
  }

  const by = parseInt(birthYear, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(by) || by < 1900 || by > currentYear) {
    return res.status(400).json({ error: 'Neplatný rok narození' });
  }

  if (termsAccepted !== true && termsAccepted !== 'true' && termsAccepted !== 1) {
    return res.status(400).json({ error: 'Je nutné souhlasit s podmínkami' });
  }

  const db = getDb();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = String(phone).trim();

  const duplicateRegistration = await db.get(
    'SELECT id FROM registrations WHERE lower(email) = lower(?) OR phone = ? LIMIT 1',
    [normalizedEmail, normalizedPhone]
  );

  if (duplicateRegistration) {
    return res.status(409).json({ error: 'Registrace s tímto e-mailem nebo telefonem už existuje' });
  }

  let bibNumber;

  try {
    await db.exec('BEGIN IMMEDIATE TRANSACTION');
    
    const seqId = g === 'M' ? 'male' : 'female';
    const seqRow = await db.get('SELECT next_number FROM sequences WHERE id = ?', seqId);
    if (!seqRow) throw new Error('Sekvence nenalezena');
    
    bibNumber = seqRow.next_number;
    
    await db.run('UPDATE sequences SET next_number = next_number + 2 WHERE id = ?', seqId);
    
    await db.run(
      'INSERT INTO registrations (first_name, last_name, address, phone, gender, email, birth_year, bib_number, terms_accepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [String(firstName).trim(), String(lastName).trim(), String(address).trim(), normalizedPhone, g, normalizedEmail, by, bibNumber, 1]
    );
    
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Chyba při alokaci čísla' });
  }

  const createdAt = new Date().toISOString();
  appendRegistrationToSheet([createdAt, bibNumber, firstName, lastName, address, email, phone, g, by, 'ANO']).catch(console.error);

  const termsUrl = process.env.TERMS_URL || '/terms.html';
  let emailSent = true;

  try {
    await sendConfirmationEmail(email, bibNumber, termsUrl);
  } catch (error) {
    emailSent = false;
    console.error('Potvrzovací e-mail se nepodařilo odeslat:', error);
  }

  res.json({ message: 'Registrace úspěšná', bibNumber, emailSent });
});
