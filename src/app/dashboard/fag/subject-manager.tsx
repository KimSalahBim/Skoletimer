"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { STANDARD_SUBJECTS_GRUNNSKOLE } from "@/lib/utils";
import { SUBJECT_CATEGORIES } from "@/types/database";

interface SubjectManagerProps {
  schoolId: string;
  subjects: any[];
  sfsFrameworks: any[];
}

export function SubjectManager({ schoolId, subjects, sfsFrameworks }: SubjectManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [annualHours, setAnnualHours] = useState("");
  const [sfsFrameworkId, setSfsFrameworkId] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    await supabase.from("subjects").insert({
      school_id: schoolId,
      name: name.trim(),
      short_name: shortName.trim() || null,
      annual_hours_students: parseInt(annualHours) || null,
      sfs_framework_id: sfsFrameworkId || null,
      category: category || null,
    });
    
    resetForm();
    setLoading(false);
    router.refresh();
  };

  const handleAddStandard = async () => {
    setLoading(true);
    
    // Finn standard ungdomstrinn-ramme
    const defaultFramework = sfsFrameworks.find(f => 
      f.school_type === 'grunnskole' && f.subject_category === 'ovrige_fag'
    );
    
    const inserts = STANDARD_SUBJECTS_GRUNNSKOLE.map(subj => ({
      school_id: schoolId,
      name: subj.name,
      short_name: subj.code,
      annual_hours_students: subj.annualHours,
      sfs_framework_id: defaultFramework?.id || null,
      category: subj.category,
    }));
    
    await supabase.from("subjects").insert(inserts);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Slette faget ${name}?`)) return;
    await supabase.from("subjects").update({ is_active: false }).eq("id", id);
    router.refresh();
  };

  const resetForm = () => {
    setName("");
    setShortName("");
    setAnnualHours("");
    setSfsFrameworkId("");
    setCategory("");
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fag ({subjects.length})</CardTitle>
        <div className="flex gap-2">
          {subjects.length === 0 && (
            <Button size="sm" variant="outline" onClick={handleAddStandard} disabled={loading}>
              Legg til standard grunnskolefag
            </Button>
          )}
          <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="h-4 w-4 mr-1" /> Nytt fag
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Fagnavn *</Label>
                <Input
                  placeholder="F.eks. Matematikk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label>Kortnavn</Label>
                <Input
                  placeholder="F.eks. MAT"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Elevenes årstimer</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Fra Udir fag- og timefordeling"
                  value={annualHours}
                  onChange={(e) => setAnnualHours(e.target.value)}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Velg...</option>
                  {Object.entries(SUBJECT_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Årsramme (SFS 2213)</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
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
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading || !name}>
                Lagre
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Avbryt
              </Button>
            </div>
          </div>
        )}

        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Ingen fag opprettet ennå. Klikk "Legg til standard grunnskolefag" for å komme i gang raskt.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Fag</th>
                  <th className="text-left py-2 font-medium">Elevtimer/år</th>
                  <th className="text-left py-2 font-medium">Årsramme lærer</th>
                  <th className="text-right py-2 font-medium">Vekting</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subject.name}</span>
                        {subject.short_name && (
                          <Badge variant="outline" className="text-xs">{subject.short_name}</Badge>
                        )}
                        {subject.category && (
                          <Badge variant="secondary" className="text-xs">
                            {SUBJECT_CATEGORIES[subject.category as keyof typeof SUBJECT_CATEGORIES]}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {subject.annual_hours_students ? `${subject.annual_hours_students} t` : '-'}
                    </td>
                    <td className="py-3">
                      {subject.sfs_framework 
                        ? `${subject.sfs_framework.hours_45min} t` 
                        : '-'
                      }
                    </td>
                    <td className="py-3 text-right">
                      {subject.sfs_framework 
                        ? `${(100 / subject.sfs_framework.hours_45min).toFixed(3)}%` 
                        : '-'
                      }
                    </td>
                    <td className="py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(subject.id, subject.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
