"use client"

import React, { ReactNode } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import Navbar from './project-navbar'

interface ProjectIdLayoutProps {
    children: ReactNode,
    projectId: Id<"projects">,
}

const ProjectIdLayout = ({ children, projectId }: ProjectIdLayoutProps) => {
  return (
    <div className="h-screen w-full flex flex-col">
        <Navbar projectId={projectId} />
        {children}
    </div>
  )
}

export default ProjectIdLayout