const { isConfigured, verifySmtp, sendMail } = require('../shared/mailer');

async function main() {
  const to = process.argv[2] || process.env.SMTP_USER;

  if (!isConfigured()) {
    console.log('NOT WORKING YET: SMTP_USER and SMTP_PASS are empty in backend/.env');
    console.log('');
    console.log('1. Enable Google 2-Step Verification');
    console.log('2. Create an App Password: https://myaccount.google.com/apppasswords');
    console.log('3. Put them in backend/.env:');
    console.log('     SMTP_USER=yourgmail@gmail.com');
    console.log('     SMTP_PASS=xxxx xxxx xxxx xxxx   (16-char App Password)');
    console.log('     SMTP_FROM=Employee Management <yourgmail@gmail.com>');
    console.log('4. Run again:  npm run test:mail -- yourgmail@gmail.com');
    process.exit(1);
  }

  console.log('Checking Gmail SMTP login...');
  try {
    const check = await verifySmtp();
    console.log(`SMTP login OK as ${check.user}`);
  } catch (err) {
    console.error('SMTP login FAILED:', err.message);
    console.error('Use a Google App Password, not your normal Gmail password.');
    process.exit(1);
  }

  if (!to) {
    console.log('SMTP is configured. To send a real test email:');
    console.log('  npm run test:mail -- you@gmail.com');
    return;
  }

  console.log(`Sending test email to ${to}...`);
  const result = await sendMail({
    to,
    subject: 'Nodemailer test — Employee Management',
    text: 'If you received this, nodemailer is working.',
    html: '<p>If you received this, <strong>nodemailer is working</strong>.</p>',
  });
  console.log('Send result:', result);
  console.log('Check Inbox and Spam for that address.');
}

main().catch((err) => {
  console.error('Email send FAILED:', err.message);
  process.exit(1);
});
