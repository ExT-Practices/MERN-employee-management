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
- **Admin portal**: Login + Register (Register only works when logged in as Admin)
- **Employee frontend**: Login

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
