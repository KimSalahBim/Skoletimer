"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle } from "lucide-react";
import { LESEPLIKT } from "@/lib/utils";

interface TildelFagFormProps {
  schoolId: string;
  classes: any[];
  subjects: any[];
  teachers: any[];
}

// Finn leseplikt-kategori basert på fagnavn
function getLesepliktCategory(subjectName: string): string {
  const name = subjectName.toLowerCase();
  if (name.includes('norsk') || name.includes('samisk') || name.includes('tegnspråk')) {
    return 'norsk';
  }
  if (name.includes('engelsk') || name.includes('mat og helse')) {
    return 'engelsk_mathelse';
  }
  return 'ovrige_fag';
}

function getLesepliktValue(category: string): number {
  switch (category) {
    case 'norsk': return LESEPLIKT.ungdomstrinnet.norsk;
    case 'engelsk_mathelse': return LESEPLIKT.ungdomstrinnet.engelsk_mathelse;
    default: return LESEPLIKT.ungdomstrinnet.ovrige_fag;
  }
}

export function TildelFagForm({ schoolId, classes, subjects, teachers }: TildelFagFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Beregn stillingsprosent som vil bli brukt
  const selectedSubject = subjects.find(s => s.id === subjectId);
  const selectedTeacher = teachers.find(t => t.id === teacherId);
  const lesepliktCategory = selectedSubject ? getLesepliktCategory(selectedSubject.name) : 'ovrige_fag';
  const lesepliktValue = getLesepliktValue(lesepliktCategory);
  const estimatedPercent = hoursPerWeek ? (parseFloat(hoursPerWeek) / lesepliktValue) * 100 : 0;
  
  // Sjekk om læreren vil bli overbooket
  const newTotalPercent = selectedTeacher 
    ? selectedTeacher.usedPercent + estimatedPercent 
    : 0;
  const willOverbook = selectedTeacher && newTotalPercent > selectedTeacher.position_percent;

  const handleSubmit = async () => {
    if (!classId || !subjectId || !teacherId || !hoursPerWeek) {
      setError("Fyll ut alle felt");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("teacher_subjects")
      .insert({
        school_id: schoolId,
        teacher_id: teacherId,
        subject_id: subjectId,
        class_id: classId,
        hours_per_week: parseFloat(hoursPerWeek),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Reset form
    setClassId("");
    setSubjectId("");
    setTeacherId("");
    setHoursPerWeek("");
    setIsOpen(false);
    setLoading(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Tildel fag til lærer
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tildel fag til lærer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Klasse */}
          <div className="space-y-2">
            <Label>Klasse *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Velg klasse...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade_level?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Fag */}
          <div className="space-y-2">
            <Label>Fag *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Velg fag...</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
            {selectedSubject && (
              <p className="text-xs text-muted-foreground">
                Leseplikt: {lesepliktValue} t/u ({lesepliktCategory.replace('_', ' ')})
              </p>
            )}
          </div>

          {/* Lærer */}
          <div className="space-y-2">
            <Label>Lærer *</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              <option value="">Velg lærer...</option>
              {teachers
                .sort((a, b) => b.availablePercent - a.availablePercent)
                .map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.availablePercent.toFixed(1)}% ledig)
                  </option>
                ))}
            </select>
            {selectedTeacher && (
              <p className="text-xs text-muted-foreground">
                Brukt: {selectedTeacher.usedPercent.toFixed(1)}% av {selectedTeacher.position_percent}%
              </p>
            )}
          </div>

          {/* Timer per uke */}
          <div className="space-y-2">
            <Label>Timer per uke *</Label>
            <Input
              type="number"
              min="0.5"
              max="30"
              step="0.5"
              placeholder="F.eks. 4"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
            />
            {hoursPerWeek && (
              <p className="text-xs text-muted-foreground">
                = {estimatedPercent.toFixed(2)}% stilling
              </p>
            )}
          </div>
        </div>

        {/* Advarsel ved overbooking */}
        {willOverbook && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Advarsel: Overbooking</p>
              <p className="text-sm">
                {selectedTeacher?.name} vil få {newTotalPercent.toFixed(1)}% tildelt, 
                men har kun {selectedTeacher?.position_percent}% stilling.
              </p>
            </div>
          </div>
        )}

        {/* Feilmelding */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {/* Knapper */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Lagrer..." : "Lagre tildeling"}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
