import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function TimeføringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeføring</h1>
        <p className="text-muted-foreground">
          Registrer arbeidstid
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeføring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Kommer snart</h3>
            <p className="text-muted-foreground">
              Timeføring-funksjonen er under utvikling.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
