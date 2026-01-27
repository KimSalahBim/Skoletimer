import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Sjekk om bruker har school_id
    const { data: userData } = await supabase
      .from("users")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!userData?.school_id) {
      redirect("/setup-school");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }
}
