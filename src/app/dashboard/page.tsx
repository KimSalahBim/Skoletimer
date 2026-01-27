import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

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

  // Hent lærere med GAP-timer for visning
  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, name, position_percentage, gap_hours, is_contact_teacher, is_subject_leader")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name")
    .limit(5);

  const totalGapHours = teachers?.reduce((sum, t) => sum + (t.gap_hours || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Oversikt</h1>
        <p className="text-muted-foreground">
          Velkommen til Skoletimer. Her er en oversikt over skolen din.
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
              Se alle lærere →
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
            <Link href="/dashboard/klasser" className="text-xs text-primary hover:underline">
              Se alle klasser →
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
              Se alle fag →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GAP-timer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGapHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Totalt tilgjengelig</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lærere og GAP-timer</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers && teachers.length > 0 ? (
            <div className="space-y-4">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.position_percentage}% stilling
                      {teacher.is_contact_teacher && " • Kontaktlærer"}
                      {teacher.is_subject_leader && " • Fagleder"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{teacher.gap_hours?.toFixed(2)} timer</p>
                    <p className="text-xs text-muted-foreground">GAP-timer</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/larere" className="block text-center text-sm text-primary hover:underline pt-2">
                Se alle lærere →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Ingen lærere ennå</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Legg til lærere for å se GAP-timer oversikt
              </p>
              <Link
                href="/dashboard/larere"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                Legg til lærere
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
