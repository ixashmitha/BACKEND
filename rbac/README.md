# RBAC Permission Management System

A complete full-stack Role Based Access Control system built with Node.js, Express, SQL Server, and vanilla JavaScript.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- SQL Server (2016 or later) / SQL Server Express
- npm

---

## 📦 Installation

### 1. Clone / Extract project
```
rbac/
├── backend/
└── frontend/
```

### 2. Setup Database
Open SQL Server Management Studio (SSMS) or `sqlcmd` and run:

```sql
-- Run the setup script:
-- backend/config/setup.sql
```

This creates the `RBACSystem` database with all tables, roles, modules, and permissions.

### 3. Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your SQL Server credentials:
```
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_SERVER=localhost
DB_NAME=RBACSystem
JWT_SECRET=change_this_to_something_secure
```

### 4. Install Dependencies
```bash
cd backend
npm install
```

### 5. Seed Default Users
```bash
node seed.js
```

This creates 4 default users with password `Admin@123`:
- `superadmin@rbac.com` → SuperAdmin
- `admin@rbac.com` → Admin
- `manager@rbac.com` → Manager
- `employee@rbac.com` → Employee

### 6. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Open: **http://localhost:5000/login.html**

---

## 🏗️ Architecture

### Backend
```
backend/
├── config/
│   ├── db.js           # SQL Server connection pool
│   └── setup.sql       # Database schema + seed
├── controllers/
│   ├── authController.js
│   ├── usersController.js
│   ├── reportsController.js
│   ├── rolesController.js
│   └── permissionsController.js
├── middleware/
│   └── auth.js         # verifyToken + checkPermission
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── reports.js
│   ├── roles.js
│   └── permissions.js
├── app.js
└── seed.js
```

### Frontend
```
frontend/
├── login.html
├── dashboard.html
├── reports.html
├── users.html
├── roleManagement.html
├── permissions.html
├── settings.html
├── css/
│   └── styles.css
└── js/
    ├── api.js          # HTTP client + toast notifications
    ├── auth.js         # Login + JWT management
    ├── sidebar.js      # Dynamic sidebar loader
    ├── reports.js
    ├── users.js
    ├── roles.js
    └── permissions.js
```

---

## 🔐 Default Role Permissions

| Module              | SuperAdmin | Admin | Manager | Employee |
|---------------------|-----------|-------|---------|----------|
| Dashboard           | Full      | Read  | Read    | Read     |
| Reports             | Full      | Full  | C+R+U   | Read     |
| Users               | Full      | Full  | Read    | —        |
| Settings            | Full      | C+R+U | Read   | —        |
| RoleManagement      | Full      | Read  | —       | —        |
| PermissionManagement| Full      | R+U   | —       | —        |

---

## 🌐 API Endpoints

### Auth
- `POST /api/login`

### Users
- `GET    /api/users`
- `POST   /api/users`
- `PUT    /api/users/:id`
- `DELETE /api/users/:id`

### Reports
- `GET    /api/reports`
- `POST   /api/reports`
- `PUT    /api/reports/:id`
- `DELETE /api/reports/:id`

### Roles
- `GET    /api/roles`
- `POST   /api/roles`
- `DELETE /api/roles/:id`

### Permissions
- `GET    /api/permissions/:roleId`
- `PUT    /api/permissions/:roleId`
- `GET    /api/permissions/module-permissions/:moduleName`
- `GET    /api/permissions/modules` (sidebar)

---

## 🛡️ Security Features
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens with configurable expiry
- Every API route protected with `verifyToken`
- CRUD actions double-checked with `checkPermission`
- Soft-delete for users (no data loss)
- Audit log for all CRUD operations
- System roles protected from deletion
