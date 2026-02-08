/**
 * Admin Authentication & Authorization
 * 
 * This module provides secure admin access controls for the Super Admin dashboard.
 */

import { auth } from "./auth";
import prisma from "./prisma";
import { redirect } from "next/navigation";

// Available permissions
export const PERMISSIONS = {
  // User management
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  USERS_DELETE: "users.delete",
  
  // Subscription management
  SUBSCRIPTIONS_READ: "subscriptions.read",
  SUBSCRIPTIONS_WRITE: "subscriptions.write",
  SUBSCRIPTIONS_DELETE: "subscriptions.delete",
  
  // Product management
  PRODUCTS_READ: "products.read",
  PRODUCTS_WRITE: "products.write",
  PRODUCTS_DELETE: "products.delete",
  
  // Support tickets
  TICKETS_READ: "tickets.read",
  TICKETS_WRITE: "tickets.write",
  TICKETS_DELETE: "tickets.delete",
  
  // Invoices
  INVOICES_READ: "invoices.read",
  INVOICES_WRITE: "invoices.write",
  INVOICES_DELETE: "invoices.delete",
  
  // Settings
  SETTINGS_READ: "settings.read",
  SETTINGS_WRITE: "settings.write",
  
  // Audit logs
  AUDIT_READ: "audit.read",
  
  // API management
  API_MANAGE: "api.manage",
} as const;

// Super admin has all permissions
export const SUPER_ADMIN_PERMISSIONS = Object.values(PERMISSIONS);

// Regular admin permissions (subset)
export const ADMIN_PERMISSIONS = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.SUBSCRIPTIONS_READ,
  PERMISSIONS.SUBSCRIPTIONS_WRITE,
  PERMISSIONS.PRODUCTS_READ,
  PERMISSIONS.PRODUCTS_WRITE,
  PERMISSIONS.TICKETS_READ,
  PERMISSIONS.TICKETS_WRITE,
  PERMISSIONS.INVOICES_READ,
];

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
}

/**
 * Check if user is an admin (admin or super_admin)
 */
export function isAdmin(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}

/**
 * Get permissions for a user
 */
export function getUserPermissions(role: string, storedPermissions?: string | null): Permission[] {
  if (role === "super_admin") {
    return SUPER_ADMIN_PERMISSIONS;
  }
  
  if (role === "admin" && storedPermissions) {
    try {
      return JSON.parse(storedPermissions) as Permission[];
    } catch {
      return ADMIN_PERMISSIONS;
    }
  }
  
  if (role === "admin") {
    return ADMIN_PERMISSIONS;
  }
  
  return [];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permissions: Permission[], required: Permission): boolean {
  return permissions.includes(required);
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(permissions: Permission[], required: Permission[]): boolean {
  return required.every(p => permissions.includes(p));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(permissions: Permission[], required: Permission[]): boolean {
  return required.some(p => permissions.includes(p));
}

/**
 * Get current admin user with permissions - for server components
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }
    
    // Try by id first, then fallback to email
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    });
    
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
        },
      });
    }
    
    if (!user || !isAdmin(user.role)) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: getUserPermissions(user.role, user.permissions),
    };
  } catch {
    return null;
  }
}

/**
 * Require admin access - redirects if not admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  
  if (!admin) {
    redirect("/portal/login?error=unauthorized");
  }
  
  return admin;
}

/**
 * Require specific permission - redirects if not authorized
 */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const admin = await requireAdmin();
  
  if (!hasPermission(admin.permissions, permission)) {
    redirect("/admin?error=no_permission");
  }
  
  return admin;
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: string,
  targetId?: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>,
  request?: { ip?: string; userAgent?: string }
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminEmail,
        action,
        targetType,
        targetId,
        before: before ? JSON.stringify(before) : null,
        after: after ? JSON.stringify(after) : null,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

/**
 * Get admin stats for dashboard
 */
export async function getAdminStats() {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      openTickets,
      totalProducts,
      monthlyRevenue,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.supportTicket.count({ where: { status: { notIn: ["closed", "resolved"] } } }),
      prisma.product.count(),
      prisma.subscription.aggregate({
        where: { status: "active" },
        _sum: { monthlyPrice: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      openTickets,
      totalProducts,
      monthlyRevenue: monthlyRevenue._sum.monthlyPrice || 0,
      recentUsers,
    };
  } catch {
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      openTickets: 0,
      totalProducts: 0,
      monthlyRevenue: 0,
      recentUsers: [] as { id: string; name: string; email: string; createdAt: Date; role: string }[],
    };
  }
}
