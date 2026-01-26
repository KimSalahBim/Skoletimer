import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function TimeplanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeplan</h1>
        <p className="text-muted-foreground">
          Se og administrer timeplan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeplan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Kommer snart</h3>
            <p className="text-muted-foreground">
              Timeplan-funksjonen er under utvikling.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
