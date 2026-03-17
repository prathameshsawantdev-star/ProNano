import { Button } from "@/components/ui/button";
import z from "zod";


const formSchema = z.object({
  repoName: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name is too long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only alphanumeric characters, hyphens, underscores, and dots are allowed"
    ),
  visibility: z.enum(["public", "private"]),
  description: z.string().max(350, "Description is too long"),
});

interface ExportGihubPopoverProps {
  projectId: Id<"projects">;
}


import React, { useState } from 'react'
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useForm } from "@tanstack/react-form";
import ky, { HTTPError } from "ky";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useProject } from "../hooks/use-project";
import ProjectIdLayout from "./project-id-layout";
import { CheckCheckIcon, CheckCircle2Icon, ExternalLinkIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FaGithub } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ExportGitHubPopover = ({ projectId }: ExportGihubPopoverProps) => {
  const project  = useProject({ projectId })
  const { openUserProfile } =  useClerk()
  const [open, setOpen] = useState(false);

  const exportStatus = project?.exportStatus
  const exportRepoUrl = project?.exportRepoUrl

 
  const handleCancelExport = async () => {
    await ky.post("/api/github/export/cancel", {
      json: { projectId },
    });
  };

  const handleResetExport = async () => {
    await ky.post("/api/github/export/reset", {
      json: { projectId },
    });
    setOpen(false);
  };

  const renderContent = () => {
    if(exportStatus === "exporting") (
        <div className="flex flex-col items-center gap-3">
            <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Exporting GitHub</p>
            <Button
             className="w-full"
             size="sm"
             variant="outline"
             onClick={handleCancelExport}
            >
                Cancel
            </Button>
        </div>
    )

    if(exportStatus === "completed") (
        <div className="flex flex-col items-center gap-3">
            <CheckCircle2Icon className="size-6 text-emerald-600" />
            <p className="text-sm font-medium">Repository Created.</p>
            <p className="text-muted-foreground text-xs text-center">Your project has been exported GitHub</p>
            <div className="flex flex-col gap-2 w-full">
                <Button size="sm" className="w-full" asChild>
                    <a href={exportRepoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="size-4 mr-1" />
                        View on GitHub
                    </a>
                </Button>
                <Button
                 size="sm"
                 variant="outline"
                 onClick={handleCancelExport}
                 className="w-full"
                >
                    Close
                </Button>
            </div>
        </div>
    )

    if(exportStatus === "failed")(
         <div className="flex flex-col items-center gap-3">
            <XCircleIcon className="size-6 animate-spin text-rose-500" />
            <p className="text-sm font-medium">Unable to export!</p>
            <p className="text-muted-foreground text-xs text-center">
                Something went wrong, please try again!
            </p>
            <Button
             className="w-full"
             size="sm"
             variant="outline"
             onClick={handleResetExport}
            >
                Cancel
            </Button>
        </div>
    )

    return(
        <form
         onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
         }}
        >
         <div className="space-y-4">
            <div className="space-y-1">
                <h2>Exporting to Github</h2>
                <p className="text-sm text-muted-foreground">
                    Exporting your project to GitHub repository...
                </p>
            </div>
            <form.Field name="repoName">
                 {(field) => {
                     const isInvalid = field.state.meta.isTouched || !field.state.meta.isValid;
                        return(
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Repository Name
                                </FieldLabel>
                                <Input 
                                        name={field.name}
                                        value={field.state.value}
                                        id={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="my-project"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}}
            </form.Field>

            <form.Field name="visibility">
                 {(field) => {
                        return(
                            <Field>
                                <FieldLabel htmlFor={field.name}>
                                    Visibility
                                </FieldLabel>
                                <Select
                                 value={field.state.value}
                                 defaultValue="private"
                                 onValueChange={(value: "private" | "public") => {
                                    field.handleChange(value)
                                 }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Your Repository" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}}
            </form.Field>

            <form.Field name="description">
                 {(field) => {
                     const isInvalid = field.state.meta.isTouched || !field.state.meta.isValid;
                        return(
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Repository Name
                                </FieldLabel>
                                <Textarea
                                        name={field.name}
                                        value={field.state.value}
                                        id={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="my-project"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([ canSubmit, isSubmitting ]) => (
                        <Button
                         disabled={!canSubmit || isSubmitting}
                         type="submit"
                         className="w-full"
                         size="sm"
                        >
                            {isSubmitting ? "Creating...." : "Create Repository"}
                        </Button>
                    )}
            </form.Subscribe>
         </div>
        </form>
    )
  }

  const getGithubIcon = () => {
    if(exportStatus === "exporting"){
        return <LoaderIcon className="size-3.5 animate-spin" />
    }

    if (exportStatus === "completed"){
        return <CheckCheckIcon className="size-3.5 text-emerald-500" />
    }

    if (exportStatus === "failed"){
        return <XCircleIcon className="size-3.5 text-rose-500" />
    }

    return <FaGithub className="size-3.5" />
  }
  const form = useForm({
    defaultValues: {
     repoName: project?.name?.replace(/[^a-zA-Z0-9._-]/g, "-") ?? "",
      visibility: "private" as "public" | "private",
      description: "",
    },
    validators: {
        onSubmit: formSchema
    },
    onSubmit: async({ value }) => {
        try {
        await ky.post("/api/github/export", {
            json: {
                projectID: projectId,
                repoName: value.repoName,
                description: value.description ?? undefined,
                visibility: value.visibility
            }
        })

        toast.success("Export Started!")
        } catch (error) {
            if(error instanceof HTTPError){
                const body = await error.response.json<{ error: string }>()
                if(body.error.includes("Github not connected")){
                    toast.error("GitHub account not connected", {
                        action: {
                            label: "Connect",
                            onClick: () => openUserProfile()
                        }
                    })
                }
                setOpen(false);
                return
            }
            toast.error("Unable to import repository. Please check URL and try again")

        }
    }
  })
  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <div className="px-3 h-full flex items-center gap-1.5 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
                {getGithubIcon()}
                <span className="text-sm">Export</span>
            </div>
        </PopoverTrigger>

        <PopoverContent className="w-80" align="end">
            {renderContent()}
        </PopoverContent>
    </Popover>
  )
}

export default ExportGitHubPopover
