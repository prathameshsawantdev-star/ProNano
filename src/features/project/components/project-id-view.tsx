"use client"

import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { FaGithub } from 'react-icons/fa'

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
            <div className='h-full flex flex-1 justify-end'>
                <div className="h-full px-3 flex items-center gap-2 hover:bg-accent/30 text-muted-foreground border-r cursor-pointer">
                    <FaGithub className='size-3.5' />
                    <span>Export</span>
                </div>
            </div>
        </nav>
        <div className='flex-1 relative'>
                <div className={cn("absolute inset-0", activeView === "editor" ? "visible" : "hidden")}>
                    Editor
                </div>
                 <div className={cn("absolute inset-0", activeView === "preview" ? "visible" : "hidden")}>
                    Preview 
                </div>
        </div>
    </div>
  )
}

export default ProjectIdView