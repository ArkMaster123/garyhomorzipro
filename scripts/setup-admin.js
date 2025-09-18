#!/usr/bin/env node

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user, adminUser } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';

// Load environment variables
config({
  path: '.env.local',
});

const ADMIN_EMAIL = 'noah.santoni@gmail.com';

async function setupAdmin() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in .env.local');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('🔍 Looking for user with email:', ADMIN_EMAIL);
    
    // Check if user exists
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL));

    if (existingUsers.length === 0) {
      console.log('❌ User not found in database. Please sign up first.');
      console.log('   Visit your app and create an account with:', ADMIN_EMAIL);
      process.exit(1);
    }

    const targetUser = existingUsers[0];
    console.log('✅ Found user:', targetUser.email, '(ID:', targetUser.id + ')');

    // Check if user is already an admin
    const existingAdmins = await db
      .select()
      .from(adminUser)
      .where(eq(adminUser.userId, targetUser.id));

    if (existingAdmins.length > 0) {
      console.log('✅ User is already an admin!');
      console.log('   Admin details:', existingAdmins[0]);
      process.exit(0);
    }

    // Remove any existing admins (make this the only admin)
    console.log('🗑️  Removing all existing admins...');
    await db.delete(adminUser);
    console.log('✅ All existing admins removed');

    // Add the user as admin
    console.log('👑 Adding user as admin...');
    const [newAdmin] = await db
      .insert(adminUser)
      .values({
        userId: targetUser.id,
        role: 'admin',
        permissions: { 
          canManageKnowledgeBase: true, 
          canManageEmails: true,
          canManageUsers: true,
          canViewAnalytics: true
        }
      })
      .returning();

    console.log('✅ Admin setup complete!');
    console.log('   Admin ID:', newAdmin.userId);
    console.log('   Role:', newAdmin.role);
    console.log('   Permissions:', newAdmin.permissions);
    console.log('');
    console.log('🎉 You now have admin access to /admin');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupAdmin();
