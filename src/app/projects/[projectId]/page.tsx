import ProjectIdView from '@/features/project/components/project-id-view';
import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel';

const ProjectIdPage = async ({ params }: {
    params: Promise<{ projectId: string }>
}) => {
  const { projectId }= await params;
  return (
   <ProjectIdView projectId={projectId as Id<"projects">} />
  )
}

export default ProjectIdPage