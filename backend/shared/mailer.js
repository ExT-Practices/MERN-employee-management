const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

function isConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isConfigured()) return null;
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    host: process.env.SMTP_HOST || undefined,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html, text }) {
  if (!to) return { skipped: true, reason: 'no-recipient' };
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email skipped: set SMTP_USER and SMTP_PASS in backend/.env');
    return { skipped: true, reason: 'not-configured' };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const info = await transporter.sendMail({ from, to, subject, html, text });
  console.log(`Email sent to ${to} (${info.messageId})`);
  return { skipped: false, messageId: info.messageId, response: info.response };
}

async function verifySmtp() {
  if (!isConfigured()) {
    return { ok: false, reason: 'not-configured' };
  }
  const transporter = getTransporter();
  await transporter.verify();
  return { ok: true, user: process.env.SMTP_USER };
}

function sendMailSafe(options) {
  sendMail(options).catch((err) => {
    console.error('Email failed:', err.message);
  });
}

function welcomeEmployeeEmail({ name, email, empCode, username, password }) {
  const loginHint = username
    ? `<p>Employee portal: <strong>http://localhost:5002</strong><br/>Username: <strong>${username}</strong>${password ? `<br/>Password: <strong>${password}</strong>` : ''}</p>`
    : '<p>You can also sign in with Google on the Employee portal: http://localhost:5002</p>';
  return {
    to: email,
    subject: `Welcome to Employee Management, ${name}`,
    text: `Hi ${name}, your employee profile (${empCode || ''}) has been created.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1e293b">
        <h2>Welcome, ${name}</h2>
        <p>Your employee profile has been created.</p>
        ${empCode ? `<p>Employee code: <strong>${empCode}</strong></p>` : ''}
        ${loginHint}
        <p>— Employee Management System</p>
      </div>
    `,
  };
}

function welcomeUserEmail({ username, role, email, password }) {
  const portal = role === 'Employee' ? 'http://localhost:5002' : 'http://localhost:5001';
  return {
    to: email,
    subject: `Your ${role} account is ready`,
    text: `Hi ${username}, your ${role} account is ready. Portal: ${portal}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1e293b">
        <h2>Account created</h2>
        <p>Username: <strong>${username}</strong></p>
        <p>Role: <strong>${role}</strong></p>
        ${password ? `<p>Password: <strong>${password}</strong></p>` : ''}
        <p>Login: <a href="${portal}">${portal}</a></p>
        <p>You can also sign in with Google.</p>
      </div>
    `,
  };
}

module.exports = {
  isConfigured,
  sendMail,
  sendMailSafe,
  verifySmtp,
  welcomeEmployeeEmail,
  welcomeUserEmail,
};
