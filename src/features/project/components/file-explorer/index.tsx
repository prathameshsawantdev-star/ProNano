
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import CreateInput from './create-input'
import { Id } from '../../../../../convex/_generated/dataModel'
import { useProject } from '../../hooks/use-project'
import { useCreateFile, useCreateFolder, useFolderContents } from '../../hooks/use-files'
import LoadingRow from './loading-row'
import Tree from './tree'

const FileExplorer = ({ projectId }: { projectId: Id<"projects">}) => {
  const [isActive, setIsActive] = useState(false);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const project = useProject({ projectId});

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const rootFiles = useFolderContents({
    projectId, isEnabled: isActive
  })

  const handleCreate = (name: string) => {
      setCreating(null)
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
                    setCreating("file")
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
                    setCreating("folder")
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
              <>
                {rootFiles === undefined && (
                  <LoadingRow level={0} />
                )}
                {creating && (
                <CreateInput 
                 type={creating}
                 level={0}
                 onSubmit={handleCreate}
                 onCancel={() => setCreating(null)}
                />
              )}
               {rootFiles?.map((item) => (
                <Tree
                 key={`${item._id}-${collapseKey}`}
                 item={item}
                 level={0}
                 projectId={projectId}
                />
               ))}
              </>
            )}
        </ScrollArea>
    </div>
  )
}

export default FileExplorer