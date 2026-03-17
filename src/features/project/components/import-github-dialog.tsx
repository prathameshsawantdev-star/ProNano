import { Button } from "@/components/ui/button";
import z from "zod";


const formSchema = z.object({
    url: z.url("Please enter a valid url")
})

interface ImportGihubDialoProps {
    open: boolean,
    onOpenChange: (open: boolean) => void 
}


import React from 'react'
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useForm } from "@tanstack/react-form";
import ky, { HTTPError } from "ky";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ImportGithubDialog = ({ open, onOpenChange }: ImportGihubDialoProps) => {
  const router = useRouter()
  const { openUserProfile } =  useClerk()

  const form = useForm({
    defaultValues: {
        url: ""
    },
    validators: {
        onSubmit: formSchema
    },
    onSubmit: async({ value }) => {
        try {
        console.log(value.url)
        const { projectId } = await ky.post("/api/github/import", {
            json: {
                url: value.url 
            }
        }).json<{ success: boolean, projectId: Id<"projects">, eventId: string}>()

        toast.success("Importing repository...")
        onOpenChange(false)
        form.reset()

        router.push(`/projects/${projectId}`)
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
                onOpenChange(false);
                return
            }
            toast.error("Unable to import repository. Please check URL and try again")

        }
    }
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Import from GitHub</DialogTitle>
                <DialogDescription>
                    Enter the GitHub repository url to import. new project will be created with the contents of the repository
                </DialogDescription>
            </DialogHeader>
            <form
             onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
             }}
            >
              <form.Field name="url">
                {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return(
                        <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                                Repository URL
                            </FieldLabel>
                            <Input 
                             name={field.name}
                             value={field.state.value}
                             id={field.name}
                             onBlur={field.handleBlur}
                             onChange={(e) => field.handleChange(e.target.value)}
                             aria-invalid={isInvalid}
                             placeholder="https://github.com/owner/repo"
                             onPaste={(e) => {
                                e.preventDefault()
                                form.handleSubmit()
                             }}
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                    )
                }}
              </form.Field>
             <div className="flex items-center gap-2 mt-2">
                 <Button
               variant="outline"
               onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
               selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                    <Button
                      disabled={!canSubmit || isSubmitting}
                      type="submit"
                    >
                        {isSubmitting ? "Importing..." : "Import"}
                    </Button>
                )}
              </form.Subscribe>
             </div>
            </form>
        </DialogContent>
    </Dialog>
  )
}

export default ImportGithubDialog
