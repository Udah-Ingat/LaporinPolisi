/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, PenSquare, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthPage = pathname === "/login";

  const navItems = [
    {
      icon: Home,
      label: "Beranda",
      href: "/",
    },
    {
      icon: PenSquare,
      label: "Lapor",
      href: "/create",
    },
    {
      icon: User,
      label: "Profil",
      href: session ? `/profile/${session.user.id}` : "/login",
    },
  ];

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-16">{children}</main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}