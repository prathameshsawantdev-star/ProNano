import ProjectIdLayout from '@/features/project/components/project-id-layout';
import React, { ReactNode } from 'react'
import { Id } from '../../../../convex/_generated/dataModel';

const Layout = async ({ children, params }: {
    children: ReactNode,
    params: Promise<{ projectId: string }>
}) => {
  const { projectId } = await params;
  return (
    <ProjectIdLayout projectId={projectId as Id<"projects">}>
        {children}
    </ProjectIdLayout>
  )
}

export default Layout