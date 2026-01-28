import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UndervisningOversikt } from "./undervisning-oversikt";
import { TildelFagForm } from "./tildel-fag-form";
import { LESEPLIKT } from "@/lib/utils";

export default async function UndervisningPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  // Hent klasser med trinn-info
  const { data: classes } = await supabase
    .from("classes")
    .select("*, grade_level:grade_levels(name, level_number, level_category)")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Hent fag
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Hent lærere med eksisterende undervisning og funksjoner
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

  // Hent alle teacher_subjects for oversikt
  const { data: teacherSubjects } = await supabase
    .from("teacher_subjects")
    .select(`
      *,
      teacher:teachers(id, name),
      subject:subjects(id, name),
      class:classes(id, name, grade_level:grade_levels(level_category))
    `)
    .eq("school_id", schoolId);

  // Beregn ledig kapasitet per lærer
  const teachersWithCapacity = teachers?.map(teacher => {
    const functionsPercent = teacher.teacher_functions?.reduce(
      (sum: number, f: any) => sum + (f.percent_of_position || 0), 0
    ) || 0;

    let teachingPercent = 0;
    teacher.teacher_subjects?.forEach((ts: any) => {
      const leseplikt = LESEPLIKT.ungdomstrinnet.ovrige_fag; // Standard
      teachingPercent += (ts.hours_per_week / leseplikt) * 100;
    });

    const usedPercent = functionsPercent + teachingPercent;
    const availablePercent = teacher.position_percent - usedPercent;
    const availableHours = (availablePercent / 100) * LESEPLIKT.ungdomstrinnet.ovrige_fag;

    return {
      ...teacher,
      functionsPercent,
      teachingPercent,
      usedPercent,
      availablePercent,
      availableHours,
    };
  }) || [];

  // Grupper klasser etter trinn
  const classesByLevel = classes?.reduce((acc: any, cls: any) => {
    const levelName = cls.grade_level?.name || 'Ukjent';
    if (!acc[levelName]) {
      acc[levelName] = [];
    }
    acc[levelName].push(cls);
    return acc;
  }, {}) || {};

  // Statistikk
  const totalAssignments = teacherSubjects?.length || 0;
  const totalHoursAssigned = teacherSubjects?.reduce((sum: number, ts: any) => sum + (ts.hours_per_week || 0), 0) || 0;
  const classesWithoutTeacher = classes?.filter((cls: any) => {
    const assignmentsForClass = teacherSubjects?.filter((ts: any) => ts.class_id === cls.id);
    return !assignmentsForClass || assignmentsForClass.length === 0;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Undervisningsfordeling</h1>
        <p className="text-muted-foreground">
          Tildel fag og undervisningstimer til lærere per klasse
        </p>
      </div>

      {/* Statistikk */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tildelinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Fag-lærer-klasse kombinasjoner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timer tildelt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursAssigned.toFixed(1)} t/u</div>
            <p className="text-xs text-muted-foreground">Totalt per uke</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Klasser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {classesWithoutTeacher > 0 && (
                <span className="text-yellow-600">{classesWithoutTeacher} uten tildelinger</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lærere med kapasitet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachersWithCapacity.filter(t => t.availablePercent > 5).length}
            </div>
            <p className="text-xs text-muted-foreground">
              av {teachersWithCapacity.length} lærere
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tildel fag */}
      <TildelFagForm
        schoolId={schoolId || ""}
        classes={classes || []}
        subjects={subjects || []}
        teachers={teachersWithCapacity}
      />

      {/* Oversikt per klasse */}
      <UndervisningOversikt
        classesByLevel={classesByLevel}
        subjects={subjects || []}
        teacherSubjects={teacherSubjects || []}
        teachers={teachers || []}
        schoolId={schoolId || ""}
      />

      {/* Lærere med ledig kapasitet */}
      <Card>
        <CardHeader>
          <CardTitle>Lærere med ledig kapasitet</CardTitle>
        </CardHeader>
        <CardContent>
          {teachersWithCapacity.filter(t => t.availablePercent > 0).length === 0 ? (
            <p className="text-sm text-muted-foreground">Alle lærere er fullt booket.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {teachersWithCapacity
                .filter(t => t.availablePercent > 0)
                .sort((a, b) => b.availablePercent - a.availablePercent)
                .map(teacher => (
                  <div key={teacher.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.position_percent}% stilling
                        </p>
                      </div>
                      <Badge variant={teacher.availablePercent > 20 ? "default" : "secondary"}>
                        {teacher.availablePercent.toFixed(1)}% ledig
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">
                      ≈ {teacher.availableHours.toFixed(1)} t/u tilgjengelig
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Om undervisningsfordeling</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Tildeling:</strong> Velg klasse, fag og lærer, angi timer per uke.</p>
          <p><strong>Leseplikt:</strong> Systemet bruker riktig leseplikt basert på faget (Norsk: 22,3 t/u, Øvrige: 24,95 t/u).</p>
          <p><strong>Kapasitet:</strong> Lærere med mer enn 100% tildelt vises med rød advarsel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
