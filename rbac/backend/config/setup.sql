-- ============================================================
-- RBAC Permission Management System - Database Setup Script
-- Run this in SQL Server Management Studio or sqlcmd
-- ============================================================

USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'RBACSystem')
BEGIN
    CREATE DATABASE RBACSystem;
    PRINT 'Database RBACSystem created.';
END
GO

USE RBACSystem;
GO

-- ============================================================
-- DROP existing tables (for clean setup)
-- ============================================================
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.Permissions', 'U') IS NOT NULL DROP TABLE dbo.Permissions;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Modules', 'U') IS NOT NULL DROP TABLE dbo.Modules;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.Reports', 'U') IS NOT NULL DROP TABLE dbo.Reports;
GO

-- ============================================================
-- Roles Table
-- ============================================================
CREATE TABLE Roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL UNIQUE,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    email NVARCHAR(200) NOT NULL UNIQUE,
    password_hash NVARCHAR(500) NOT NULL,
    role_id INT NOT NULL,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);
GO

-- ============================================================
-- Modules Table
-- ============================================================
CREATE TABLE Modules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    module_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    display_order INT DEFAULT 0
);
GO

-- ============================================================
-- Permissions Table
-- ============================================================
CREATE TABLE Permissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    module_id INT NOT NULL,
    can_create BIT DEFAULT 0,
    can_read BIT DEFAULT 0,
    can_update BIT DEFAULT 0,
    can_delete BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (module_id) REFERENCES Modules(id),
    UNIQUE (role_id, module_id)
);
GO

-- ============================================================
-- AuditLogs Table
-- ============================================================
CREATE TABLE AuditLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action NVARCHAR(100) NOT NULL,
    entity_name NVARCHAR(100),
    entity_id INT,
    details NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
GO

-- ============================================================
-- Reports Table
-- ============================================================
CREATE TABLE Reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    report_type NVARCHAR(100),
    created_by INT,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES Users(id)
);
GO

-- ============================================================
-- Seed Roles
-- ============================================================
INSERT INTO Roles (role_name) VALUES
    ('SuperAdmin'),
    ('Admin'),
    ('Manager'),
    ('Employee');
GO

-- ============================================================
-- Seed Modules
-- ============================================================
INSERT INTO Modules (module_name, description, display_order) VALUES
    ('Dashboard', 'Main dashboard overview', 1),
    ('Reports', 'View and manage reports', 2),
    ('Users', 'User management', 3),
    ('Settings', 'System settings', 4),
    ('RoleManagement', 'Manage system roles', 5),
    ('PermissionManagement', 'Manage role permissions', 6);
GO

-- ============================================================
-- Seed Permissions for SuperAdmin (full access to everything)
-- ============================================================
INSERT INTO Permissions (role_id, module_id, can_create, can_read, can_update, can_delete)
SELECT 1, id, 1, 1, 1, 1 FROM Modules;
GO

-- ============================================================
-- Seed Permissions for Admin
-- ============================================================
INSERT INTO Permissions (role_id, module_id, can_create, can_read, can_update, can_delete)
VALUES
    (2, 1, 0, 1, 0, 0),  -- Dashboard: read only
    (2, 2, 1, 1, 1, 1),  -- Reports: full
    (2, 3, 1, 1, 1, 1),  -- Users: full
    (2, 4, 1, 1, 1, 0),  -- Settings: no delete
    (2, 5, 0, 1, 0, 0),  -- RoleManagement: read only
    (2, 6, 0, 1, 1, 0);  -- PermissionManagement: read+update
GO

-- ============================================================
-- Seed Permissions for Manager
-- ============================================================
INSERT INTO Permissions (role_id, module_id, can_create, can_read, can_update, can_delete)
VALUES
    (3, 1, 0, 1, 0, 0),  -- Dashboard: read only
    (3, 2, 1, 1, 1, 0),  -- Reports: no delete
    (3, 3, 0, 1, 0, 0),  -- Users: read only
    (3, 4, 0, 1, 0, 0);  -- Settings: read only
GO

-- ============================================================
-- Seed Permissions for Employee
-- ============================================================
INSERT INTO Permissions (role_id, module_id, can_create, can_read, can_update, can_delete)
VALUES
    (4, 1, 0, 1, 0, 0),  -- Dashboard: read only
    (4, 2, 0, 1, 0, 0);  -- Reports: read only
GO

-- ============================================================
-- Seed Default Users (passwords: Admin@123)
-- bcrypt hash of "Admin@123"
-- ============================================================
-- NOTE: Run the Node.js seed script (seed.js) to create users with proper bcrypt hashes
-- Or manually update these after running: node seed.js

PRINT 'Database setup complete!';
PRINT 'Run: node seed.js to create default users with hashed passwords';
GO
