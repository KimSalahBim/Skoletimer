import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Calculator, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatPercent, formatHours } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  // Hent statistikk
  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const { count: classCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  const { count: subjectCount } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("is_active", true);

  // Hent lærere med funksjoner og undervisning
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      id, name, position_percent,
      teacher_functions(percent_of_position),
      teacher_subjects(hours_per_week)
    `)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name")
    .limit(5);

  // Beregn GAP-timer (forenklet)
  const teachersWithGap = teachers?.map(t => {
    const functionsPercent = t.teacher_functions?.reduce((sum: number, f: any) => sum + (f.percent_of_position || 0), 0) || 0;
    const teachingHours = t.teacher_subjects?.reduce((sum: number, s: any) => sum + (s.hours_per_week || 0), 0) || 0;
    // Forenklet beregning: antar standard vekting 0.143% per time (1/700)
    const teachingPercent = teachingHours * 38 * (100 / 700);
    const totalUsed = functionsPercent + teachingPercent;
    const gapPercent = t.position_percent - totalUsed;
    
    return {
      ...t,
      functionsPercent,
      teachingHours,
      teachingPercent,
      totalUsed,
      gapPercent
    };
  });

  const totalGapPercent = teachersWithGap?.reduce((sum, t) => sum + Math.max(0, t.gapPercent), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Oversikt</h1>
        <p className="text-muted-foreground">
          Skoletimer v3.0 – Stillingsberegning og GAP-timer
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lærere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount || 0}</div>
            <Link href="/dashboard/larere" className="text-xs text-primary hover:underline">
              Administrer lærere →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klasser</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount || 0}</div>
            <Link href="/dashboard/trinn-klasser" className="text-xs text-primary hover:underline">
              Administrer klasser →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fag</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount || 0}</div>
            <Link href="/dashboard/fag" className="text-xs text-primary hover:underline">
              Administrer fag →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total GAP</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(totalGapPercent)}</div>
            <Link href="/dashboard/stillingsberegning" className="text-xs text-primary hover:underline">
              Se stillingsberegning →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Sjekkliste for oppsett */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Kom i gang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${(teacherCount || 0) > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {(teacherCount || 0) > 0 ? '✓' : '1'}
              </div>
              <div>
                <p className="font-medium">Legg til lærere</p>
                <p className="text-sm text-muted-foreground">Registrer lærere med stillingsprosent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${(classCount || 0) > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {(classCount || 0) > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className="font-medium">Opprett trinn og klasser</p>
                <p className="text-sm text-muted-foreground">Definer trinn (8-10, VG1-3) og klasser (8A, 8B, etc.)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${(subjectCount || 0) > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {(subjectCount || 0) > 0 ? '✓' : '3'}
              </div>
              <div>
                <p className="font-medium">Legg til fag</p>
                <p className="text-sm text-muted-foreground">Registrer fag med årsrammer fra SFS 2213</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">4</div>
              <div>
                <p className="font-medium">Tildel undervisning</p>
                <p className="text-sm text-muted-foreground">Koble lærere til fag og klasser med uketimer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">5</div>
              <div>
                <p className="font-medium">Se stillingsberegning</p>
                <p className="text-sm text-muted-foreground">Kontroller GAP-timer og inspeksjonsminutter</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Læreroversikt */}
      {teachersWithGap && teachersWithGap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lærere – Stillingsfordeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Navn</th>
                    <th className="text-right py-2">Stilling</th>
                    <th className="text-right py-2">Funksjoner</th>
                    <th className="text-right py-2">Undervisning</th>
                    <th className="text-right py-2">GAP</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersWithGap.map((teacher) => (
                    <tr key={teacher.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{teacher.name}</td>
                      <td className="py-3 text-right">{formatPercent(teacher.position_percent)}</td>
                      <td className="py-3 text-right">{formatPercent(teacher.functionsPercent)}</td>
                      <td className="py-3 text-right">
                        {teacher.teachingHours > 0 ? `${teacher.teachingHours} t/u` : '-'}
                      </td>
                      <td className={`py-3 text-right font-medium ${teacher.gapPercent > 0 ? 'text-yellow-600' : teacher.gapPercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercent(teacher.gapPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/dashboard/stillingsberegning" className="block text-center text-sm text-primary hover:underline mt-4">
              Se fullstendig stillingsberegning →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
