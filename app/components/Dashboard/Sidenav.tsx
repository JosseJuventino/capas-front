"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboardIcon,
  UserIcon,
  LayersIcon,
  MoreHorizontalIcon,
  BookOpen,
  MenuIcon,
  XIcon,
  LogOut,
  UserCircle,
  Users2Icon
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getMySections } from "@/app/services/course.service";
import { NavItem, ProtectedNavItem } from "./NavItem";
import { ROLES } from "@/app/constants/roles";
import { Course } from "@/app/types/types";

const Sidenav: React.FC = () => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.info;

  const {
    data: mis_cursos,
  } = useQuery<Course[], Error>({
    queryKey: ["cursos"],
    queryFn: getMySections,
  });

  useEffect(() => {
    setIsMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const userCourses = mis_cursos?.map(course => ({
    name: course.nombre,
    path: `/dashboard/my-courses/${course.slug}`,
  })) || [];

  const users = [
    { name: "Alumnos", path: '/dashboard/students', icon: UserIcon },
    { name: "Tutores", path: '/dashboard/tutors', icon: Users2Icon },
  ];

  // Handlers
  const toggleMobileMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLogout = () => signOut({ callbackUrl: 'https://refuerzo-mendoza.me/' });


  if (!isMounted) {
    return (
      <div className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl text-black">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <nav className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-nav-${i}`} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }



  const UserMenu = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <MoreHorizontalIcon className="w-5 h-5" />
      </button>

      {showUserMenu && (
        <div className={`absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-xl border z-50 ${mobile ? 'origin-bottom-right' : 'origin-bottom'
          }`}>
          <Link
            href="/dashboard/profile"
            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700"
            onClick={() => setShowUserMenu(false)}
          >
            <UserCircle className="w-5 h-5 mr-2 text-gray-500" />
            Mi perfil
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-red-500"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed z-[200] w-full flex items-center justify-between px-4 py-2 bg-white h-20 shadow-sm">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-800 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={48}
          height={48}
          className="w-12 h-14"
          priority
        />
      </header>

      <aside className="hidden md:flex flex-col justify-between h-screen w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={142}
              height={142}
              className="w-36 h-32 object-contain"
              priority
            />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain py-2">
            <nav className="space-y-2 overflow-y-auto mr-3">
              <NavItem
                link="/dashboard"
                icon={LayoutDashboardIcon}
                label="Inicio"
                isActive={pathName === "/dashboard"}
              />

              <ProtectedNavItem
                icon={UserIcon}
                label="Usuarios"
                isActive={pathName.startsWith("/dashboard/students") || pathName.startsWith("/dashboard/recomendators")}
                subItems={users}
                currentPath={pathName}
                allowedRoles={[ROLES.ADMIN]}
              />

              <ProtectedNavItem
                icon={BookOpen}
                label="Mis cursos"
                isActive={pathName.startsWith("/dashboard/my-courses")}
                subItems={userCourses}
                currentPath={pathName}
                allowedRoles={[ROLES.ALUMNO, ROLES.TUTOR, ROLES.PROFESOR]}
              />
              <ProtectedNavItem
                link="/dashboard/courses"
                icon={LayersIcon}
                label="Cursos"
                isActive={pathName === "/dashboard/courses"}
                allowedRoles={[ROLES.ADMIN]}
              />
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300" suppressHydrationWarning>
          <div className="flex items-center gap-2 flex-1">
            {user?.image ? (
              <img
                src={user.image || '/default-avatar.png'}
                alt="User avatar"
                className="w-8 object-cover h-8 rounded-full"
                width={32}
                height={32}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.nombreCompleto || "Invitado"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || "No disponible"}
              </p>
            </div>
          </div>
          <UserMenu />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[500] flex">
          <div className="flex flex-col justify-between h-full w-64 p-3 bg-white shadow-xl rounded-tr-2xl rounded-br-2xl">
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={112}
                  height={112}
                  className="w-28 h-28"
                  priority
                />
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain py-2">
                <nav className="space-y-2 overflow-y-auto">
                  <NavItem
                    link="/dashboard"
                    icon={LayoutDashboardIcon}
                    label="Inicio"
                    isActive={pathName === "/dashboard"}
                  />
                  <ProtectedNavItem
                    icon={UserIcon}
                    label="Usuarios"
                    isActive={pathName.startsWith("/dashboard/students") || pathName.startsWith("/dashboard/recomendators")}
                    subItems={users}
                    currentPath={pathName}
                    allowedRoles={[ROLES.ADMIN]}
                  />
                  <NavItem
                    icon={BookOpen}
                    label="Mis cursos"
                    isActive={pathName.startsWith("/dashboard/my-courses")}
                    subItems={userCourses}
                    currentPath={pathName}
                  />

                  <ProtectedNavItem
                    link="/dashboard/courses"
                    icon={LayersIcon}
                    label="Cursos"
                    isActive={pathName === "/dashboard/courses"}
                    allowedRoles={[ROLES.ADMIN]}
                  />
                </nav>
              </div>
            </div>

            {/* Mobile User Section */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-400">
              <div className="flex items-center gap-2 flex-1">
                {user?.image ? (
                  <img
                    src={user.image || '/default-avatar.png'}
                    alt="User avatar"
                    className="w-8 object-cover h-8 rounded-full"
                    width={32}
                    height={32}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  
                  <p className="text-sm font-medium truncate">
                    {user?.nombreCompleto || "Invitado"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "No disponible"}
                  </p>
                </div>
              </div>
              <UserMenu mobile />
            </div>
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
        </div>
      )}
    </>
  );
};

export default Sidenav;