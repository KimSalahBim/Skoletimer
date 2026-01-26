"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

export function AddSubjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [annualHours, setAnnualHours] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    const { error } = await supabase.from("subjects").insert({
      user_id: user.id,
      name: name.trim(),
      annual_hours: parseInt(annualHours) || 0,
      color,
    });

    if (error) {
      if (error.code === "23505") {
        setError("Du har allerede et fag med dette navnet");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      setName("");
      setAnnualHours("");
      setColor(COLORS[0]);
      setIsOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Legg til fag
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legg til nytt fag</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Fagnavn</Label>
              <Input
                id="name"
                placeholder="f.eks. Matematikk 1P"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualHours">Årsramme (timer)</Label>
              <Input
                id="annualHours"
                type="number"
                min="0"
                placeholder="f.eks. 140"
                value={annualHours}
                onChange={(e) => setAnnualHours(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Farge</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Legger til..." : "Legg til"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Avbryt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
