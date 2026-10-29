# MERN _ Employee Management _ Gaurav Kesharwani

**Name:** Gaurav Kesharwani  
**Repo:** [ExT-Practices/mern_employee_management_gaurav_kesharwani](https://github.com/ExT-Practices/mern_employee_management_gaurav_kesharwani)

## Folder structure

```
backend/     → MySQL + Express APIs (port 5001 & 5002)
admin/       → React UI for Admin, HR, Manager
frontend/    → React UI for Employee
```

## Ports

| App | URL | Roles |
|-----|-----|-------|
| Admin portal | http://localhost:5001 | Admin, HR, Manager |
| Employee frontend | http://localhost:5002 | Employee |

## Role dashboards

### Admin Dashboard (after Admin login)
- Add / Update / Delete Employee
- Register User (Admin only)

### HR Dashboard (after HR login)
- Add / Update Employee

### Manager Dashboard (after Manager login)
- View Employees

### Employee Dashboard (`frontend/`)
- View Own Profile
- View All Employees
- Delete Employee

## Default pages
- **Admin portal**: Login + Register + **Google login**
- **Employee frontend**: Login + **Google login**

## Google login
1. Create an OAuth Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (type: Web application).
2. Authorized JavaScript origins:
   - `http://localhost:5001`
   - `http://localhost:5002`
3. Put the Client ID in `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```
4. Run `npm run migrate:google` once (adds email/google_id columns).
5. **Any Google account can login.**
   - Admin portal: new Gmail becomes Admin (first login can also link the seed `admin` user).
   - Employee portal: new Gmail becomes Employee.

## Email (nodemailer + Gmail)

Welcome emails are sent when:
- Admin/HR **adds an employee** (to that employee's email)
- Admin **registers a user** and fills in an email
- A **new Google account** signs up

Add these to `backend/.env` (do not commit real passwords):

```
SMTP_SERVICE=gmail
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=Employee Management <yourgmail@gmail.com>
```

Gmail App Password (required; your normal Gmail password will not work):
1. Turn on [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification).
2. Open [App passwords](https://myaccount.google.com/apppasswords).
3. Create one for **Mail**.
4. Paste the 16-character password as `SMTP_PASS`.

If SMTP is empty, APIs still succeed and the server logs `Email skipped`.

Check that mail works:

```bash
npm run test:mail -- yourgmail@gmail.com
```

- `SMTP login OK` + `Email sent` = nodemailer is working. Open Inbox/Spam.
- `NOT WORKING YET` = fill `SMTP_USER` / `SMTP_PASS` first.
- `SMTP login FAILED` = wrong App Password (not your normal Gmail password).

## Setup

```bash
# .env is in backend/.env
npm run install-all
npm run setup
npm run seed
npm start
```

## Demo logins (password: `password123`)

| User | Portal |
|------|--------|
| admin | http://localhost:5001 → Admin Dashboard |
| hr | http://localhost:5001 → HR Dashboard |
| manager | http://localhost:5001 → Manager Dashboard |
| employee2 | http://localhost:5002 → Employee Dashboard |
