"use client"

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const projects = useQuery(api.projects.get, {});
  const createProject = useMutation(api.projects.create);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-background">
      
      <Button onClick={() => createProject({ name: "New Project" })}>
        Add new
      </Button>
      {projects?.map((project) => (
        <div key={project._id}>
          {project.name} 
        </div>
      ))}
      <Button variant="outline">Hello</Button>
    </div>
  );
}
