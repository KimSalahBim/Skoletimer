"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject } from "@/types/database";

interface TimeEntryFormProps {
  subjects: Subject[];
}

interface SubjectEntry {
  subjectId: string;
  hours: string;
  minutes: string;
}

export function TimeEntryForm({ subjects }: TimeEntryFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState<SubjectEntry[]>([
    { subjectId: subjects[0]?.id || "", hours: "", minutes: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const addEntry = () => {
    setEntries([
      ...entries,
      { subjectId: subjects[0]?.id || "", hours: "", minutes: "" },
    ]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (
    index: number,
    field: keyof SubjectEntry,
    value: string
  ) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validEntries = entries
      .map((entry) => ({
        subjectId: entry.subjectId,
        minutes:
          (parseInt(entry.hours) || 0) * 60 + (parseInt(entry.minutes) || 0),
      }))
      .filter((entry) => entry.minutes > 0);

    if (validEntries.length === 0) {
      setError("Du må registrere minst én time");
      return;
    }

    const totalMinutes = validEntries.reduce((sum, e) => sum + e.minutes, 0);

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Du må være logget inn");
      setLoading(false);
      return;
    }

    const { data: timeEntry, error: entryError } = await supabase
      .from("time_entries")
      .insert({
        user_id: user.id,
        date,
        minutes: totalMinutes,
        description: description.trim() || null,
      })
      .select()
      .single();

    if (entryError) {
      setError(entryError.message);
      setLoading(false);
      return;
    }

    const subjectEntries = validEntries.map((entry) => ({
      time_entry_id: timeEntry.id,
      subject_id: entry.subjectId,
      minutes: entry.minutes,
    }));

    const { error: subjectsError } = await supabase
      .from("time_entry_subjects")
      .insert(subjectEntries);

    if (subjectsError) {
      setError(subjectsError.message);
      setLoading(false);
      return;
    }

    setEntries([{ subjectId: subjects[0]?.id || "", hours: "", minutes: "" }]);
    setDescription("");
    setSuccess(true);
    setLoading(false);
    router.refresh();

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrer timer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Dato</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Timer per fag</Label>
            {entries.map((entry, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={entry.subjectId}
                    onChange={(e) =>
                      updateEntry(index, "subjectId", e.target.value)
                    }
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Timer"
                    value={entry.hours}
                    onChange={(e) =>
                      updateEntry(index, "hours", e.target.value)
                    }
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Min"
                    value={entry.minutes}
                    onChange={(e) =>
                      updateEntry(index, "minutes", e.target.value)
                    }
                  />
                </div>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEntry(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEntry}>
              + Legg til fag
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
            <Input
              id="description"
              placeholder="Hva jobbet du med?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">Timer registrert!</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Lagrer..." : "Lagre timer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
