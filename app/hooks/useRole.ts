"use client";

import { RoleValues, ROLES } from "@/app/constants/roles";
import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session } = useSession();

  const hasRole = (allowedRoles: RoleValues[]) => {
    return allowedRoles.includes(session?.info?.role as RoleValues);
  };

  const isAdmin = session?.info?.role === ROLES.ADMIN;
  const isRecomendador = session?.info?.role === ROLES.RECOMENDADOR;
  const isAlumno = session?.info?.role === ROLES.ALUMNO;
  const isTutor = session?.info?.role === ROLES.TUTOR;
  const isProfesor = session?.info?.role === ROLES.PROFESOR;

  return {
    hasRole,
    isAdmin,
    isRecomendador,
    isAlumno,
    isTutor,
    isProfesor,
    role: session?.info?.role,
  };
};