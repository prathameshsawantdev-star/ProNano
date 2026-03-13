import React from 'react'
import { useProjects } from "@/features/project/hooks/use-project";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getProjectIcon } from './projectlist-view';
import { useRouter } from 'next/navigation';

interface ProjectsCommandDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
}

const ProjectsCommandDialog = ({ open, onOpenChange }: ProjectsCommandDialogProps) => {
    const router = useRouter();
    const projects = useProjects();

    const handleSelect = (projectId: string) => {
        router.push(`/projects/${projectId}`)
        onOpenChange(false);
    }

    return (
    <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search Projects"
        description='Search and Navigate to your projects'
    >
        <CommandInput placeholder='Search Project...' />
        <CommandList>
            <CommandEmpty>No projects found:</CommandEmpty>
            <CommandGroup heading="Projects">
                {projects?.map((project) => 
                    <CommandItem
                        key={project._id}
                        value={`${project.name}-${project._id}`}
                        onSelect={() => handleSelect(project._id)}
                    >
                        {getProjectIcon(project)}
                        <span>{project.name}</span>
                    </CommandItem>
                )}
            </CommandGroup>
        </CommandList>
    </CommandDialog>
  )
}

export default ProjectsCommandDialog