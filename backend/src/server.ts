import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db';
import { apiRouter } from './routes/api';
import { verifySmtpConfiguration } from './mail';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', apiRouter);

// Serve static frontend files
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server naslouchá na portu ${PORT}`);
  });

  verifySmtpConfiguration().catch(err => {
    console.error('SMTP konfigurace není platná, potvrzovací e-maily nepůjdou odesílat:', err);
  });
}).catch(err => {
  console.error('Chyba inicializace databáze:', err);
});
