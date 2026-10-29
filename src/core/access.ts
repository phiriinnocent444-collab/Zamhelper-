/**
 * ZamHelper Access & Security Controls (RBAC)
 * Controls page and action permissions for customer, helper, and admin roles.
 */

import { UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['customer', 'helper', 'admin'],
  book: ['customer', 'admin'],
  payments: ['customer', 'admin'],
  helper_workspace: ['helper'],
  admin: ['admin'],
  verify_documents: ['admin'],
  submit_verification: ['helper'],
  leave_review: ['customer', 'admin']
};

/**
 * Checks whether a given role is authorized to perform an action or view a section.
 */
export function roleCan(role: UserRole, permissionKey: string): boolean {
  const allowed = ROLE_PERMISSIONS[permissionKey];
  if (!allowed) {
    throw new Error(`Unknown access permission key: ${permissionKey}`);
  }
  return allowed.includes(role);
}

/**
 * Sanitizes phone numbers to standard Zambian format e.g. +260 772 300 053 or 097...
 */
export function formatZambianPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('260')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+260 ${cleaned.substring(1)}`;
  if (!cleaned.startsWith('+')) return `+${cleaned}`;
  return cleaned;
}
