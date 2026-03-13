import { useQuery } from 'convex/react';
import React from 'react'
import { api } from '../../../../convex/_generated/api';
import { useProjects, useProjectsPartial } from '../hooks/use-project';
import { Spinner } from '@/components/ui/spinner';
import { Kbd } from '@/components/ui/kbd';
import { Doc } from '../../../../convex/_generated/dataModel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircleIcon, ArrowRightIcon, GlobeIcon, Loader2Icon } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const timeStampFormat = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true
    })
}

const getProjectIcon = (project: Doc<"projects">) => {
        switch(project.importStatus) {
            case "completed": 
                return <FaGithub className='size-3.5 text-muted-foreground' />
                break;
            case "failed":
                return <AlertCircleIcon className="size-3.5 text-red-500/15" />
                break;
            case "importing":
                return <Loader2Icon className="size-3.5 text-muted-foreground animate-spin" />
                break;
            default:
                return <GlobeIcon className="size-3.5 text-muted-foreground" />
                break;
        }
}

interface ProjectListViewProps { 
    onViewAllProjects: () => void;
}

const ProjectList = ({ onViewAllProjects }: ProjectListViewProps) => {
  const projects = useProjectsPartial({ limit: 5 });
  if (projects === undefined) {
    return <Spinner className='size-4 text-ring' />
  }
  const [mostRecent, ...rest] = projects;

  return (
    <div className='flex flex-col gap-4'>
        {mostRecent && (<ContinueCard project={mostRecent} />)}
        {(rest.length > 0) && (
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
                <ul>
                    {rest.map((project) => (
                        <ProjectItem key={project._id} data={project} />
                    ))}
                </ul>
            </div>
        )}
    </div>
  )
}

const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
    return(
       <Link 
       href={`/projects/${data._id}`}
       className="w-full py-1 flex justify-between items-center text-sm font-medium text-foreground/60 hover:text-foreground group"
       >
        <div className="flex items-center gap-2">
            {getProjectIcon(data)}
            <span className="truncate">{data.name}</span>
        </div>
         <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
                {timeStampFormat(data.updatedAt)}
            </span>
       </Link>
    )
}

const ContinueCard = ({project}: {project: Doc<"projects">}) => {
    return(
        <div className='flex flex-col gap-2'>
            <span className="text-muted-foreground text-xs">Last updated</span>
            <Button
                variant="outline"
                asChild
                className="h-auto flex flex-col justify-start items-start gap-2 border rounded-none"
            >
                <Link className="group" href={`/projects/${project._id}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            {getProjectIcon(project)}
                        </div>
                        <span className='text-medium truncate'>
                             {project.name}
                        </span>
                         <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className='text-medium text-xs text-muted-foreground'>
                        {timeStampFormat(project.updatedAt)}
                    </span>
                </Link>
            </Button>
        </div>
    )
}
export default ProjectList