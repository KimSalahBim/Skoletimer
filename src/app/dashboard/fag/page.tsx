import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectManager } from "./subject-manager";

export default async function FagPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  const schoolId = userData?.school_id;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, sfs_framework:sfs_annual_frameworks(*)")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  const { data: sfsFrameworks } = await supabase
    .from("sfs_annual_frameworks")
    .select("*")
    .order("school_type")
    .order("hours_45min", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fag</h1>
        <p className="text-muted-foreground">
          Administrer fag med årsrammer fra SFS 2213
        </p>
      </div>

      <SubjectManager 
        schoolId={schoolId || ""} 
        subjects={subjects || []}
        sfsFrameworks={sfsFrameworks || []}
      />

      <Card>
        <CardHeader>
          <CardTitle>Om årsrammer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Årsramme (fra SFS 2213):</strong> Definerer hvor mange 45-minutters timer en lærer kan ha i løpet av et år innenfor 100% stilling.</p>
          <p><strong>Vekting:</strong> 100% / årsramme = prosent per time. F.eks. 700 timer → 0,143% per time.</p>
          <p><strong>Ulike fag har ulik vekting:</strong> Norsk på ungdomstrinnet har 847 timer (lavere vekting), mens Kroppsøving har 948 timer (høyere vekting).</p>
          <p><strong>Elevenes årstimer:</strong> Fra Udir fag- og timefordeling. Brukes til å beregne hvor mange lærertimer som trengs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
