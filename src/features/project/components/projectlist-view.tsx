import { useQuery } from 'convex/react';
import React from 'react'
import { api } from '../../../../convex/_generated/api';
import { useProjects, useProjectsPartial } from '../hooks/use-project';
import { Spinner } from '@/components/ui/spinner';
import { Kbd } from '@/components/ui/kbd';

interface ProjectListViewProps { 
    onViewAllProjects: () => void;
}

const ProjectList = ({ onViewAllProjects }: ProjectListViewProps) => {
  const projects = useProjectsPartial({ limit: 5 });
  if (projects === undefined) {
    return <Spinner className='size-4 text-ring' />
  }

  return (
    <div className='flex flex-col gap-4'>
        {(projects.length > 0) && (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        Recent projects
                    </span>
                    <button 
                     className='flex items-center gap-2  text-xs text-muted-foreground hover:text-foreground transition-colors'
                    >
                        <span>View all</span>
                        <Kbd className="bg-accent border">Ctrl+K</Kbd>
                    </button>
                </div>
            </div>
        )}
    </div>
  )
}

export default ProjectList