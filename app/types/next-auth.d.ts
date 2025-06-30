import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    token: string;
    userId: string;
    nombreCompleto: string;
    email: string;
    image?: string;
    role?: string;
    isActive?: boolean;
  }

  interface Session {
    token: string;
    info: {
      userId: string;
      nombreCompleto: string;
      email: string;
      image?: string;
      role?: string;
      isActive?: boolean;
    };
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token: string;
    info: {
      userId: string;
      nombreCompleto: string;
      email: string;
      image?: string;
      role?: string;
      isActive?: boolean;
    };
    exp?: number;
  }
}
