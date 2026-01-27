import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRADE_LEVELS } from "@/lib/utils";

export default async function KlasserPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const { data: classes } = await supabase
    .from("classes")
    .select("*, contact_teacher:teachers(name)")
    .eq("school_id", userData?.school_id)
    .eq("is_active", true)
    .order("grade_level")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Klasser</h1>
        <p className="text-muted-foreground">
          Administrer klasser og kontaktlærere
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle klasser ({classes?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {classes && classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Klasse</th>
                    <th className="pb-3 font-medium">Trinn</th>
                    <th className="pb-3 font-medium">Studieprogram</th>
                    <th className="pb-3 font-medium">Kontaktlærer</th>
                    <th className="pb-3 font-medium text-right">Elever</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls: any) => (
                    <tr key={cls.id} className="border-b last:border-0">
                      <td className="py-4 font-medium">{cls.name}</td>
                      <td className="py-4">
                        {GRADE_LEVELS.find(g => g.value === cls.grade_level)?.label || cls.grade_level}
                      </td>
                      <td className="py-4">{cls.study_program || "-"}</td>
                      <td className="py-4">{cls.contact_teacher?.name || "-"}</td>
                      <td className="py-4 text-right">{cls.students_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen klasser lagt til ennå.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
