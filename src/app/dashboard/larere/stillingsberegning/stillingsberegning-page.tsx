import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatMinutes, calculateInspectionMinutes, LESEPLIKT, DEFAULT_LESEPLIKT_HOURS_PER_WEEK } from "@/lib/utils";
import { FUNCTION_TYPES } from "@/types/database";

// Finn riktig leseplikt basert på fagkategori
function getLesepliktForSubject(subjectName: string, levelCategory: string = 'ungdomstrinnet'): number {
  const name = subjectName.toLowerCase();
  
  if (levelCategory === 'barnetrinnet') {
    return LESEPLIKT.barnetrinnet.alle_fag;
  }
  
  // Ungdomstrinnet
  if (name.includes('norsk') || name.includes('samisk') || name.includes('tegnspråk')) {
    return LESEPLIKT.ungdomstrinnet.norsk;
  }
  if (name.includes('engelsk') || name.includes('mat og helse')) {
    return LESEPLIKT.ungdomstrinnet.engelsk_mathelse;
  }
  return LESEPLIKT.ungdomstrinnet.ovrige_fag;
}

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

  // Hent alle lærere med funksjoner og undervisning
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      *,
      teacher_functions(*),
      teacher_subjects(
        hours_per_week,
        subject:subjects(name),
        class:classes(name, grade_level:grade_levels(level_category))
      )
    `)
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  // Beregn stillingsdata for hver lærer med leseplikt
  const teachersWithCalculations = teachers?.map(teacher => {
    const functionsPercent = teacher.teacher_functions?.reduce(
      (sum: number, f: any) => sum + (f.percent_of_position || 0), 0
    ) || 0;

    // Beregn undervisningsprosent med leseplikt per fag
    let teachingPercent = 0;
    let totalTeachingHours = 0;
    const subjectDetails: any[] = [];
    
    teacher.teacher_subjects?.forEach((ts: any) => {
      const hoursPerWeek = ts.hours_per_week || 0;
      totalTeachingHours += hoursPerWeek;
      
      const subjectName = ts.subject?.name || 'Ukjent';
      const levelCategory = ts.class?.grade_level?.level_category || 'ungdomstrinnet';
      const leseplikt = getLesepliktForSubject(subjectName, levelCategory);
      
      // Beregn prosent: timer/uke ÷ leseplikt = prosent
      const subjectPercent = (hoursPerWeek / leseplikt) * 100;
      teachingPercent += subjectPercent;
      
      subjectDetails.push({
        subject: subjectName,
        class: ts.class?.name,
        hoursPerWeek,
        leseplikt,
        percent: subjectPercent,
      });
    });

    const totalUsed = functionsPercent + teachingPercent;
    const gapPercent = teacher.position_percent - totalUsed;
    
    // Beregn GAP-timer basert på standard leseplikt
    const gapHoursPerWeek = (gapPercent / 100) * DEFAULT_LESEPLIKT_HOURS_PER_WEEK;
    const gapHoursPerYear = gapHoursPerWeek * 38;

    // Inspeksjonsminutter
    const inspectionMinutes = calculateInspectionMinutes(teacher.position_percent, inspectionPer100);

    return {
      ...teacher,
      functionsPercent,
      totalTeachingHours,
      teachingPercent,
      totalUsed,
      gapPercent,
      gapHoursPerWeek,
      gapHoursPerYear,
      inspectionMinutes,
      subjectDetails,
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
          Oversikt over stillingsfordeling, GAP-timer og inspeksjon (beregnet med leseplikt)
        </p>
      </div>

      {/* Leseplikt-info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="font-medium text-blue-900">Leseplikt (undervisningsplikt) per uke:</p>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-blue-700">Norsk/Samisk</p>
                  <p className="font-medium">{LESEPLIKT.ungdomstrinnet.norsk} t/u</p>
                </div>
                <div>
                  <p className="text-blue-700">Engelsk/Mat og helse</p>
                  <p className="font-medium">{LESEPLIKT.ungdomstrinnet.engelsk_mathelse} t/u</p>
                </div>
                <div>
                  <p className="text-blue-700">Øvrige fag</p>
                  <p className="font-medium">{LESEPLIKT.ungdomstrinnet.ovrige_fag} t/u</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <th className="text-right py-3 font-medium">GAP t/u</th>
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
                          {teacher.subjectDetails?.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {teacher.subjectDetails.map((s: any, i: number) => (
                                <span key={i}>
                                  {s.subject} {s.class}: {s.hoursPerWeek}t ({s.percent.toFixed(1)}%)
                                  {i < teacher.subjectDetails.length - 1 ? ' • ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
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
                        {teacher.gapHoursPerWeek.toFixed(1)} t/u
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
          <p><strong>Leseplikt:</strong> Undervisningsplikt fra særavtalen. Norsk har lavere leseplikt (22,3 t/u) enn øvrige fag (24,95 t/u), så 1 time norsk "koster" mer enn 1 time kunst og håndverk.</p>
          <p><strong>Beregning:</strong> Stillingsprosent = (undervisningstimer per uke ÷ leseplikt) × 100</p>
          <p><strong>Eksempel:</strong> 5 timer norsk = 5 ÷ 22,3 × 100 = 22,4%. 5 timer kunst og håndverk = 5 ÷ 24,95 × 100 = 20,0%</p>
          <p><strong>GAP-timer:</strong> Restkapasitet i timer per uke, basert på standard leseplikt ({DEFAULT_LESEPLIKT_HOURS_PER_WEEK} t/u).</p>
          <p><strong>Inspeksjon:</strong> Basert på {inspectionPer100} minutter per uke ved 100% stilling.</p>
          <p className="pt-2"><strong className="text-yellow-600">Gul</strong> = Positiv GAP (ledig kapasitet) | <strong className="text-red-600">Rød</strong> = Negativ GAP (overbelastet) | <strong className="text-green-600">Grønn</strong> = Null GAP</p>
        </CardContent>
      </Card>
    </div>
  );
}
