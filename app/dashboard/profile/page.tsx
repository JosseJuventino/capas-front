"use client";

import {
  UserCircle,
  Edit,
  LogOut,
  Mail,
  User,
  Lock,
  Key,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@pheralb/toast";
import PageHeader from "@/app/components/Dashboard/PageHeader";

const InfoItem = ({
  icon: Icon,
  label,
  value,
  editable = false,
  onEdit
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
}) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Icon className="w-5 h-5 text-blue_principal" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">
        {value || <span className="text-gray-400 italic">No disponible</span>}
      </p>
    </div>
    {editable && (
      <button
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue_principal"
      >
        <Edit className="w-4 h-4" />
      </button>
    )}
  </div>
);


export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.info;

  const handleLogout = () => {
    toast.loading({
      text: "Cerrando sesión...",
      options: {
        promise: new Promise(() => {
          setTimeout(() => {
            signOut({ callbackUrl: '/' })
          }, 1500);
        }),
        success: "Sesión cerrada con éxito!",
        error: "Error al cerrar sesión",
        autoDismiss: true
      }
    });
  };

  return (
      <div className="p-10">
        <PageHeader
          title="Mi Perfil"
          buttons={[
            {
              label: "Cerrar Sesión",
              icon: <LogOut size={18} />,
              onClick: handleLogout,
              className: "bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-200 transition-all",
            },
          ]}
        />

        <div className="mt-8 space-y-8">
          <div className="rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="User avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <UserCircle className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-blue_principal mb-2 flex items-center gap-2">
                  {user?.nombreCompleto || "Invitado"}
                </h1>
                <p className="text-lg text-gray-600 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-5 h-5 text-blue_principal" />
                  {user?.email || "No disponible"}
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={User}
                label="Nombre completo"
                value={user?.nombreCompleto}
              />
              <InfoItem
                icon={Mail}
                label="Correo electrónico"
                value={user?.email}
              />
            </div>
          </div>

          <div className="p-2">
            <h2 className="text-2xl font-bold text-blue_principal mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 " />
              Seguridad y Privacidad
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-blue_principal" />
                  <div>
                    <p className="font-medium">Cambiar Contraseña</p>
                    <p className="text-sm text-gray-500">Actualiza tu contraseña regularmente para mayor seguridad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}