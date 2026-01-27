import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FagPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, subject_leader:teachers(name)")
    .eq("school_id", userData?.school_id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fag</h1>
        <p className="text-muted-foreground">
          Administrer fag og fagledere
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle fag ({subjects?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects && subjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Fag</th>
                    <th className="pb-3 font-medium">Kode</th>
                    <th className="pb-3 font-medium">Kategori</th>
                    <th className="pb-3 font-medium">Fagleder</th>
                    <th className="pb-3 font-medium text-right">Timer/uke</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject: any) => (
                    <tr key={subject.id} className="border-b last:border-0">
                      <td className="py-4 font-medium">{subject.name}</td>
                      <td className="py-4">{subject.code || "-"}</td>
                      <td className="py-4">{subject.category || "-"}</td>
                      <td className="py-4">{subject.subject_leader?.name || "-"}</td>
                      <td className="py-4 text-right">{subject.hours_per_week || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen fag lagt til ennå.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
