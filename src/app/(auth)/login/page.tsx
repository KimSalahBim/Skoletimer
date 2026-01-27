import Link from "next/link";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Skoletimer</CardTitle>
        <CardDescription>Logg inn på kontoen din</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Har du ikke en konto?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrer deg
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
