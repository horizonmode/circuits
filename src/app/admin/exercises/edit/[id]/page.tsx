"use client";
import ExercisePage from "@/components/exercises";
import { useParams } from "next/navigation";

export default function EditExercise() {
  const { id } = useParams();

  return (
    <main className="flex flex-col items-left align-left ">
      <ExercisePage exerciseId={id} />
    </main>
  );
}
