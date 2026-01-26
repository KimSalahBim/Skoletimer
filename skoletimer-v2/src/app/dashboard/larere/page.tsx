import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTeacherForm } from "./add-teacher-form";
import { TeacherActions } from "./teacher-actions";

export default async function LærerePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .eq("school_id", userData?.school_id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Lærere</h1>
          <p className="text-muted-foreground">
            Administrer lærere og se GAP-timer beregning
          </p>
        </div>
        <AddTeacherForm schoolId={userData?.school_id || ""} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle lærere ({teachers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers && teachers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Navn</th>
                    <th className="pb-3 font-medium">Stilling</th>
                    <th className="pb-3 font-medium">Roller</th>
                    <th className="pb-3 font-medium text-right">GAP-timer</th>
                    <th className="pb-3 font-medium text-right">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-medium">{teacher.position_percentage}%</span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.is_contact_teacher && (
                            <Badge variant="secondary">
                              Kontaktlærer ({teacher.contact_teacher_percentage}%)
                            </Badge>
                          )}
                          {teacher.is_subject_leader && (
                            <Badge variant="secondary">
                              Fagleder ({teacher.subject_leader_percentage}%)
                            </Badge>
                          )}
                          {!teacher.is_contact_teacher && !teacher.is_subject_leader && (
                            <span className="text-sm text-muted-foreground">Ingen spesielle roller</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="font-bold text-primary text-lg">
                          {teacher.gap_hours?.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">timer</span>
                      </td>
                      <td className="py-4 text-right">
                        <TeacherActions teacher={teacher} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen lærere lagt til ennå. Klikk "Legg til lærer" for å komme i gang.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Om GAP-timer beregning</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Formel:</strong> GAP-timer = (Stillingsprosent × 0.1658) - Kontaktlærer% - Fagleder% - Andre reduksjoner</p>
          <p><strong>Eksempel:</strong> 100% stilling gir 16.58 GAP-timer. Trekk fra 5% for kontaktlærer = 11.58 GAP-timer.</p>
          <p>GAP-timer beregnes automatisk basert på informasjonen du legger inn.</p>
        </CardContent>
      </Card>
    </div>
  );
}
