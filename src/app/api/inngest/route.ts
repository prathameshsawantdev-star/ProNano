import { processMessage } from "@/features/converstions/inngest/process-message";
import { exportToGithub } from "@/features/project/inngest/export-github-repo";
import { importGithubRepo } from "@/features/project/inngest/import-github-repo";
import { inngest } from "@/inngest/client";
import { generateTextFn, helloWorld, inngestErrorFn } from "@/inngest/functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, 
    generateTextFn,
    inngestErrorFn,
    processMessage,
    importGithubRepo,
    exportToGithub
  ],
});

