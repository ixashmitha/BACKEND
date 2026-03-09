/**
 * Seed Script - Creates default users with bcrypt hashed passwords
 * Run: node seed.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('./config/db');

const defaultUsers = [
  { name: 'Super Admin', email: 'superadmin@rbac.com', password: 'Admin@123', role_id: 1 },
  { name: 'Admin User',  email: 'admin@rbac.com',      password: 'Admin@123', role_id: 2 },
  { name: 'Manager User',email: 'manager@rbac.com',    password: 'Admin@123', role_id: 3 },
  { name: 'Employee User',email: 'employee@rbac.com',  password: 'Admin@123', role_id: 4 },
];

async function seed() {
  try {
    const pool = await getPool();

    for (const user of defaultUsers) {
      const hash = await bcrypt.hash(user.password, 12);

      // Check if exists
      const check = await pool.request()
        .input('email', sql.NVarChar, user.email)
        .query('SELECT id FROM Users WHERE email = @email');

      if (check.recordset.length === 0) {
        await pool.request()
          .input('name', sql.NVarChar, user.name)
          .input('email', sql.NVarChar, user.email)
          .input('password_hash', sql.NVarChar, hash)
          .input('role_id', sql.Int, user.role_id)
          .query('INSERT INTO Users (name, email, password_hash, role_id) VALUES (@name, @email, @password_hash, @role_id)');

        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⚠️  User already exists: ${user.email}`);
      }
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\nDefault credentials (all passwords: Admin@123):');
    defaultUsers.forEach(u => console.log(`  ${u.email}`));
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
