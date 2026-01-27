import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RessursberegningForm } from "./ressursberegning-form";
import { RessursOversikt } from "./ressurs-oversikt";

export default async function RessursberegningPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  // Hent skoleinnstillinger
  const { data: settings } = await supabase
    .from("school_settings")
    .select("*")
    .eq("school_id", schoolId)
    .single();

  // Hent klasser med elevtall
  const { data: classes } = await supabase
    .from("classes")
    .select("*, grade_level:grade_levels(name, level_number, level_category)")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Hent lærere med rådgiver-funksjoner
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      id, name, position_percent,
      teacher_functions(*)
    `)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Beregn elevtall per trinn-kategori
  const ungdomstrinnClasses = classes?.filter(
    (c: any) => c.grade_level?.level_category === 'ungdomstrinnet'
  ) || [];
  
  const barnetrinnClasses = classes?.filter(
    (c: any) => c.grade_level?.level_category === 'barnetrinnet'
  ) || [];

  const ungdomstrinnElever = ungdomstrinnClasses.reduce(
    (sum: number, c: any) => sum + (c.student_count || 0), 0
  );
  
  const barnetrinnElever = barnetrinnClasses.reduce(
    (sum: number, c: any) => sum + (c.student_count || 0), 0
  );

  const totalElever = ungdomstrinnElever + barnetrinnElever;

  // Finn eksisterende rådgivere
  const radgivere = teachers?.filter((t: any) => 
    t.teacher_functions?.some((f: any) => f.function_type === 'advisor')
  ) || [];

  const totalRadgiverProsent = radgivere.reduce((sum: number, t: any) => {
    const advisorFunctions = t.teacher_functions?.filter((f: any) => f.function_type === 'advisor') || [];
    return sum + advisorFunctions.reduce((s: number, f: any) => s + (f.percent_of_position || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ressursberegning</h1>
        <p className="text-muted-foreground">
          Beregn ressurser etter SFS 2213 basert på elevtall
        </p>
      </div>

      <RessursberegningForm 
        schoolId={schoolId || ""}
        classes={classes || []}
        ungdomstrinnElever={ungdomstrinnElever}
        barnetrinnElever={barnetrinnElever}
      />

      <RessursOversikt
        ungdomstrinnElever={ungdomstrinnElever}
        barnetrinnElever={barnetrinnElever}
        radgivere={radgivere}
        totalRadgiverProsent={totalRadgiverProsent}
        settings={settings}
      />

      {/* Forklaring */}
      <Card>
        <CardHeader>
          <CardTitle>Om ressursberegning (SFS 2213)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <p className="font-medium text-foreground">7.2.a) Tidsressurs ungdomstrinnet:</p>
            <p>57/76 årsrammetimer per opprettet gruppe (maks 30 elever). Brukes til sosialpedagogisk tjeneste, kontaktlærer elevråd, m.m.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">7.2.c) Kontaktlærertjeneste:</p>
            <p>Minimum 28,5/38 årsrammetimer reduksjon per kontaktlærer.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">7.2.d) Sosiallærer/rådgiver:</p>
            <p>Minimum 28,5/38 årsrammetimer per påbegynt 25 elever + 5% årsverk.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">7.2.b) Tidsressurspott:</p>
            <p>2/2⅔ årsrammetimer per elev til byrdefull undervisningssituasjon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
