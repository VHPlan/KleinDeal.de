/**
 * Transactional Email Service for KleinDeal.de
 * 
 * Supports:
 * - Resend API (HTTP REST)
 * - SMTP (via nodemailer)
 * - Development Console Logger (with preview links)
 * - Test Mock (silent for tests)
 */

import nodemailer from 'nodemailer';
import { env } from './env';

export interface EmailDeliveryResult {
  sent: boolean;
  provider: 'resend' | 'smtp' | 'development_log' | 'test';
  messageId?: string;
  previewUrl?: string;
  recipient: string;
  error?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private smtpTransport: nodemailer.Transporter | null = null;

  constructor() {
    if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
      this.smtpTransport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_SECURE === 'true',
        auth: env.SMTP_USER
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD || '',
            }
          : undefined,
      });
    }
  }

  /**
   * Dispatch an email using the configured provider
   */
  async send(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const normalizedRecipient = options.to.toLowerCase().trim();

    // 1. Test Mode: Silent mock
    if (env.EMAIL_PROVIDER === 'test' || env.NODE_ENV === 'test') {
      return {
        sent: true,
        provider: 'test',
        recipient: normalizedRecipient,
        messageId: `test-${Date.now()}`,
      };
    }

    // 2. Resend API
    if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: [normalizedRecipient],
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          return {
            sent: true,
            provider: 'resend',
            messageId: data.id,
            recipient: normalizedRecipient,
          };
        } else {
          console.error('Resend delivery error:', data);
          return {
            sent: false,
            provider: 'resend',
            recipient: normalizedRecipient,
            error: data.message || 'Resend API error',
          };
        }
      } catch (err: any) {
        console.error('Resend connection error:', err);
        return {
          sent: false,
          provider: 'resend',
          recipient: normalizedRecipient,
          error: err.message,
        };
      }
    }

    // 3. SMTP Transport
    if (env.EMAIL_PROVIDER === 'smtp' && this.smtpTransport) {
      try {
        const info = await this.smtpTransport.sendMail({
          from: env.EMAIL_FROM,
          to: normalizedRecipient,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });

        return {
          sent: true,
          provider: 'smtp',
          messageId: info.messageId,
          recipient: normalizedRecipient,
        };
      } catch (err: any) {
        console.error('SMTP delivery error:', err);
        return {
          sent: false,
          provider: 'smtp',
          recipient: normalizedRecipient,
          error: err.message,
        };
      }
    }

    // 4. Development Console Logger
    console.log(`\n======================================================`);
    console.log(`[EMAIL SERVICE - DEV LOG]`);
    console.log(`An: ${normalizedRecipient}`);
    console.log(`Betreff: ${options.subject}`);
    console.log(`Textauszug: ${options.text.substring(0, 160)}...`);
    console.log(`======================================================\n`);

    return {
      sent: false,
      provider: 'development_log',
      recipient: normalizedRecipient,
    };
  }

  /**
   * Health check for email service configuration
   */
  async checkHealth(): Promise<{ ok: boolean; provider: string; error?: string }> {
    if (env.EMAIL_PROVIDER === 'resend') {
      return {
        ok: !!env.RESEND_API_KEY,
        provider: 'resend',
        error: !env.RESEND_API_KEY ? 'RESEND_API_KEY missing' : undefined,
      };
    }
    if (env.EMAIL_PROVIDER === 'smtp') {
      if (!this.smtpTransport) {
        return { ok: false, provider: 'smtp', error: 'SMTP transport not initialized' };
      }
      try {
        await this.smtpTransport.verify();
        return { ok: true, provider: 'smtp' };
      } catch (err: any) {
        return { ok: false, provider: 'smtp', error: err.message };
      }
    }
    return { ok: true, provider: 'development_log' };
  }
}

export const emailService = new EmailService();

/**
 * ----------------------------------------------------------------------------
 * German Email Templates with KleinDeal.de Branding
 * ----------------------------------------------------------------------------
 */

function buildEmailHtml(title: string, contentHtml: string, actionButton?: { text: string; url: string }) {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Inter, Arial, Helvetica, sans-serif; background-color: #F6F7F4; margin: 0; padding: 24px; color: #151815; }
    .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #DEE3DE; border-radius: 12px; padding: 32px; }
    .logo { font-size: 20px; font-weight: 800; color: #171A17; margin-bottom: 24px; }
    .logo span { color: #17A673; }
    h1 { font-size: 20px; font-weight: 800; color: #151815; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #4A524D; margin: 16px 0; }
    .btn { display: inline-block; background-color: #17A673; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 16px 0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #DEE3DE; font-size: 11px; color: #68716A; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Klein<span>Deal</span>.de</div>
    <h1>${title}</h1>
    ${contentHtml}
    ${actionButton ? `<div style="text-align: center; margin: 24px 0;"><a href="${actionButton.url}" class="btn">${actionButton.text}</a></div>` : ''}
    <div class="footer">
      Dies ist eine automatische Sicherheitsbenachrichtigung von KleinDeal.de – Dein lokaler Marktplatz.<br>
      © ${new Date().getFullYear()} KleinDeal.de. Alle Rechte vorbehalten.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Template: E-Mail-Adresse bestätigen
 */
export async function sendVerificationEmail(email: string, token: string): Promise<EmailDeliveryResult> {
  const verifyUrl = `${env.APP_URL}/verifizieren?token=${token}`;

  const html = buildEmailHtml(
    'E-Mail-Adresse bestätigen',
    `
      <p>Willkommen bei KleinDeal.de!</p>
      <p>Bitte bestätige deine E-Mail-Adresse, um dein Benutzerkonto vollständig zu aktivieren und eigene Anzeigen zu veröffentlichen.</p>
      <p style="font-size: 12px; color: #68716A;">Dieser Bestätigungslink ist <strong>24 Stunden</strong> gültig.</p>
    `,
    { text: 'Jetzt E-Mail bestätigen', url: verifyUrl }
  );

  const text = `Willkommen bei KleinDeal.de!\n\nBitte bestätige deine E-Mail-Adresse unter folgendem Link:\n${verifyUrl}\n\nDieser Link ist 24 Stunden gültig.`;

  const result = await emailService.send({
    to: email,
    subject: 'Bitte bestätige deine E-Mail-Adresse – KleinDeal.de',
    html,
    text,
  });

  result.previewUrl = verifyUrl;
  return result;
}

/**
 * 2. Template: Passwort zurücksetzen
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<EmailDeliveryResult> {
  const resetUrl = `${env.APP_URL}/passwort-zuruecksetzen?token=${token}`;

  const html = buildEmailHtml(
    'Passwort zurücksetzen',
    `
      <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts auf KleinDeal.de gestellt.</p>
      <p>Klicke auf den folgenden Button, um ein neues sicheres Passwort festzulegen:</p>
      <p style="font-size: 12px; color: #68716A;">Dieser Link ist <strong>1 Stunde</strong> gültig und kann nur einmal verwendet werden. Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
    `,
    { text: 'Neues Passwort festlegen', url: resetUrl }
  );

  const text = `Passwort zurücksetzen – KleinDeal.de\n\nKlicke auf folgenden Link, um dein Passwort zurückzusetzen:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig.`;

  const result = await emailService.send({
    to: email,
    subject: 'Passwort zurücksetzen – KleinDeal.de',
    html,
    text,
  });

  result.previewUrl = resetUrl;
  return result;
}

/**
 * 3. Template: Passwort geändert Bestätigung
 */
export async function sendPasswordChangedEmail(email: string): Promise<EmailDeliveryResult> {
  const html = buildEmailHtml(
    'Dein Passwort wurde geändert',
    `
      <p>Dein Passwort für dein KleinDeal.de Konto wurde soeben erfolgreich aktualisiert.</p>
      <p style="color: #D94C3D; font-weight: 600;">Falls du diese Änderung nicht selbst vorgenommen hast, kontaktiere bitte umgehend unseren Support.</p>
    `
  );

  const text = `Dein Passwort für dein KleinDeal.de Konto wurde soeben erfolgreich aktualisiert.\n\nFalls du diese Änderung nicht selbst vorgenommen hast, kontaktiere uns bitte umgehend.`;

  return emailService.send({
    to: email,
    subject: 'Sicherheitshinweis: Dein Passwort wurde geändert – KleinDeal.de',
    html,
    text,
  });
}

/**
 * 4. Template: Sicherheitsrelevante Kontoänderung
 */
export async function sendSecurityAlertEmail(email: string, details: string): Promise<EmailDeliveryResult> {
  const html = buildEmailHtml(
    'Sicherheitsrelevante Änderung an deinem Konto',
    `
      <p>An deinem KleinDeal.de Benutzerkonto wurde eine sicherheitsrelevante Änderung vorgenommen:</p>
      <p><strong>${details}</strong></p>
      <p style="color: #68716A; font-size: 12px;">Datum & Uhrzeit: ${new Date().toLocaleString('de-DE')}</p>
    `
  );

  const text = `Sicherheitsrelevante Änderung an deinem KleinDeal.de Konto:\n\n${details}\n\nDatum: ${new Date().toLocaleString('de-DE')}`;

  return emailService.send({
    to: email,
    subject: 'Sicherheitshinweis zu deinem Konto – KleinDeal.de',
    html,
    text,
  });
}

/**
 * 5. Template: Neue Nachricht erhalten
 */
export async function sendMessageNotificationEmail(
  email: string,
  senderName: string,
  listingTitle: string,
  messageExcerpt: string,
  conversationId: string
): Promise<EmailDeliveryResult> {
  const chatUrl = `${env.APP_URL}/messages?conversationId=${conversationId}`;

  const html = buildEmailHtml(
    'Neue Nachricht erhalten',
    `
      <p><strong>${senderName}</strong> hat dir eine Nachricht bezüglich deiner Anzeige <strong>"${listingTitle}"</strong> gesendet:</p>
      <div style="background: #F6F7F4; border-left: 3px solid #17A673; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-style: italic; font-size: 13px; color: #151815;">
        "${messageExcerpt.substring(0, 300)}"
      </div>
      <p>Klicke auf den Button unten, um direkt im Chat zu antworten.</p>
    `,
    { text: 'Nachricht im Chat öffnen', url: chatUrl }
  );

  const text = `Neue Nachricht von ${senderName} zu "${listingTitle}":\n\n"${messageExcerpt}"\n\nAntworten: ${chatUrl}`;

  return emailService.send({
    to: email,
    subject: `Neue Nachricht von ${senderName} zu "${listingTitle}" – KleinDeal.de`,
    html,
    text,
  });
}

/**
 * 6. Template: Neues Preisangebot / Gegenangebot
 */
export async function sendOfferNotificationEmail(
  email: string,
  senderName: string,
  listingTitle: string,
  offerAmount: number,
  conversationId: string
): Promise<EmailDeliveryResult> {
  const chatUrl = `${env.APP_URL}/messages?conversationId=${conversationId}`;

  const html = buildEmailHtml(
    'Neues Preisangebot erhalten',
    `
      <p><strong>${senderName}</strong> hat dir ein Preisangebot über <span style="color: #17A673; font-weight: 800; font-size: 18px;">${offerAmount.toFixed(2)} €</span> für deine Anzeige <strong>"${listingTitle}"</strong> gemacht.</p>
      <p>Du kannst das Angebot im Nachrichtenbereich annehmen, ablehnen oder ein Gegenangebot machen.</p>
    `,
    { text: 'Angebot prüfen & verhandeln', url: chatUrl }
  );

  const text = `Neues Angebot von ${senderName}: ${offerAmount.toFixed(2)} € für "${listingTitle}".\n\nPrüfen unter: ${chatUrl}`;

  return emailService.send({
    to: email,
    subject: `Neues Angebot über ${offerAmount.toFixed(2)} € für "${listingTitle}" – KleinDeal.de`,
    html,
    text,
  });
}

/**
 * 7. Template: Bewertungsanfrage nach erfolgreicher Übergabe
 */
export async function sendReviewRequestEmail(
  email: string,
  otherPartyName: string,
  listingTitle: string
): Promise<EmailDeliveryResult> {
  const profileUrl = `${env.APP_URL}/profile?tab=transactions`;

  const html = buildEmailHtml(
    'Wie war deine Erfahrung?',
    `
      <p>Die Übergabe für <strong>"${listingTitle}"</strong> mit <strong>${otherPartyName}</strong> wurde erfolgreich abgeschlossen.</p>
      <p>Bitte nimm dir eine Minute Zeit, um ${otherPartyName} zu bewerten. Deine Bewertung stärkt das Vertrauen in unserer Gemeinschaft.</p>
    `,
    { text: 'Jetzt Bewertung abgeben', url: profileUrl }
  );

  const text = `Transaktion für "${listingTitle}" abgeschlossen!\n\nBitte bewerte deine Erfahrung mit ${otherPartyName} unter: ${profileUrl}`;

  return emailService.send({
    to: email,
    subject: `Bewerte deine Erfahrung mit ${otherPartyName} – KleinDeal.de`,
    html,
    text,
  });
}

