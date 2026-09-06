import nodemailer from 'nodemailer';
import { renderCustomerWelcomeEmailHTML, renderInvoiceEmailHTML } from '../../shared/utils/emailTemplates.js';

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      pool: true, // Use persistent socket pool for ultra-fast mail delivery!
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback mode: JsonTransporter / Console logger for dev
    console.log('ℹ️ SMTP not configured. Initializing Dev/Console Mail Transporter.');
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }
  return transporter;
};

/**
 * Send Customer Welcome & Temporary Credentials Email
 */
export const sendCustomerWelcomeEmail = async ({
  customerName,
  contactName,
  customerEmail,
  tempPassword,
  portalUrl,
}) => {
  const mailer = createTransporter();
  const html = renderCustomerWelcomeEmailHTML({
    customerName,
    contactName,
    customerEmail,
    tempPassword,
    portalUrl,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"DealFlow 360" <no-reply@dealflow360.com>',
    to: customerEmail,
    subject: `⚡ Welcome to DealFlow 360 — Your Customer Portal Access Credentials`,
    html,
  };

  const info = await mailer.sendMail(mailOptions);
  console.log(`📧 Customer Welcome Email sent to ${customerEmail}. Message ID: ${info.messageId || 'console-mode'}`);
  return { success: true, messageId: info.messageId || 'console-mode' };
};

/**
 * Send Commercial Invoice Delivery Email
 */
export const sendInvoiceEmail = async ({
  customerName,
  customerEmail,
  invoiceNumber,
  orderNumber,
  issuedDate,
  dueDate,
  items,
  subtotal,
  discountAmount,
  taxAmount,
  totalAmount,
  portalUrl,
}) => {
  const mailer = createTransporter();
  const html = renderInvoiceEmailHTML({
    customerName,
    customerEmail,
    invoiceNumber,
    orderNumber,
    issuedDate,
    dueDate,
    items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    portalUrl,
  });

  const recipientList = Array.isArray(customerEmail) ? customerEmail.join(', ') : customerEmail;
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"DealFlow 360 Finance" <billing@dealflow360.com>',
    to: recipientList,
    subject: `📄 Commercial Tax Invoice #${invoiceNumber} from DealFlow 360`,
    html,
  };

  const info = await mailer.sendMail(mailOptions);
  console.log(`📧 Invoice Email sent to [${recipientList}]. Message ID: ${info.messageId || 'console-mode'}`);
  return { success: true, messageId: info.messageId || 'console-mode' };
};
