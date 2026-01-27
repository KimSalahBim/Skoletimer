"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { FUNCTION_TYPES } from "@/types/database";
import { formatPercent } from "@/lib/utils";

interface TeacherListProps {
  teachers: any[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  sfsFrameworks: any[];
  suggestedAdvisorPercent?: number;
}

export function TeacherList({ teachers, classes, subjects, sfsFrameworks, suggestedAdvisorPercent = 0 }: TeacherListProps) {
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [addingFunctionFor, setAddingFunctionFor] = useState<string | null>(null);
  const [functionType, setFunctionType] = useState("");
  const [functionPercent, setFunctionPercent] = useState("5");
  const [functionDescription, setFunctionDescription] = useState("");
  const [functionClassId, setFunctionClassId] = useState("");
  const [functionSubjectId, setFunctionSubjectId] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const toggleExpand = (id: string) => {
    setExpandedTeacher(expandedTeacher === id ? null : id);
    setAddingFunctionFor(null);
  };

  const handleDelete = async (teacher: any) => {
    if (!confirm(`Er du sikker på at du vil slette ${teacher.name}?`)) return;
    await supabase.from("teachers").update({ is_active: false }).eq("id", teacher.id);
    router.refresh();
  };

  const handleDeleteFunction = async (functionId: string) => {
    if (!confirm("Slette denne funksjonen?")) return;
    await supabase.from("teacher_functions").delete().eq("id", functionId);
    router.refresh();
  };

  const handleAddFunction = async (teacherId: string, schoolId: string) => {
    if (!functionType || !functionPercent) return;
    
    await supabase.from("teacher_functions").insert({
      school_id: schoolId,
      teacher_id: teacherId,
      function_type: functionType,
      percent_of_position: parseFloat(functionPercent),
      description: functionDescription || null,
      class_id: functionClassId || null,
      subject_id: functionSubjectId || null,
      school_year: "2025/2026",
    });
    
    setAddingFunctionFor(null);
    setFunctionType("");
    setFunctionPercent("5");
    setFunctionDescription("");
    setFunctionClassId("");
    setFunctionSubjectId("");
    router.refresh();
  };

  if (teachers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ingen lærere lagt til ennå.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {teachers.map((teacher) => {
        const isExpanded = expandedTeacher === teacher.id;
        const functionsPercent = teacher.teacher_functions?.reduce((sum: number, f: any) => sum + (f.percent_of_position || 0), 0) || 0;
        const teachingHours = teacher.teacher_subjects?.reduce((sum: number, s: any) => sum + (s.hours_per_week || 0), 0) || 0;
        const teachingPercent = teachingHours * 38 * (100 / 700);
        const gapPercent = teacher.position_percent - functionsPercent - teachingPercent;

        return (
          <Card key={teacher.id}>
            <CardHeader className="cursor-pointer" onClick={() => toggleExpand(teacher.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {teacher.teacher_functions?.map((f: any) => {
                      const className = f.class_id ? classes.find((c: any) => c.id === f.class_id)?.name : null;
                      const label = FUNCTION_TYPES[f.function_type as keyof typeof FUNCTION_TYPES];
                      return (
                        <Badge key={f.id} variant="secondary" className="text-xs">
                          {label}{className ? ` ${className}` : ''} ({f.percent_of_position}%)
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{formatPercent(teacher.position_percent)}</p>
                    <p className={`text-sm ${gapPercent > 0 ? 'text-yellow-600' : gapPercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      GAP: {formatPercent(gapPercent)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="border-t pt-4 space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Stillingsfordeling</h4>
                    <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span>Grunnstilling:</span>
                        <span className="font-medium">{formatPercent(teacher.position_percent)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>− Funksjoner:</span>
                        <span>{formatPercent(functionsPercent)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>− Undervisning ({teachingHours} t/u):</span>
                        <span>{formatPercent(teachingPercent)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>= GAP:</span>
                        <span className={gapPercent > 0 ? 'text-yellow-600' : gapPercent < 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatPercent(gapPercent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Funksjoner</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingFunctionFor(addingFunctionFor === teacher.id ? null : teacher.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Legg til
                      </Button>
                    </div>
                    
                    {teacher.teacher_functions?.length > 0 ? (
                      <div className="space-y-2">
                        {teacher.teacher_functions.map((f: any) => {
                          // Finn klassenavn hvis kontaktlærer
                          const className = f.class_id ? classes.find(c => c.id === f.class_id)?.name : null;
                          // Finn fagnavn hvis fagleder
                          const subjectName = f.subject_id ? subjects.find(s => s.id === f.subject_id)?.name : null;
                          
                          return (
                            <div key={f.id} className="flex justify-between items-center bg-muted/50 rounded p-2 text-sm">
                              <div>
                                <span className="font-medium">
                                  {FUNCTION_TYPES[f.function_type as keyof typeof FUNCTION_TYPES]}
                                </span>
                                {className && <span className="text-muted-foreground ml-2">– {className}</span>}
                                {subjectName && <span className="text-muted-foreground ml-2">– {subjectName}</span>}
                                {f.description && !className && !subjectName && (
                                  <span className="text-muted-foreground ml-2">({f.description})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{f.percent_of_position}%</span>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFunction(f.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Ingen funksjoner registrert</p>
                    )}

                    {addingFunctionFor === teacher.id && (
                      <div className="mt-3 p-3 border rounded-lg space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <select
                              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                              value={functionType}
                              onChange={(e) => {
                                setFunctionType(e.target.value);
                                // Sett foreslått prosent basert på type
                                if (e.target.value === 'advisor' && suggestedAdvisorPercent > 0) {
                                  setFunctionPercent(suggestedAdvisorPercent.toFixed(1));
                                } else if (e.target.value === 'contact_teacher') {
                                  setFunctionPercent("4.29"); // 1 t/u ÷ 23.3 t/u = 4.29%
                                } else {
                                  setFunctionPercent("5");
                                }
                              }}
                            >
                              <option value="">Velg...</option>
                              {Object.entries(FUNCTION_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Prosent</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={functionPercent}
                              onChange={(e) => setFunctionPercent(e.target.value)}
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Beskrivelse (valgfritt)</Label>
                          <Input
                            placeholder="F.eks. 'Kontaktlærer 8A'"
                            value={functionDescription}
                            onChange={(e) => setFunctionDescription(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        {functionType === 'contact_teacher' && (
                          <div>
                            <Label className="text-xs">Klasse</Label>
                            <select
                              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                              value={functionClassId}
                              onChange={(e) => setFunctionClassId(e.target.value)}
                            >
                              <option value="">Velg klasse...</option>
                              {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {functionType === 'subject_leader' && (
                          <div>
                            <Label className="text-xs">Fag</Label>
                            <select
                              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                              value={functionSubjectId}
                              onChange={(e) => setFunctionSubjectId(e.target.value)}
                            >
                              <option value="">Velg fag...</option>
                              {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAddFunction(teacher.id, teacher.school_id)}>
                            Lagre
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAddingFunctionFor(null)}>
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(teacher)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Slett lærer
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
