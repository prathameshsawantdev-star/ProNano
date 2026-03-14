import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import TopNavigation from './top-navigation'
import { useEditor } from '../hooks/use-editor'
import FileBreadcrumbs from './file-breadcrumbs'
import { useFile } from '@/features/project/hooks/use-files'
import Image from 'next/image'

const EditorView = ({ projectId }: {projectId: Id<"projects">}) => {
  const { activeTabId } = useEditor(projectId)
  const activeFile = useFile(activeTabId)
  return (
    <div className='flex flex-col h-full'>
      <div className="flex items-center">
        <TopNavigation projectId={projectId as Id<"projects">} />
      </div>
      <FileBreadcrumbs projectId={projectId} />
      <div className='flex-1 min-h-0 bg-background'>
        {!activeFile && (
          <div className='flex items-center justify-center size-full'>
            <Image
             src="/logo.svg"
             width={60}
             height={60}
             className='opacity-25 size-[30%]'
             alt="Pronano code editor"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorView