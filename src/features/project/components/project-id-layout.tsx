"use client"

import React, { ReactNode } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import Navbar from './project-navbar'
import { Allotment } from "allotment"

import "allotment/dist/style.css"

interface ProjectIdLayoutProps {
    children: ReactNode,
    projectId: Id<"projects">
}

const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 800
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400
const DEFAULT_MAIN_SIZE = 1000

const ProjectIdLayout = ({ children, projectId }: ProjectIdLayoutProps) => {
  console.log("Sending ID to Convex:", projectId, typeof projectId);
  return (
    <div className="h-screen w-full flex flex-col">
        <Navbar projectId={projectId} />
        <div className='flex flex-1 overflow-hidden'>
          <Allotment
            className='flex flex-1'
            defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
          >
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_MAIN_SIZE}
            >
              Conversation
            </Allotment.Pane>
            <Allotment.Pane>
              {children}
            </Allotment.Pane>
          </Allotment>
        </div>
        
    </div>
  )
}

export default ProjectIdLayout