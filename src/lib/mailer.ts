import nodemailer from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@arogyavruksham.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export async function sendMail(to, subject, html, text) {
  const htmlContent = typeof html === 'string' ? html : renderToStaticMarkup(html);
  const plainText = text ?? htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html: htmlContent, text: plainText });
}
