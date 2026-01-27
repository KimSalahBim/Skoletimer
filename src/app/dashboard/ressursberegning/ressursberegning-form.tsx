"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface RessursberegningFormProps {
  schoolId: string;
  classes: any[];
  ungdomstrinnElever: number;
  barnetrinnElever: number;
}

export function RessursberegningForm({ 
  schoolId, 
  classes, 
  ungdomstrinnElever, 
  barnetrinnElever 
}: RessursberegningFormProps) {
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateStudentCount = async (classId: string) => {
    setLoading(true);
    await supabase
      .from("classes")
      .update({ student_count: parseInt(studentCount) || 0 })
      .eq("id", classId);
    setEditingClass(null);
    setStudentCount("");
    setLoading(false);
    router.refresh();
  };

  // Grupper klasser etter trinn-kategori
  const ungdomstrinnClasses = classes.filter(
    (c: any) => c.grade_level?.level_category === 'ungdomstrinnet'
  );
  const barnetrinnClasses = classes.filter(
    (c: any) => c.grade_level?.level_category === 'barnetrinnet'
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ungdomstrinnet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ungdomstrinnet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ungdomstrinnClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen klasser på ungdomstrinnet. Opprett klasser under "Trinn & Klasser".
            </p>
          ) : (
            <div className="space-y-2">
              {ungdomstrinnClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="font-medium">{cls.name}</span>
                  {editingClass === cls.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        className="w-20 h-8"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        placeholder="0"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStudentCount(cls.id)}
                        disabled={loading}
                      >
                        Lagre
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingClass(null)}
                      >
                        Avbryt
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{cls.student_count || 0} elever</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingClass(cls.id);
                          setStudentCount(cls.student_count?.toString() || "0");
                        }}
                      >
                        Endre
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t mt-3">
                <div className="flex justify-between font-medium">
                  <span>Totalt ungdomstrinnet:</span>
                  <span>{ungdomstrinnElever} elever</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barnetrinnet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Barnetrinnet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barnetrinnClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen klasser på barnetrinnet.
            </p>
          ) : (
            <div className="space-y-2">
              {barnetrinnClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="font-medium">{cls.name}</span>
                  {editingClass === cls.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        className="w-20 h-8"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        placeholder="0"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStudentCount(cls.id)}
                        disabled={loading}
                      >
                        Lagre
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingClass(null)}
                      >
                        Avbryt
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{cls.student_count || 0} elever</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingClass(cls.id);
                          setStudentCount(cls.student_count?.toString() || "0");
                        }}
                      >
                        Endre
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t mt-3">
                <div className="flex justify-between font-medium">
                  <span>Totalt barnetrinnet:</span>
                  <span>{barnetrinnElever} elever</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
