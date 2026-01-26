import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Target } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user!.id);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("minutes")
    .eq("user_id", user!.id)
    .gte("date", startOfMonth.toISOString().split("T")[0]);

  const totalMinutesThisMonth = timeEntries?.reduce(
    (sum, entry) => sum + entry.minutes,
    0
  ) || 0;

  const totalAnnualHours = subjects?.reduce(
    (sum, subject) => sum + subject.annual_hours,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Oversikt</h1>
        <p className="text-muted-foreground">
          Velkommen tilbake! Her er en oversikt over timene dine.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Antall fag</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registrerte fag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Timer denne måneden</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMinutes(totalMinutesThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Loggførte timer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Årsrammer totalt</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnnualHours}t</div>
            <p className="text-xs text-muted-foreground">
              Timer å fylle i år
            </p>
          </CardContent>
        </Card>
      </div>

      {(!subjects || subjects.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Kom i gang</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start med å legge til fagene du underviser i.
            </p>
            <a
              href="/dashboard/fag"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Legg til fag
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
