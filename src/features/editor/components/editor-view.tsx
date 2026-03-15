import React, { useEffect, useRef } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import TopNavigation from './top-navigation'
import { useEditor } from '../hooks/use-editor'
import FileBreadcrumbs from './file-breadcrumbs'
import { useFile, useUpdateFile } from '@/features/project/hooks/use-files'
import Image from 'next/image'
import CodeEditor from './code-editor'

const DEBOUNCE_MS=1500;

const EditorView = ({ projectId }: {projectId: Id<"projects">}) => {
  const { activeTabId } = useEditor(projectId)
  const activeFile = useFile(activeTabId)

  const updateFile = useUpdateFile()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId

  useEffect(() => {
    return () => {
      if (timeoutRef.current){
        clearTimeout(timeoutRef.current)
      }
    }
  }, [activeTabId])
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
      {isActiveFileText && <CodeEditor
        key={activeFile._id}
        initialValue={activeFile.content ?? ""}
       fileName={activeFile.name}
       onChange={(content: string) => {
        if(timeoutRef.current){
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          updateFile({ id: activeFile._id, content})
        }, DEBOUNCE_MS)
       }} 
       />}
       {isActiveFileBinary && (
        <div>todo implement binary preview</div>
       )}
    </div>
  )
}

export default EditorView