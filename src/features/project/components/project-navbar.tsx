import React, { useState, KeyboardEvent } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Poppins } from 'next/font/google'
import { UserButton } from '@clerk/nextjs'
import { useProject, useRenameProject } from '../hooks/use-project'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { CloudCheckIcon, Loader2Icon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
})

const Navbar = ({ projectId }: { projectId: Id<"projects">}) => {
  const project = useProject({ projectId })
  const renameProject = useRenameProject({ projectId })
  const [name, setName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleStartRename = () => {
    if(!project)return;
    setName(project.name)
     setIsRenaming(true);
  }

  const handleSubmitRename = () => {
    if(!project) return;

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName === project.name) return;

    renameProject({ id: projectId, name: trimmedName })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
        handleSubmitRename()
    } else if (e.key === "Escape") {
        setIsRenaming(false);
    }
  }
  return (
    <TooltipProvider>
        <nav     className='p-2 flex justify-between items-center gap-x-2 bg-sidebar border-b'>
        <div className='flex justify-center gap-x-2'>
            <Breadcrumb>
                <BreadcrumbList className="gap-0!">
                    <BreadcrumbItem>
                    <BreadcrumbLink
                        className='flex items-center gap-x-1.5'
                        asChild
                    >
                        <Button
                            className='w-fit! h-7! p-1.5!'
                            variant="ghost"
                            asChild
                        >
                            <Link href="/">
                                <Image src="/logo.svg" alt="Polaris" width={20} height={20} />
                                <span className={cn("text-sm font-medium", font.className)}>
                                    Polaris
                                </span>
                            </Link>
                        </Button>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="ml-0! mr-1" />
                <BreadcrumbItem>
                    {isRenaming ? (
                        <input 
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            onBlur={handleSubmitRename}
                            onKeyDown={handleKeyDown}
                            className='max-w-40 truncate bg-transparent text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring'
                            />
                    ) : (
                        <BreadcrumbPage 
                        onClick={handleStartRename}
                        className='max-w-40! truncate cursor-pointer text-sm text-medium text-foreground! hover:text-primary! transition-colors!'>
                        {project?.name || "loading..."}
                        </BreadcrumbPage>
                    )}
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
                 {project && project.importStatus === "importing" ? (
                <Tooltip>
                    <TooltipTrigger className='flex items-center' asChild>
                        <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
                    </TooltipTrigger>
                    <TooltipContent>Loading...</TooltipContent>
                </Tooltip>
            ):(
                 (project && project.updatedAt && (
                    <Tooltip>
                    <TooltipTrigger className='h-full flex items-center' asChild>
                        <CloudCheckIcon className="text-muted-foreground size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                        Saved{" "}
                        {formatDistanceToNow(
                            project!.updatedAt,
                            {
                                addSuffix: true
                            }
                        )}
                    </TooltipContent>
                </Tooltip>
                 ))
            )}
        </div>
        <div className="flex items-center">
            <UserButton />
        </div>
    </nav>
    </TooltipProvider>
  )
}

export default Navbar