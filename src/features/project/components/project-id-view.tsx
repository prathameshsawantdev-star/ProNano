"use client"

import React, { useEffect, useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { FaGithub } from 'react-icons/fa'
import { Allotment } from 'allotment'
import FileExplorer from './file-explorer'
import EditorView from '@/features/editor/components/editor-view'
import PreviewView from '@/features/preview/components/preview-view'
import ExportGitHubPopover from './export-github-popover'

const Tab = ({
    label,
    isActive,
    onClick 
}:{
    label: string,
    isActive: boolean,
    onClick: () => void 
}) => {
    return(
        <div onClick={onClick}
            className={cn(
                "h-full px-3 flex items-center gap-2 hover:bg-accent/30 text-muted-foreground border-r cursor-pointer",
                isActive && "text-foreground bg-background"
            )}
        >
            <span className='text-sm'>{label}</span>
        </div>
    )
}

const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 800   
const DEFAULT_MAIN_SIZE = 1000
const DEFAULT_SIDEBAR_WIDTH = 350

const ProjectIdView = ({ projectId }: { projectId: Id<"projects">}) => {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor"); 
 
  return (
    <div className='flex flex-col h-full'>
        <nav className='h-8.75 flex items-center bg-sidebar border-b'>
            <Tab
                label="Code"
                isActive={activeView === "editor"}
                onClick={() => setActiveView("editor")}
            />
            <Tab 
                label="Preview"
                isActive={activeView === "preview"}
                onClick={() => setActiveView("preview")}
            />
           <ExportGitHubPopover 
            projectId={projectId}
           />
        </nav>
        <div className='flex-1 relative'>
                <div className={cn("absolute inset-0", activeView === "editor" ? "visible" : "hidden")}>
                   <Allotment
                    defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
                   >
                    <Allotment.Pane
                     snap 
                     minSize={MIN_SIDEBAR_WIDTH}
                     maxSize={MAX_SIDEBAR_WIDTH}
                     preferredSize={DEFAULT_SIDEBAR_WIDTH}
                    >
                     <FileExplorer projectId={projectId as Id<"projects">} />
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <EditorView projectId={projectId as Id<"projects">} />
                    </Allotment.Pane>
                   </Allotment>
                </div>
                 <div className={cn("absolute inset-0", activeView === "preview" ? "visible" : "hidden")}>
                    <PreviewView projectId={projectId} />
                </div>
        </div>
    </div>
  )
}

export default ProjectIdView