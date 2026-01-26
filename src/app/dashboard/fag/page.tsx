import { createClient } from "@/lib/supabase/server";
import { SubjectList } from "./subject-list";
import { AddSubjectForm } from "./add-subject-form";

export default async function FagPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fag</h1>
        <p className="text-muted-foreground">
          Administrer fagene du underviser i og deres årsrammer.
        </p>
      </div>

      <AddSubjectForm />

      <SubjectList subjects={subjects || []} />
    </div>
  );
}
