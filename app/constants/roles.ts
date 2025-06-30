export const ROLES = {
  ADMIN: "ADMIN",
  RECOMENDADOR: "recomendador",
  ALUMNO: "ALUMNO",
  TUTOR: "TUTOR",
  PROFESOR: "profesor",
} as const;

export type RoleKeys = keyof typeof ROLES;
export type RoleValues = (typeof ROLES)[RoleKeys];