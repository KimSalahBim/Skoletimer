import { createClient } from "@/lib/supabase/server";
import { TimeEntryForm } from "./time-entry-form";
import { RecentEntries } from "./recent-entries";

export default async function LoggPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  const { data: recentEntries } = await supabase
    .from("time_entries")
    .select(`
      *,
      time_entry_subjects (
        minutes,
        subject:subjects (
          id,
          name,
          color
        )
      )
    `)
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loggfør timer</h1>
        <p className="text-muted-foreground">
          Registrer timer du har brukt på ulike fag.
        </p>
      </div>

      {subjects && subjects.length > 0 ? (
        <TimeEntryForm subjects={subjects} />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Du må legge til fag før du kan loggføre timer.
          </p>
          <a
            href="/dashboard/fag"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Legg til fag
          </a>
        </div>
      )}

      <RecentEntries entries={recentEntries || []} />
    </div>
  );
}
