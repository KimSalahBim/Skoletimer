"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Subject } from "@/types/database";

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

interface SubjectListProps {
  subjects: Subject[];
}

export function SubjectList({ subjects }: SubjectListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editColor, setEditColor] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditHours(subject.annual_hours.toString());
    setEditColor(subject.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditHours("");
    setEditColor("");
  };

  const saveEdit = async (id: string) => {
    setLoading(true);
    await supabase
      .from("subjects")
      .update({
        name: editName.trim(),
        annual_hours: parseInt(editHours) || 0,
        color: editColor,
      })
      .eq("id", id);

    setEditingId(null);
    setLoading(false);
    router.refresh();
  };

  const deleteSubject = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${name}"?`)) return;

    setLoading(true);
    await supabase.from("subjects").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  };

  if (subjects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ingen fag lagt til ennå. Klikk &quot;Legg til fag&quot; for å komme i gang.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {subjects.map((subject) => (
        <Card key={subject.id}>
          <CardContent className="p-4">
            {editingId === subject.id ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Fagnavn"
                  />
                  <Input
                    type="number"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    placeholder="Årsramme"
                  />
                </div>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`h-6 w-6 rounded-full transition-transform ${
                        editColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(subject.id)}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Lagre
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Avbryt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Årsramme: {subject.annual_hours} timer
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(subject)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteSubject(subject.id, subject.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
