"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Teacher } from "@/types/database";

interface TeacherActionsProps {
  teacher: Teacher;
}

export function TeacherActions({ teacher }: TeacherActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm(`Er du sikker på at du vil slette ${teacher.name}?`)) return;

    await supabase
      .from("teachers")
      .update({ is_active: false })
      .eq("id", teacher.id);

    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
