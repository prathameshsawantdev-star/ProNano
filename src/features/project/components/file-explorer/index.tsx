
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { useProject } from '../hooks/use-project'
import { Button } from '@/components/ui/button'
import { useCreateFile, useCreateFolder } from '../hooks/use-files'

const FileExplorer = ({ projectId }: { projectId: Id<"projects">}) => {
  const [isActive, setIsActive] = useState(false);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const project = useProject({ projectId});

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const handleCreate = (name: string) => {
    if(creating === "file") {
        createFile({
            projectId: projectId, 
            name,
            content: "",
            parentId: undefined
        })
    } else {
        createFolder({
            projectId: projectId,
            name, 
            parentId: undefined
        })
    }

    setCreating(null)
  } 
  return (
    <div className='h-full bg-sidebar'>
        <ScrollArea>
            <div
                onClick={() => setIsActive(s => !s)}
                className='w-full h-5.5 flex items-center gap-0.5 bg-accent text-left font-bold cursor-pointer group/project'
            >
                <ChevronRightIcon
                 className={cn(
                    "size-4 text-muted-foreground shrink-0 transition-transform",
                    isActive && "rotate-90"
                 )}
                />
                <p className='text-xs uppercase line-clamp-1'>
                    {project?.name ?? "Loading..."}
                </p>
                <div className='flex items-center gap-0.5 ml-auto opacity-0 group-hover/project:opacity-100 transition-none duration-0'>
                  <Button
                   onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsActive(true)
                    // set isCreating to true 
                   }}
                   variant="highlight"
                   size="icon-xs-custom"
                  >
                    <FilePlusCornerIcon className='size-3.5' />
                  </Button>
                  <Button
                   onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsActive(true)
                    // set isCreating to true 
                   }}
                   variant="highlight"
                   size="icon-xs-custom"
                  >
                    <FolderPlusIcon className='size-3.5' />
                  </Button>
                  <Button
                   onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsActive(true)
                    setCollapseKey(p => p+1)
                   }}
                   variant="highlight"
                   size="icon-xs-custom"
                  >
                    <CopyMinusIcon className='size-3.5' />
                  </Button>
                </div>
            </div>

            {isActive && (
                <CreateInput 
                 type={creating}
                 level={0}
                 onSubmit={handleCreate}
                 onCancel={() => setCreating(null)}
                />
            )}
        </ScrollArea>
    </div>
  )
}

export default FileExplorer