"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface AddTeacherFormProps {
  schoolId: string;
}

export function AddTeacherForm({ schoolId }: AddTeacherFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [positionPercentage, setPositionPercentage] = useState("100");
  const [isContactTeacher, setIsContactTeacher] = useState(false);
  const [contactTeacherClass, setContactTeacherClass] = useState("");
  const [contactTeacherPercentage, setContactTeacherPercentage] = useState("5");
  const [isSubjectLeader, setIsSubjectLeader] = useState(false);
  const [subjectLeaderSubject, setSubjectLeaderSubject] = useState("");
  const [subjectLeaderPercentage, setSubjectLeaderPercentage] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPositionPercentage("100");
    setIsContactTeacher(false);
    setContactTeacherClass("");
    setContactTeacherPercentage("5");
    setIsSubjectLeader(false);
    setSubjectLeaderSubject("");
    setSubjectLeaderPercentage("5");
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
      position_percentage: parseInt(positionPercentage) || 100,
      is_contact_teacher: isContactTeacher,
      contact_teacher_class: isContactTeacher ? contactTeacherClass.trim() : null,
      contact_teacher_percentage: isContactTeacher ? parseFloat(contactTeacherPercentage) || 0 : 0,
      is_subject_leader: isSubjectLeader,
      subject_leader_subject: isSubjectLeader ? subjectLeaderSubject.trim() : null,
      subject_leader_percentage: isSubjectLeader ? parseFloat(subjectLeaderPercentage) || 0 : 0,
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

          <div className="space-y-2">
            <Label htmlFor="position">Stillingsprosent</Label>
            <Input
              id="position"
              type="number"
              min="0"
              max="100"
              value={positionPercentage}
              onChange={(e) => setPositionPercentage(e.target.value)}
            />
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isContactTeacher"
                checked={isContactTeacher}
                onChange={(e) => setIsContactTeacher(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isContactTeacher">Kontaktlærer</Label>
            </div>
            {isContactTeacher && (
              <div className="grid gap-4 sm:grid-cols-2 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="ctClass">Klasse</Label>
                  <Input
                    id="ctClass"
                    placeholder="1STA"
                    value={contactTeacherClass}
                    onChange={(e) => setContactTeacherClass(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctPercentage">Reduksjon (%)</Label>
                  <Input
                    id="ctPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={contactTeacherPercentage}
                    onChange={(e) => setContactTeacherPercentage(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSubjectLeader"
                checked={isSubjectLeader}
                onChange={(e) => setIsSubjectLeader(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isSubjectLeader">Fagleder</Label>
            </div>
            {isSubjectLeader && (
              <div className="grid gap-4 sm:grid-cols-2 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="slSubject">Fag</Label>
                  <Input
                    id="slSubject"
                    placeholder="Matematikk"
                    value={subjectLeaderSubject}
                    onChange={(e) => setSubjectLeaderSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slPercentage">Reduksjon (%)</Label>
                  <Input
                    id="slPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={subjectLeaderPercentage}
                    onChange={(e) => setSubjectLeaderPercentage(e.target.value)}
                  />
                </div>
              </div>
            )}
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
