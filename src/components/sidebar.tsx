"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calculator,
  CalendarDays,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User, School } from "@/types/database";

const navItems = [
  { href: "/dashboard", label: "Oversikt", icon: LayoutDashboard },
  { href: "/dashboard/larere", label: "Lærere", icon: Users },
  { href: "/dashboard/trinn-klasser", label: "Trinn & Klasser", icon: GraduationCap },
  { href: "/dashboard/fag", label: "Fag", icon: BookOpen },
  { href: "/dashboard/stillingsberegning", label: "Stillingsberegning", icon: Calculator },
  { href: "/dashboard/skolerute", label: "Skolerute", icon: CalendarDays },
  { href: "/dashboard/innstillinger", label: "Innstillinger", icon: Settings },
];

interface SidebarProps {
  authUser: SupabaseUser;
  user: User | null;
  school: School | null;
}

export function Sidebar({ authUser, user, school }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Skoletimer</h1>
        <p className="text-xs text-muted-foreground mt-1">v3.0 – Fase 1</p>
        {school && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{school.name}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.full_name?.charAt(0) || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || "Bruker"}</p>
            <p className="text-xs text-muted-foreground truncate">{authUser.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Logg ut
        </Button>
      </div>
    </aside>
  );
}
