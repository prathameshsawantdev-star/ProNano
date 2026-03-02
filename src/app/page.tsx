"use client"

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get, {});
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-background">
      {tasks?.map((task) => (
        <div key={task._id}>
          {task.text}
        </div>
      ))}
      <Button variant="outline">Hello</Button>
    </div>
  );
}
