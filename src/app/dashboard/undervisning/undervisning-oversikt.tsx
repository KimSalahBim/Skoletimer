"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LESEPLIKT } from "@/lib/utils";

interface UndervisningOversiktProps {
  classesByLevel: Record<string, any[]>;
  subjects: any[];
  teacherSubjects: any[];
  teachers: any[];
  schoolId: string;
}

function getLesepliktForSubject(subjectName: string): number {
  const name = subjectName.toLowerCase();
  if (name.includes('norsk') || name.includes('samisk') || name.includes('tegnspråk')) {
    return LESEPLIKT.ungdomstrinnet.norsk;
  }
  if (name.includes('engelsk') || name.includes('mat og helse')) {
    return LESEPLIKT.ungdomstrinnet.engelsk_mathelse;
  }
  return LESEPLIKT.ungdomstrinnet.ovrige_fag;
}

export function UndervisningOversikt({ 
  classesByLevel, 
  subjects, 
  teacherSubjects, 
  teachers,
  schoolId 
}: UndervisningOversiktProps) {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Slette denne tildelingen?")) return;
    await supabase.from("teacher_subjects").delete().eq("id", id);
    router.refresh();
  };

  const handleUpdateHours = async (id: string) => {
    if (!editHours) return;
    await supabase
      .from("teacher_subjects")
      .update({ hours_per_week: parseFloat(editHours) })
      .eq("id", id);
    setEditingId(null);
    setEditHours("");
    router.refresh();
  };

  const levelNames = Object.keys(classesByLevel).sort((a, b) => {
    // Sorter etter trinnnummer
    const aNum = parseInt(a.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });

  if (levelNames.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Ingen klasser opprettet. Gå til "Trinn & Klasser" for å legge til.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Oversikt per klasse</h2>
      
      {levelNames.map(levelName => (
        <div key={levelName} className="space-y-2">
          <h3 className="font-medium text-muted-foreground">{levelName}</h3>
          
          {classesByLevel[levelName].map((cls: any) => {
            const classAssignments = teacherSubjects.filter(ts => ts.class_id === cls.id);
            const totalHours = classAssignments.reduce((sum, ts) => sum + (ts.hours_per_week || 0), 0);
            const isExpanded = expandedClass === cls.id;

            return (
              <Card key={cls.id}>
                <CardHeader 
                  className="cursor-pointer py-3"
                  onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{cls.name}</CardTitle>
                      <Badge variant="outline">
                        {classAssignments.length} fag
                      </Badge>
                      <Badge variant="secondary">
                        {totalHours.toFixed(1)} t/u
                      </Badge>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {classAssignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Ingen fag tildelt ennå.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {classAssignments
                          .sort((a, b) => (a.subject?.name || '').localeCompare(b.subject?.name || ''))
                          .map((ts: any) => {
                            const leseplikt = getLesepliktForSubject(ts.subject?.name || '');
                            const percent = (ts.hours_per_week / leseplikt) * 100;
                            const isEditing = editingId === ts.id;

                            return (
                              <div 
                                key={ts.id} 
                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-32">{ts.subject?.name}</span>
                                  <span className="text-muted-foreground">{ts.teacher?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <Input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        className="w-20 h-8"
                                        value={editHours}
                                        onChange={(e) => setEditHours(e.target.value)}
                                      />
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleUpdateHours(ts.id)}
                                      >
                                        Lagre
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setEditingId(null)}
                                      >
                                        Avbryt
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm">
                                        {ts.hours_per_week} t/u
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({percent.toFixed(1)}%)
                                      </span>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingId(ts.id);
                                          setEditHours(ts.hours_per_week.toString());
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7 text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(ts.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Vis manglende fag */}
                    {subjects.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Fag uten tildeling:</p>
                        <div className="flex flex-wrap gap-1">
                          {subjects
                            .filter(subj => !classAssignments.some(ts => ts.subject_id === subj.id))
                            .map(subj => (
                              <Badge key={subj.id} variant="outline" className="text-xs">
                                {subj.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
