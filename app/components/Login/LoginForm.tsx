"use client";

import { useState, useEffect } from "react";

import { useRouter } from 'next/navigation';
import Image from "next/image";
import { toast } from "@pheralb/toast";
import {
  useGoogleReCaptcha
} from 'react-google-recaptcha-v3';
import { signIn, useSession } from "next-auth/react";
import ForgotPasswordModal from "../Popups/ForgotPasswordModal";
import { Eye, EyeClosed } from "lucide-react";
import { RequestPassResponse } from "@/app/types/types";
import { requestPasswordReset } from "@/app/services/user.service";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { status } = useSession();


  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard');
    }
  }, [status, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      console.log(result)

      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
      }

      if (result?.error) {
        throw new Error(result.error);
      }


      router.refresh();
      router.push("/dashboard");

    } catch (err) {
      if (err instanceof Error && err.message === "CredentialsSignin") {
        toast.error({ text: 'Credenciales invalidas', description: 'Revisa tu correo o contraseña' });
      } else if (err instanceof Error) {
        toast.error({ text: 'Error de inicio de sesión', description: err.message });
      }
    }
    finally {
      setLoading(false);
    }

  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetLoading(true);


    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
      }

      const token = await executeRecaptcha("forgot_password");

      const response: RequestPassResponse = await requestPasswordReset(resetEmail, token);

      if (response && response.statusCode === 404) {
        toast.error({ text: 'Ha ocurrido un error', description: response.message });
      } else {
        toast.success({ text: 'Enlace de recuperación enviado. Revisa tu correo electrónico.' });
        setShowForgotPasswordPopup(false);
      }
    } catch {
      toast.error({ text: 'Error al enviar el enlace de recuperación', description: 'Por favor, intenta nuevamente.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-6 md:p-8">
      <Image src="/logo.png" alt="Logo" className="w-36" width={144} height={144} />
      <h2 className="text-2xl font-bold mb-6 text-[#003C71]">Iniciar Sesión</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="absolute -top-[1000px] left-0 opacity-0" aria-hidden="true">
          <label htmlFor="website"></label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            onChange={(e) => {
              if (e.target.value) {
                setError('Solicitud bloqueada por seguridad');
                setResetLoading(false);
              }
            }}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
              focus:outline-none focus:border-[#003C71] focus:ring-1 focus:ring-[#003C71]"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-[#003C71] focus:ring-1 focus:ring-[#003C71] pr-10"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 text-[#003C71] flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[#003C71] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#003C71] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowForgotPasswordPopup(true)}
            className="text-[#003C71] hover:text-blue-700 text-sm cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          <span>Este sitio está protegido por reCAPTCHA y se aplican la </span>
          <a href="https://policies.google.com/privacy" className="text-[#003C71]" target="_blank">Política de privacidad</a> y los
          <a href="https://policies.google.com/terms" className="text-[#003C71]" target="_blank"> Términos de servicio</a> de Google.
        </p>
      </form>

      {showForgotPasswordPopup && (
        <ForgotPasswordModal handleForgotPassword={handleForgotPassword} resetEmail={resetEmail} resetLoading={resetLoading} setResetEmail={setResetEmail} setShowForgotPasswordPopup={setShowForgotPasswordPopup} hasLogin={false} />
      )}
    </div>
  );
};

export default LoginForm;