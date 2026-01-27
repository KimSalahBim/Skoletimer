import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeLevelManager } from "./grade-level-manager";
import { ClassManager } from "./class-manager";

export default async function TrinnKlasserPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  const { data: school } = await supabase
    .from("schools")
    .select("school_type")
    .eq("id", schoolId)
    .single();

  const { data: gradeLevels } = await supabase
    .from("grade_levels")
    .select("*")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("level_number");

  const { data: classes } = await supabase
    .from("classes")
    .select("*, grade_level:grade_levels(name)")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, name")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trinn & Klasser</h1>
        <p className="text-muted-foreground">
          Definer trinn og opprett klasser for skolen
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GradeLevelManager 
          schoolId={schoolId || ""} 
          schoolType={school?.school_type || "grunnskole"}
          gradeLevels={gradeLevels || []} 
        />
        
        <ClassManager 
          schoolId={schoolId || ""} 
          gradeLevels={gradeLevels || []}
          classes={classes || []}
          teachers={teachers || []}
        />
      </div>
    </div>
  );
}
