const { OAuth2Client } = require('google-auth-library');
const { callProcedure, callProcedureWithOut, pool } = require('./db');
const { hashPassword, signToken } = require('./auth');
const { sendMailSafe, welcomeUserEmail, welcomeEmployeeEmail } = require('./mailer');

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || '';
}

async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google login is not configured. Set GOOGLE_CLIENT_ID in backend/.env');
  }
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Google account has no email');
  }
  if (payload.email_verified === false) {
    throw new Error('Google email is not verified');
  }
  return {
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    googleId: payload.sub,
  };
}

async function findUser(profile) {
  let rows = await callProcedure('sp_get_user_by_google_id', [profile.googleId]);
  if (rows && rows.length) return rows[0];
  rows = await callProcedure('sp_get_user_by_email', [profile.email]);
  if (rows && rows.length) return rows[0];
  return null;
}

async function uniqueUsername(base) {
  const clean = String(base || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40) || 'user';
  let username = clean;
  let n = 0;
  while (true) {
    const existing = await callProcedure('sp_get_user_by_username', [username]);
    if (!existing || existing.length === 0) return username;
    n += 1;
    username = `${clean}${n}`;
  }
}

async function createGoogleUser(profile, role) {
  const username = await uniqueUsername(profile.email.split('@')[0]);
  const hashed = await hashPassword(`google:${profile.googleId}:${Date.now()}`);
  const out = await callProcedureWithOut('sp_create_user', [username, hashed, role], 1);
  await callProcedure('sp_link_google', [out.out0, profile.email, profile.googleId]);
  const rows = await callProcedure('sp_get_user_by_google_id', [profile.googleId]);
  return rows[0];
}

async function linkFirstAdmin(profile) {
  const [admins] = await pool.query(
    `SELECT id, username, password, email, google_id, role
     FROM users
     WHERE role = 'Admin' AND (email IS NULL OR email = '') AND (google_id IS NULL OR google_id = '')
     ORDER BY id ASC
     LIMIT 2`
  );
  if (admins.length === 1) {
    await callProcedure('sp_link_google', [admins[0].id, profile.email, profile.googleId]);
    const rows = await callProcedure('sp_get_user_by_google_id', [profile.googleId]);
    return rows[0];
  }
  return null;
}

function authResult(user) {
  return {
    success: true,
    message: 'Google login successful',
    token: signToken(user),
    user: { id: user.id, username: user.username, role: user.role, email: user.email },
  };
}

async function googleLoginForAdmin(credential) {
  const profile = await verifyGoogleCredential(credential);
  let user = await findUser(profile);
  let created = false;
  if (!user) {
    user = await linkFirstAdmin(profile);
  }
  if (!user) {
    user = await createGoogleUser(profile, 'Admin');
    created = true;
  }
  if (user.role !== 'Admin') {
    await pool.query(`UPDATE users SET role = 'Admin' WHERE id = ?`, [user.id]);
    user.role = 'Admin';
  }
  if (!user.google_id) {
    await callProcedure('sp_link_google', [user.id, profile.email, profile.googleId]);
  }
  if (created) {
    sendMailSafe(welcomeUserEmail({
      username: user.username,
      role: 'Admin',
      email: profile.email,
    }));
  }
  return authResult(user);
}

async function googleLoginForEmployee(credential) {
  const profile = await verifyGoogleCredential(credential);
  let user = await findUser(profile);
  if (user) {
    if (!user.google_id) {
      await callProcedure('sp_link_google', [user.id, profile.email, profile.googleId]);
    }
    if (user.role !== 'Employee') {
      await pool.query(`UPDATE users SET role = 'Employee' WHERE id = ?`, [user.id]);
      user.role = 'Employee';
    }
    return authResult(user);
  }
  user = await createGoogleUser(profile, 'Employee');
  const parts = (profile.name || '').trim().split(/\s+/);
  const firstName = parts[0] || profile.email.split('@')[0];
  const lastName = parts.slice(1).join(' ') || 'User';
  const empCode = `G${String(user.id).padStart(4, '0')}`;
  try {
    await callProcedureWithOut(
      'sp_add_employee',
      [user.id, empCode, firstName, lastName, profile.email, null, null, null, 0, null],
      1
    );
  } catch {
    // Profile insert is optional if email/code already exists
  }
  sendMailSafe(welcomeEmployeeEmail({
    name: `${firstName} ${lastName}`.trim(),
    email: profile.email,
    empCode,
  }));
  return authResult(user);
}

module.exports = {
  getGoogleClientId,
  googleLoginForAdmin,
  googleLoginForEmployee,
};
