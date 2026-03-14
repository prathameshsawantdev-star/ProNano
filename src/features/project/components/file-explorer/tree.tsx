import React, { useReducer, useState } from 'react'
import { Doc, Id } from '../../../../../convex/_generated/dataModel'
import { useCreateFile, useCreateFolder, useDeletefile, useFolderContents, useRenameFile } from '../../hooks/use-files'
import TreeContextMenuWrapper from './tree-item-wrapper'
import { FileIcon, FolderIcon } from '@react-symbols/icons/utils'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import LoadingRow from './loading-row'
import CreateInput from './create-input'

const Tree = ({
    item,
    level,
    projectId
}:{
    item: Doc<"files">,
    level: number,
    projectId: Id<"projects">
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [creating, setIsCreating] = useState<"file" | "folder" | null>(null)

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const renameFile = useRenameFile();
  const deleteFile = useDeletefile();

  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    isEnabled: item.type === "folder" && isOpen
  })

  const handleRename = (newName: string) => {
    setIsRenaming(false);

    if (newName === item.name) return;

    renameFile({
      id: item._id,
      newName
    })
  }

    if(item.type === "file") {
      const filename = item.name 
      return <TreeContextMenuWrapper item={item} level={level} isActive={false} onClick={() => {}} onDoubleClick={() => {}} 
      onRename={ () => setIsRenaming(true)}
      onDelete={() => {
        deleteFile({ 
          id: item._id
        })
      }}
    >
      <FileIcon fileName={filename} autoAssign className='size-4' />
      <span className='text-sm truncate'>{filename}</span>
    </TreeContextMenuWrapper>
    }
    if(item.type === "folder") {
      const folderName = item.name 

      const folderRender = (
        <>
          <div className='flex items-center gap-0.5'>
            <ChevronRightIcon 
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                isOpen && "rotate-90"
              )}
            />
            <FolderIcon folderName={folderName} className='size-4' />
            <span className='text-sm truncate'>{folderName}</span>
          </div>
        </>
      ) 

      const startCreating = (type: "file" | "folder") => {
        setIsOpen(true)
        setIsCreating(type)
      }

      if(creating) {
        const handleCreate = (name: string) => { 
          setIsCreating(null);

          if (creating === "file") {
            createFile({
              parentId: item._id,
              projectId: projectId,
              name: name, 
              content: ""
            })
          }

          if (creating === "folder") {
            createFolder({
              parentId: item._id,
              projectId: projectId,
              name: name 
            })
          }
        }
        return(
          <>
            <button
             className='w-full h-5.5 flex` items-center gap-1 bg-accent/30 group'
            >
              {folderRender}
            </button>
            {isOpen && (
            <>
            {(folderContents === undefined) && <LoadingRow level={level+1} />}
            <CreateInput
             type={creating}
             level={level+1}
             onSubmit={handleCreate}
             onCancel={() => setIsCreating(null)}
            />
            {folderContents?.map(subitem => (
              <Tree
               key={subitem._id}
               item={subitem}
               level={level+1}
               projectId={projectId}
              />
            ))}
            </>
          )}
          </>
        )
      }

      return(
        <>
          <TreeContextMenuWrapper
           item={item} level={level} isActive={false} onClick={() => {setIsOpen(s => !s)}} onDoubleClick={() => {}} 
          onRename={ () => setIsRenaming(true)}
          onDelete={() => {
            deleteFile({ 
            id: item._id
           })
          }}
          onCreateFile={() => startCreating("file")}
          onCreateFolder={() => startCreating("folder")}
          >
            {folderRender}
          </TreeContextMenuWrapper>
          {isOpen && (
            <>
            {(folderContents === undefined) && <LoadingRow level={level+1} />}
            {folderContents?.map(subitem => (
              <Tree
               key={subitem._id}
               item={subitem}
               level={level+1}
               projectId={projectId}
              />
            ))}
            </>
          )}
        </>
      )
    }
}

export default Tree