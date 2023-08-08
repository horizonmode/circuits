"use client";
import ProgrammePage from "@/components/programmes";
import { useSearchParams } from "next/navigation";

export type SubmitStatus = "success" | "failed" | "waiting" | "submitting";

export default function EditProgramme() {
  const params = useSearchParams();
  const id = params.get("id");
  return (
    <main className="flex flex-col items-left align-left ">
      <ProgrammePage programmeId={id} />
    </main>
  );
}
