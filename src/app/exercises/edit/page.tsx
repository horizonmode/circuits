"use client";
import ExercisePage from "@/components/exercises";
import { useSearchParams } from "next/navigation";

export default function EditExercise() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <main className="flex flex-col items-left align-left ">
      <ExercisePage exerciseId={id} />
    </main>
  );
}
