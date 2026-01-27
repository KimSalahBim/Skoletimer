"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { getSchoolYear } from "@/lib/utils";

interface ClassManagerProps {
  schoolId: string;
  gradeLevels: any[];
  classes: any[];
  teachers: { id: string; name: string }[];
}

export function ClassManager({ schoolId, gradeLevels, classes, teachers }: ClassManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAdd = async () => {
    if (!name || !gradeLevelId) return;
    setLoading(true);
    
    await supabase.from("classes").insert({
      school_id: schoolId,
      grade_level_id: gradeLevelId,
      name: name.trim(),
      study_program: studyProgram.trim() || null,
      student_count: parseInt(studentCount) || 0,
      school_year: getSchoolYear(),
    });
    
    setName("");
    setGradeLevelId("");
    setStudyProgram("");
    setStudentCount("");
    setIsAdding(false);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string, className: string) => {
    if (!confirm(`Slette klassen ${className}?`)) return;
    await supabase.from("classes").update({ is_active: false }).eq("id", id);
    router.refresh();
  };

  // Grupper klasser etter trinn
  const classesByLevel = gradeLevels.map(level => ({
    ...level,
    classes: classes.filter((c: any) => c.grade_level_id === level.id)
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Klasser</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-1" /> Ny klasse
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-3 border rounded-lg space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Trinn *</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={gradeLevelId}
                  onChange={(e) => setGradeLevelId(e.target.value)}
                >
                  <option value="">Velg trinn...</option>
                  {gradeLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Klassenavn *</Label>
                <Input
                  placeholder="F.eks. 8A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Studieprogram (VGS)</Label>
                <Input
                  placeholder="F.eks. Studiespesialisering"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Antall elever</Label>
                <Input
                  type="number"
                  min="0"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !name || !gradeLevelId}>
                Lagre
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        )}

        {gradeLevels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Opprett trinn først for å kunne legge til klasser.
          </p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen klasser opprettet ennå.
          </p>
        ) : (
          <div className="space-y-4">
            {classesByLevel.filter(l => l.classes.length > 0).map((level) => (
              <div key={level.id}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{level.name}</h4>
                <div className="space-y-1">
                  {level.classes.map((cls: any) => (
                    <div key={cls.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{cls.name}</span>
                        {cls.study_program && (
                          <span className="text-sm text-muted-foreground ml-2">({cls.study_program})</span>
                        )}
                        {cls.student_count > 0 && (
                          <span className="text-sm text-muted-foreground ml-2">• {cls.student_count} elever</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(cls.id, cls.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
