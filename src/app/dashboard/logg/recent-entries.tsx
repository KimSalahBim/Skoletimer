"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatMinutes, formatDate } from "@/lib/utils";

interface TimeEntryWithSubjects {
  id: string;
  date: string;
  minutes: number;
  description: string | null;
  time_entry_subjects: {
    minutes: number;
    subject: {
      id: string;
      name: string;
      color: string;
    } | null;
  }[];
}

interface RecentEntriesProps {
  entries: TimeEntryWithSubjects[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const router = useRouter();
  const supabase = createClient();

  const deleteEntry = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne registreringen?"))
      return;

    await supabase.from("time_entries").delete().eq("id", id);
    router.refresh();
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Siste registreringer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="font-medium">{formatDate(entry.date)}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.time_entry_subjects.map((tes, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-sm"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: tes.subject?.color || "#888" }}
                      />
                      {tes.subject?.name || "Ukjent"}: {formatMinutes(tes.minutes)}
                    </span>
                  ))}
                </div>
                {entry.description && (
                  <p className="text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatMinutes(entry.minutes)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
