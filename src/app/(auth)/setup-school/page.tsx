import { SetupSchoolForm } from "./setup-school-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupSchoolPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Sett opp skolen din</CardTitle>
        <CardDescription>
          Opprett skolen din for å komme i gang med Skoletimer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetupSchoolForm />
      </CardContent>
    </Card>
  );
}
