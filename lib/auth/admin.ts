import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { adminUser } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export interface AdminUser {
  userId: string;
  role: string;
  permissions: {
    canManageKnowledgeBase: boolean;
    canManageEmails: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<AdminUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const admin = await db
      .select()
      .from(adminUser)
      .where(eq(adminUser.userId, session.user.id))
      .limit(1);

    return admin.length > 0 ? admin[0] as AdminUser : null;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
}

/**
 * Check if the current user has specific admin permission
 */
export async function hasAdminPermission(permission: keyof AdminUser['permissions']): Promise<boolean> {
  const admin = await isAdmin();
  return admin?.permissions[permission] ?? false;
}

/**
 * Middleware helper to check admin access for API routes
 */
export async function requireAdmin(request?: NextRequest): Promise<AdminUser> {
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error('Admin access required');
  }
  
  return admin;
}

/**
 * Check if user can access admin routes
 */
export async function canAccessAdmin(): Promise<boolean> {
  const admin = await isAdmin();
  return admin !== null;
}
