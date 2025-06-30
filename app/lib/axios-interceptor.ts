import { api } from "./api";
let isInterceptorSetup = false;

export const setupAxiosInterceptor = () => {
  if (typeof window === "undefined" || isInterceptorSetup) return;

  api.interceptors.request.use(async (config) => {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      console.log("Session data:", session);
      
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (error) {
      console.error("Interceptor error (client-side only):", error);
    }
    return config;
  });

  isInterceptorSetup = true;
};