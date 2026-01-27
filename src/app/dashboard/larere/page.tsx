import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTeacherForm } from "./add-teacher-form";
import { TeacherList } from "./teacher-list";
import { FUNCTION_TYPES } from "@/types/database";
import { formatPercent } from "@/lib/utils";

export default async function LærerePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  // Hent lærere med funksjoner og undervisning
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      *,
      teacher_functions(*),
      teacher_subjects(*, subject:subjects(name), class:classes(name))
    `)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Hent SFS-rammer for dropdown
  const { data: sfsFrameworks } = await supabase
    .from("sfs_annual_frameworks")
    .select("*")
    .order("school_type")
    .order("hours_45min", { ascending: false });

  // Hent klasser for kontaktlærer-dropdown
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Hent fag for fagleder-dropdown
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Lærere</h1>
          <p className="text-muted-foreground">
            Administrer lærere, funksjoner og stillingsfordeling
          </p>
        </div>
        <AddTeacherForm 
          schoolId={schoolId || ""} 
          sfsFrameworks={sfsFrameworks || []}
        />
      </div>

      <TeacherList 
        teachers={teachers || []} 
        classes={classes || []}
        subjects={subjects || []}
        sfsFrameworks={sfsFrameworks || []}
      />

      {/* Info om funksjoner */}
      <Card>
        <CardHeader>
          <CardTitle>Om funksjoner og stillingsberegning</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Funksjoner:</strong> Kontaktlærer, rådgiver, fagleder osv. trekkes fra stillingen før undervisning beregnes.</p>
          <p><strong>Årsramme:</strong> Fra SFS 2213. Bestemmer hvor mye en undervisningstime "koster" i prosent.</p>
          <p><strong>Eksempel:</strong> Årsramme 700 timer → hver 45-min time = 0,143% stilling</p>
          <p><strong>GAP-timer:</strong> Differansen mellom stilling og (funksjoner + undervisning). Positiv GAP = læreren har kapasitet igjen.</p>
        </CardContent>
      </Card>
    </div>
  );
}
