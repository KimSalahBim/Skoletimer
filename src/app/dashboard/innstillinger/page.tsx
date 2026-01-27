import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SchoolSettingsForm } from "./school-settings-form";

export default async function InnstillingerPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("*, school:schools(*)")
    .eq("id", authUser!.id)
    .single();

  const school = userData?.school as any;

  const { data: settings } = await supabase
    .from("school_settings")
    .select("*")
    .eq("school_id", userData?.school_id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">
          Konfigurer skoleinnstillinger og beregningsparametere
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skoleinformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Skolenavn</p>
                <p className="font-medium">{school?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skoletype</p>
                <p className="font-medium capitalize">{school?.school_type || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Org.nummer</p>
                <p className="font-medium">{school?.org_number || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By</p>
                <p className="font-medium">{school?.city || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abonnement</p>
                <Badge variant={school?.subscription_tier === "trial" ? "secondary" : "default"}>
                  {school?.subscription_tier || "trial"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brukerkonto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Navn</p>
                <p className="font-medium">{userData?.full_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-post</p>
                <p className="font-medium">{userData?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rolle</p>
                <Badge>{userData?.role || "teacher"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SchoolSettingsForm 
        schoolId={userData?.school_id || ""}
        settings={settings}
      />
    </div>
  );
}
