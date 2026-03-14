import React from 'react'

import { Id } from '../../../../convex/_generated/dataModel'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useEditor } from '../hooks/use-editor'
import { useFieldArray } from 'react-hook-form'
import { useFile } from '@/features/project/hooks/use-files'
import { useEditorStore } from '../store/use-editor-store'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { FileIcon } from '@react-symbols/icons/utils'
import { XIcon } from 'lucide-react'

const TopNavigation = ({
    projectId
}:{
    projectId: Id<"projects">
}) => {
    const { openTabs } = useEditor(projectId);

    return(
        <ScrollArea className='flex-1'>
            <nav className='h-8.75 flex items-center bg-sidebar border-b'>
                {openTabs.map((fileId, index) => (
                    <Tab
                     key={fileId}
                     fileId={fileId}
                     isFirst={index === 0}
                     projectId={projectId}
                    />
                ))}
            </nav>
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    )
}

const Tab = ({
    fileId,
    isFirst,
    projectId
}:{
    fileId: Id<"files">,
    isFirst: boolean,
    projectId: Id<"projects">
}) => {
    const file = useFile(fileId);
    const {
        activeTabId,
        previewTabId,
        openFile,
        closeFile,
        setActiveTab
    } = useEditor(projectId)

    const isActive = fileId === activeTabId
    const isPreview = fileId === previewTabId
    const fileName = file?.name ?? "loading..."

    return(
        <div
            onClick={() => setActiveTab(fileId)}
            onDoubleClick={() => openFile(fileId, { pinned: true })}
            className={cn(
                "h-8.75 pl-2 pr-1.5 flex items-center gap-2 text-muted-foreground cursor-pointer border-transparent border-y border-x group hover:bg-accent/30 select-none",
                isActive && "-mb-px text-foreground bg-background border-x-border border-b-background drop-shadow",
                isFirst && "border-l-transparent"
            )}
        >
            {fileName === undefined ? (
                <Spinner className='size-4 ring-ring' />
            ) : (
                <FileIcon fileName={fileName} className='size-4' />
            )}
            <span 
             className={cn(
                "text-sm whitespace-nowrap",
                isPreview && "italic"
             )}
            >
                {fileName}
            </span>
            <button
             onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                closeFile(fileId)
             }}
             onKeyDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if(e.key === "Enter" || e.key === " ") {
                    closeFile(fileId)
                }
             }}
             className={cn(
                "p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-sm",
                isActive && "opacity-100"
             )}
            >   
                <XIcon className='size-3.5' />
            </button>
        </div>
    )
}

export default TopNavigation