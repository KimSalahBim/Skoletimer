"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SchoolSettingsFormProps {
  schoolId: string;
  settings: any;
}

export function SchoolSettingsForm({ schoolId, settings }: SchoolSettingsFormProps) {
  const [schoolYear, setSchoolYear] = useState(settings?.current_school_year || "2025/2026");
  const [schoolWeeks, setSchoolWeeks] = useState(settings?.school_weeks_per_year?.toString() || "38");
  const [lessonDuration, setLessonDuration] = useState(settings?.lesson_duration_minutes?.toString() || "45");
  const [inspectionMinutes, setInspectionMinutes] = useState(settings?.inspection_minutes_per_100_percent?.toString() || "90");
  const [defaultContactPercent, setDefaultContactPercent] = useState(settings?.default_contact_teacher_percent?.toString() || "5");
  const [defaultAdvisorPercent, setDefaultAdvisorPercent] = useState(settings?.default_advisor_percent?.toString() || "10");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from("school_settings")
      .update({
        current_school_year: schoolYear,
        school_weeks_per_year: parseInt(schoolWeeks) || 38,
        lesson_duration_minutes: parseInt(lessonDuration) || 45,
        inspection_minutes_per_100_percent: parseInt(inspectionMinutes) || 90,
        default_contact_teacher_percent: parseFloat(defaultContactPercent) || 5,
        default_advisor_percent: parseFloat(defaultAdvisorPercent) || 10,
      })
      .eq("school_id", schoolId);

    setLoading(false);
    
    if (!error) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beregningsparametere</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="schoolYear">Skoleår</Label>
            <Input
              id="schoolYear"
              placeholder="2025/2026"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Format: ÅÅÅÅ/ÅÅÅÅ</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolWeeks">Undervisningsuker per år</Label>
            <Input
              id="schoolWeeks"
              type="number"
              min="30"
              max="52"
              value={schoolWeeks}
              onChange={(e) => setSchoolWeeks(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Standard: 38 uker</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonDuration">Timelengde (minutter)</Label>
            <Input
              id="lessonDuration"
              type="number"
              min="30"
              max="90"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Standard: 45 minutter</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectionMinutes">Inspeksjon (min/uke ved 100%)</Label>
            <Input
              id="inspectionMinutes"
              type="number"
              min="0"
              max="300"
              value={inspectionMinutes}
              onChange={(e) => setInspectionMinutes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minutter inspeksjon per uke ved full stilling</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultContactPercent">Standard kontaktlærer (%)</Label>
            <Input
              id="defaultContactPercent"
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={defaultContactPercent}
              onChange={(e) => setDefaultContactPercent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Forslag ved ny kontaktlærer</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultAdvisorPercent">Standard rådgiver (%)</Label>
            <Input
              id="defaultAdvisorPercent"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={defaultAdvisorPercent}
              onChange={(e) => setDefaultAdvisorPercent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Forslag ved ny rådgiver</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Lagrer..." : "Lagre innstillinger"}
          </Button>
          {success && (
            <span className="text-sm text-green-600">Innstillinger lagret!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
