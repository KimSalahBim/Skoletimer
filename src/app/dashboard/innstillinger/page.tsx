import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function InnstillingerPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("*, school:schools(*)")
    .eq("id", authUser!.id)
    .single();

  const school = userData?.school as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">
          Administrer skoleinnstillinger
        </p>
      </div>

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
              <p className="text-sm text-muted-foreground">Organisasjonsnummer</p>
              <p className="font-medium">{school?.org_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">By</p>
              <p className="font-medium">{school?.city || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abonnement</p>
              <Badge variant={school?.subscription_tier === "trial" ? "warning" : "success"}>
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
  );
}
