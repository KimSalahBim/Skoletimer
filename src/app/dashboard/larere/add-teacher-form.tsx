"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import type { SfsAnnualFramework } from "@/types/database";

interface AddTeacherFormProps {
  schoolId: string;
  sfsFrameworks: SfsAnnualFramework[];
}

export function AddTeacherForm({ schoolId, sfsFrameworks }: AddTeacherFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [positionPercent, setPositionPercent] = useState("100");
  const [sfsFrameworkId, setSfsFrameworkId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEmployeeId("");
    setPositionPercent("100");
    setSfsFrameworkId("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.from("teachers").insert({
      school_id: schoolId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      employee_id: employeeId.trim() || null,
      position_percent: parseFloat(positionPercent) || 100,
      default_sfs_framework_id: sfsFrameworkId || null,
    });

    if (error) {
      if (error.code === "23505") {
        setError("En lærer med denne e-postadressen finnes allerede");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      resetForm();
      setIsOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Legg til lærer
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Legg til lærer</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                placeholder="Ola Nordmann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ola@skolen.no"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Ansattnr.</Label>
              <Input
                id="employeeId"
                placeholder="A12345"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Stillingsprosent</Label>
              <Input
                id="position"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={positionPercent}
                onChange={(e) => setPositionPercent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="framework">Standard årsramme</Label>
              <select
                id="framework"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sfsFrameworkId}
                onChange={(e) => setSfsFrameworkId(e.target.value)}
              >
                <option value="">Velg årsramme...</option>
                <optgroup label="Grunnskole">
                  {sfsFrameworks
                    .filter(f => f.school_type === 'grunnskole')
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.description} ({f.hours_45min} t)
                      </option>
                    ))
                  }
                </optgroup>
                <optgroup label="Videregående">
                  {sfsFrameworks
                    .filter(f => f.school_type === 'vgs')
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.description} ({f.hours_45min} t)
                      </option>
                    ))
                  }
                </optgroup>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Legger til..." : "Legg til lærer"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
