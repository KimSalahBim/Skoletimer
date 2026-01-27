import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default async function SkollerutePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", authUser!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skolerute</h1>
        <p className="text-muted-foreground">
          Definer skolerute med ferier og planleggingsdager
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skolerute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Kommer i neste oppdatering</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Her vil du kunne definere skoleruten med 38 undervisningsuker, 
              høstferie, juleferie, vinterferie, påskeferie og planleggingsdager.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Om skoleruten</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>38 undervisningsuker:</strong> Standard antall uker elever har undervisning i løpet av et skoleår.</p>
          <p><strong>Planleggingsdager:</strong> Dager lærere jobber uten elever. Telles ikke som undervisningsuker.</p>
          <p><strong>Ferier:</strong> Høstferie, juleferie, vinterferie, påskeferie og sommerferie varierer fra kommune til kommune.</p>
        </CardContent>
      </Card>
    </div>
  );
}
