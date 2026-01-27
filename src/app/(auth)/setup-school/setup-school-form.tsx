"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetupSchoolForm() {
  const [schoolName, setSchoolName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Du må være logget inn");
      setLoading(false);
      return;
    }

    // 1. Opprett skolen
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: schoolName.trim(),
        org_number: orgNumber.trim() || null,
        city: city.trim() || null,
      })
      .select()
      .single();

    if (schoolError) {
      setError(schoolError.message);
      setLoading(false);
      return;
    }

    // 2. Oppdater bruker med school_id
    const { error: userError } = await supabase
      .from("users")
      .update({ school_id: school.id })
      .eq("id", user.id);

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schoolName">Skolens navn *</Label>
        <Input
          id="schoolName"
          placeholder="Eksempel videregående skole"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
        <Input
          id="orgNumber"
          placeholder="123 456 789"
          value={orgNumber}
          onChange={(e) => setOrgNumber(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">By/sted</Label>
        <Input
          id="city"
          placeholder="Oslo"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Oppretter skole..." : "Opprett skole og fortsett"}
      </Button>
    </form>
  );
}
