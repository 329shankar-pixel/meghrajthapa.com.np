import { usePage } from '@inertiajs/react';

export function usePermission(permission: string | string[]): boolean {
  const { auth } = usePage().props as any;
  const userPermissions = auth.permissions || [];
  const isAdmin = auth.isAdmin || false;

  if (isAdmin) {
    return true;
  }

  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }

  return userPermissions.includes(permission);
}
