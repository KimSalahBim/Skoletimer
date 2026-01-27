import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!user?.school_id) {
    redirect("/setup-school");
  }

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.school_id)
    .single();

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar authUser={authUser} user={user} school={school} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
