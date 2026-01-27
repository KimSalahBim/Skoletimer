import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatMinutes, calculateInspectionMinutes } from "@/lib/utils";
import { FUNCTION_TYPES } from "@/types/database";

export default async function StillingsberegningPage() {
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

  const inspectionPer100 = settings?.inspection_minutes_per_100_percent || 90;
  const schoolWeeks = settings?.school_weeks_per_year || 38;

  // Hent alle lærere med funksjoner og undervisning
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      *,
      default_sfs_framework:sfs_annual_frameworks(*),
      teacher_functions(*),
      teacher_subjects(
        hours_per_week,
        subject:subjects(name, sfs_framework:sfs_annual_frameworks(*)),
        class:classes(name)
      )
    `)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Beregn stillingsdata for hver lærer
  const teachersWithCalculations = teachers?.map(teacher => {
    const functionsPercent = teacher.teacher_functions?.reduce(
      (sum: number, f: any) => sum + (f.percent_of_position || 0), 0
    ) || 0;

    // Beregn undervisningsprosent med riktig vekting per fag
    let teachingPercent = 0;
    let totalTeachingHours = 0;
    
    teacher.teacher_subjects?.forEach((ts: any) => {
      totalTeachingHours += ts.hours_per_week || 0;
      
      // Bruk fagets årsramme, eller lærerens default, eller 700
      const frameworkHours = 
        ts.subject?.sfs_framework?.hours_45min ||
        teacher.default_sfs_framework?.hours_45min ||
        700;
      
      const weightPerLesson = 100 / frameworkHours;
      const annualHours = (ts.hours_per_week || 0) * schoolWeeks;
      teachingPercent += annualHours * weightPerLesson;
    });

    const totalUsed = functionsPercent + teachingPercent;
    const gapPercent = teacher.position_percent - totalUsed;
    
    // Beregn GAP-timer basert på default årsramme
    const defaultFrameworkHours = teacher.default_sfs_framework?.hours_45min || 700;
    const gapHours = gapPercent / (100 / defaultFrameworkHours);

    // Inspeksjonsminutter
    const inspectionMinutes = calculateInspectionMinutes(teacher.position_percent, inspectionPer100);

    return {
      ...teacher,
      functionsPercent,
      totalTeachingHours,
      teachingPercent,
      totalUsed,
      gapPercent,
      gapHours,
      inspectionMinutes,
    };
  }) || [];

  // Totaler
  const totals = teachersWithCalculations.reduce((acc, t) => ({
    positionPercent: acc.positionPercent + t.position_percent,
    functionsPercent: acc.functionsPercent + t.functionsPercent,
    teachingPercent: acc.teachingPercent + t.teachingPercent,
    gapPercent: acc.gapPercent + t.gapPercent,
    teachingHours: acc.teachingHours + t.totalTeachingHours,
    inspectionMinutes: acc.inspectionMinutes + t.inspectionMinutes,
  }), {
    positionPercent: 0,
    functionsPercent: 0,
    teachingPercent: 0,
    gapPercent: 0,
    teachingHours: 0,
    inspectionMinutes: 0,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stillingsberegning</h1>
        <p className="text-muted-foreground">
          Oversikt over stillingsfordeling, GAP-timer og inspeksjon
        </p>
      </div>

      {/* Totaloversikt */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total stilling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(totals.positionPercent)}</div>
            <p className="text-xs text-muted-foreground">{teachersWithCalculations.length} lærere</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funksjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(totals.functionsPercent)}</div>
            <p className="text-xs text-muted-foreground">Kontaktlærer, rådgiver, fagleder osv.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Undervisning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.teachingHours.toFixed(1)} t/u</div>
            <p className="text-xs text-muted-foreground">{formatPercent(totals.teachingPercent)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total GAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.gapPercent > 0 ? 'text-yellow-600' : totals.gapPercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPercent(totals.gapPercent)}
            </div>
            <p className="text-xs text-muted-foreground">Ledig kapasitet</p>
          </CardContent>
        </Card>
      </div>

      {/* Detaljert tabell */}
      <Card>
        <CardHeader>
          <CardTitle>Detaljert oversikt per lærer</CardTitle>
        </CardHeader>
        <CardContent>
          {teachersWithCalculations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Ingen lærere registrert. Gå til "Lærere" for å legge til.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Lærer</th>
                    <th className="text-right py-3 font-medium">Stilling</th>
                    <th className="text-right py-3 font-medium">Funksjoner</th>
                    <th className="text-right py-3 font-medium">Undervisning</th>
                    <th className="text-right py-3 font-medium">GAP %</th>
                    <th className="text-right py-3 font-medium">GAP timer</th>
                    <th className="text-right py-3 font-medium">Inspeksjon</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersWithCalculations.map((teacher) => (
                    <tr key={teacher.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.teacher_functions?.map((f: any) => (
                              <Badge key={f.id} variant="outline" className="text-xs">
                                {FUNCTION_TYPES[f.function_type as keyof typeof FUNCTION_TYPES]} ({f.percent_of_position}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatPercent(teacher.position_percent)}
                      </td>
                      <td className="py-3 text-right">
                        {formatPercent(teacher.functionsPercent)}
                      </td>
                      <td className="py-3 text-right">
                        <div>
                          <p>{teacher.totalTeachingHours.toFixed(1)} t/u</p>
                          <p className="text-xs text-muted-foreground">{formatPercent(teacher.teachingPercent)}</p>
                        </div>
                      </td>
                      <td className={`py-3 text-right font-medium ${
                        teacher.gapPercent > 0 ? 'text-yellow-600' : 
                        teacher.gapPercent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatPercent(teacher.gapPercent)}
                      </td>
                      <td className={`py-3 text-right ${
                        teacher.gapPercent > 0 ? 'text-yellow-600' : 
                        teacher.gapPercent < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {teacher.gapHours.toFixed(1)} t/år
                      </td>
                      <td className="py-3 text-right">
                        {formatMinutes(teacher.inspectionMinutes)}/uke
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-medium">
                    <td className="py-3">Totalt ({teachersWithCalculations.length} lærere)</td>
                    <td className="py-3 text-right">{formatPercent(totals.positionPercent)}</td>
                    <td className="py-3 text-right">{formatPercent(totals.functionsPercent)}</td>
                    <td className="py-3 text-right">{totals.teachingHours.toFixed(1)} t/u</td>
                    <td className={`py-3 text-right ${totals.gapPercent > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercent(totals.gapPercent)}
                    </td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right">{formatMinutes(totals.inspectionMinutes)}/uke</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forklaringer */}
      <Card>
        <CardHeader>
          <CardTitle>Forklaringer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>GAP-timer:</strong> Differansen mellom lærerens stilling og summen av funksjoner + undervisning. Positiv verdi betyr at læreren har kapasitet igjen som kan fylles med mer undervisning eller andre oppgaver.</p>
          <p><strong>Inspeksjon:</strong> Basert på {inspectionPer100} minutter per uke ved 100% stilling, skalert etter stillingsprosent.</p>
          <p><strong>Vekting:</strong> Ulike fag har ulik årsramme, som påvirker hvor mye en undervisningstime "koster" i prosent av stillingen.</p>
          <p className="pt-2"><strong className="text-yellow-600">Gul</strong> = Positiv GAP (ledig kapasitet) | <strong className="text-red-600">Rød</strong> = Negativ GAP (overbelastet) | <strong className="text-green-600">Grønn</strong> = Null GAP (fullt utnyttet)</p>
        </CardContent>
      </Card>
    </div>
  );
}
