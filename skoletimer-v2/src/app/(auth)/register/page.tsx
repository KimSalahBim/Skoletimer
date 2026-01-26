import Link from "next/link";
import { RegisterForm } from "./register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Opprett konto</CardTitle>
        <CardDescription>Registrer deg for å bruke Skoletimer</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Har du allerede en konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Logg inn
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
