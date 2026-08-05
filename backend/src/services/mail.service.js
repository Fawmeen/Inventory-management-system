const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'Inventory System <no-reply@example.com>';

function isMailConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransporter() {
  if (!isMailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function buildProductEmail(product) {
  return {
    subject: `New product available: ${product.name}`,
    text: `A new product has been added:\n\n` +
      `Name: ${product.name}\n` +
      `Category: ${product.category}\n` +
      `Price: $${Number(product.price).toFixed(2)}\n` +
      `Stock: ${product.stock}\n` +
      `Description: Check it out on the inventory app!`,
    html: `
      <h2>New product available</h2>
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Price:</strong> $${Number(product.price).toFixed(2)}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p>Visit the app to buy or learn more.</p>
    `,
  };
}

async function sendNewProductEmail(product, recipients) {
  if (!recipients || recipients.length === 0) {
    return;
  }

  const transporter = createTransporter();
  const mail = buildProductEmail(product);

  if (!transporter) {
    console.log('Mail is not configured. New product email would be sent to:', recipients);
    console.log('Product:', product);
    return;
  }

  const mailOptions = {
    from: MAIL_FROM,
    to: MAIL_FROM,
    bcc: recipients,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendNewProductEmail, isMailConfigured };
