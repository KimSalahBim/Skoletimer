import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTeacherForm } from "./add-teacher-form";
import { TeacherList } from "./teacher-list";
import { FUNCTION_TYPES } from "@/types/database";
import { formatPercent } from "@/lib/utils";

// Konstanter fra SFS 2213
const ARSRAMME_45MIN = 741;
const RADGIVER_TIMER_PER_25_ELEVER_45MIN = 38;
const RADGIVER_PROSENT_ARSVERK = 5;

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

  // Hent klasser for kontaktlærer-dropdown med grade_level
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, student_count, grade_level:grade_levels(level_category)")
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

  // Beregn foreslått rådgiver-prosent basert på elevtall ungdomstrinnet
  const ungdomstrinnClasses = classes?.filter(
    (c: any) => c.grade_level?.level_category === 'ungdomstrinnet'
  ) || [];
  const ungdomstrinnElever = ungdomstrinnClasses.reduce(
    (sum: number, c: any) => sum + (c.student_count || 0), 0
  );
  
  // SFS 2213 formel: (påbegynt 25 elever × 38 timer / 741) + 5%
  const pabegynt25 = Math.ceil(ungdomstrinnElever / 25) || 0;
  const radgiverProsentFraElever = (pabegynt25 * RADGIVER_TIMER_PER_25_ELEVER_45MIN / ARSRAMME_45MIN) * 100;
  const suggestedAdvisorPercent = radgiverProsentFraElever + RADGIVER_PROSENT_ARSVERK;

  // Beregn allerede tildelt rådgiver-prosent
  const existingAdvisorPercent = teachers?.reduce((sum: number, t: any) => {
    const advisorFunctions = t.teacher_functions?.filter((f: any) => f.function_type === 'advisor') || [];
    return sum + advisorFunctions.reduce((s: number, f: any) => s + (f.percent_of_position || 0), 0);
  }, 0) || 0;

  // Gjenstående rådgiver-ressurs
  const remainingAdvisorPercent = Math.max(0, suggestedAdvisorPercent - existingAdvisorPercent);

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

      {/* Rådgiver-status */}
      {ungdomstrinnElever > 0 && (
        <Card className={remainingAdvisorPercent > 0 ? "border-yellow-300 bg-yellow-50" : "border-green-300 bg-green-50"}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Rådgiverressurs (SFS 2213, {ungdomstrinnElever} elever ungdomstrinnet)
                </p>
                <p className="text-sm text-muted-foreground">
                  Krav: {suggestedAdvisorPercent.toFixed(1)}% | Tildelt: {existingAdvisorPercent.toFixed(1)}%
                </p>
              </div>
              <Badge variant={remainingAdvisorPercent > 0 ? "secondary" : "default"}>
                {remainingAdvisorPercent > 0 
                  ? `Gjenstår: ${remainingAdvisorPercent.toFixed(1)}%`
                  : "✓ Dekket"
                }
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <TeacherList 
        teachers={teachers || []} 
        classes={classes?.map((c: any) => ({ id: c.id, name: c.name })) || []}
        subjects={subjects || []}
        sfsFrameworks={sfsFrameworks || []}
        suggestedAdvisorPercent={remainingAdvisorPercent}
      />

      {/* Info om funksjoner */}
      <Card>
        <CardHeader>
          <CardTitle>Om funksjoner og stillingsberegning</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Kontaktlærer:</strong> Minimum 4,29% (1 t/u ÷ 23,3 t/u leseplikt) per SFS 2213.</p>
          <p><strong>Rådgiver:</strong> Beregnes automatisk: (elever/25) × 38 timer + 5% årsverk.</p>
          <p><strong>Leseplikt:</strong> Undervisningsplikt varierer per fag. Norsk: 22,3 t/u, Øvrige fag: 24,95 t/u.</p>
          <p><strong>GAP-timer:</strong> Differansen mellom stilling og (funksjoner + undervisning).</p>
        </CardContent>
      </Card>
    </div>
  );
}
