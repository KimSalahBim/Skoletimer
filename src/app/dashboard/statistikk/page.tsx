import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";

export default async function StatistikkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  const { data: timeEntrySubjects } = await supabase
    .from("time_entry_subjects")
    .select(`
      minutes,
      subject_id,
      time_entry:time_entries!inner (
        user_id
      )
    `)
    .eq("time_entry.user_id", user!.id);

  const hoursPerSubject: Record<string, number> = {};
  timeEntrySubjects?.forEach((tes) => {
    if (!hoursPerSubject[tes.subject_id]) {
      hoursPerSubject[tes.subject_id] = 0;
    }
    hoursPerSubject[tes.subject_id] += tes.minutes;
  });

  const totalLogged = Object.values(hoursPerSubject).reduce((a, b) => a + b, 0);
  const totalAnnual = subjects?.reduce((sum, s) => sum + s.annual_hours * 60, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistikk</h1>
        <p className="text-muted-foreground">
          Se hvor mange timer du har brukt på hvert fag.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totalt loggført</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatMinutes(totalLogged)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total årsramme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatMinutes(totalAnnual)}</p>
          </CardContent>
        </Card>
      </div>

      {subjects && subjects.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Timer per fag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => {
                const logged = hoursPerSubject[subject.id] || 0;
                const target = subject.annual_hours * 60;
                const percentage = target > 0 ? Math.min((logged / target) * 100, 100) : 0;

                return (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatMinutes(logged)} / {subject.annual_hours}t
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            Legg til fag og registrer timer for å se statistikk.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
