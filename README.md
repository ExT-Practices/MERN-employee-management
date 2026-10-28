# Employee Management System

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
5. First Admin Google login links to the existing `admin` user if that user has no email yet.
6. Employee Google login creates an Employee account if the Gmail is new.

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
