'use client';

import { ReactNode } from 'react';
import { useRole } from '@/app/hooks/useRole';
import { RoleValues } from '@/app/constants/roles';
import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  allowedRoles: RoleValues[];
  children: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
  mode?: 'any' | 'all';
}

export const RoleGuard = ({
  allowedRoles,
  children,
  loadingFallback = null,
  fallback = null,
  mode = 'any'
}: RoleGuardProps) => {
  const { hasRole, } = useRole();
  const { status } = useSession(); 

  if (status === 'loading') {
    return <>{loadingFallback}</>;
  }

  const hasPermission = mode === 'any' 
    ? allowedRoles.some(r => hasRole([r]))
    : allowedRoles.every(r => hasRole([r]));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};