"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { GRADE_LEVELS_GRUNNSKOLE, GRADE_LEVELS_VGS } from "@/lib/utils";

interface GradeLevelManagerProps {
  schoolId: string;
  schoolType: string;
  gradeLevels: any[];
}

export function GradeLevelManager({ schoolId, schoolType, gradeLevels }: GradeLevelManagerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const availableLevels = schoolType === 'vgs' 
    ? GRADE_LEVELS_VGS 
    : schoolType === 'kombinert'
      ? [...GRADE_LEVELS_GRUNNSKOLE, ...GRADE_LEVELS_VGS]
      : GRADE_LEVELS_GRUNNSKOLE;

  const existingLevelNumbers = gradeLevels.map(g => g.level_number);
  const levelsToAdd = availableLevels.filter(l => !existingLevelNumbers.includes(l.level));

  const handleAddLevel = async (level: typeof availableLevels[0]) => {
    setLoading(true);
    await supabase.from("grade_levels").insert({
      school_id: schoolId,
      name: level.name,
      level_number: level.level,
      school_type: level.level <= 10 ? 'grunnskole' : 'vgs',
      level_category: level.category,
      sort_order: level.level,
    });
    setLoading(false);
    router.refresh();
  };

  const handleAddAllLevels = async () => {
    setLoading(true);
    const inserts = levelsToAdd.map(level => ({
      school_id: schoolId,
      name: level.name,
      level_number: level.level,
      school_type: level.level <= 10 ? 'grunnskole' : 'vgs',
      level_category: level.category,
      sort_order: level.level,
    }));
    await supabase.from("grade_levels").insert(inserts);
    setLoading(false);
    router.refresh();
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Slette dette trinnet? Klasser knyttet til trinnet vil også bli slettet.")) return;
    await supabase.from("grade_levels").update({ is_active: false }).eq("id", id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trinn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gradeLevels.length > 0 ? (
          <div className="space-y-2">
            {gradeLevels.map((level) => (
              <div key={level.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="font-medium">{level.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleDeleteLevel(level.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Ingen trinn opprettet</p>
        )}

        {levelsToAdd.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium">Legg til trinn</p>
              <Button size="sm" variant="outline" onClick={handleAddAllLevels} disabled={loading}>
                Legg til alle
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {levelsToAdd.map((level) => (
                <Button
                  key={level.level}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddLevel(level)}
                  disabled={loading}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {level.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
