"use client";
import ProgrammePage from "@/components/programmes";
import { useParams } from "next/navigation";

export type SubmitStatus = "success" | "failed" | "waiting" | "submitting";

export default function EditProgramme() {
  const { id } = useParams();
  return (
    <main className="flex flex-col items-left align-left ">
      <ProgrammePage programmeId={id} />
    </main>
  );
}
