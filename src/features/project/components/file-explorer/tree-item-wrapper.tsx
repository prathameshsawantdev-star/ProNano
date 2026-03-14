import React, { ReactNode } from 'react'

import {
    ContextMenu,
    ContextMenuItem,
    ContextMenuContent,
    ContextMenuTrigger,
    ContextMenuShortcut,
    ContextMenuSeparator
} from "@/components/ui/context-menu"
import { Doc } from '../../../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { getItemPadding } from './constants'

interface TreeItemWrapperProps {
    item: Doc<"files">,
    children: ReactNode,
    level: number, 
    isActive: boolean,
    onClick?: () => void,
    onDoubleClick?: () => void,
    onCreateFile?: () => void,
    onCreateFolder?: () => void,
    onDelete?: () => void, 
    onRename?: () => void 
}

const TreeItemWrapper = ({
    item,
    children,
    level,
    isActive,
    onClick,
    onDoubleClick,
    onCreateFile,
    onCreateFolder,
    onDelete,
    onRename
}: TreeItemWrapperProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button 
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if(e.key === "Enter"){
              e.preventDefault()
              onRename?.()
            }
          }}
          className={
            cn(
              "w-full h-5.5 flex items-center gap-1 outline-none focus:ring-1 focus:ring-inset focus:ring-ring bg-transparent hover:bg-accent/30",
              isActive && "bg-accent/30"
            )
          }
          style={{ paddingLeft: getItemPadding(level, item.type === "file")}}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
       onCloseAutoFocus={(e) => e.preventDefault()}
       className='w-64'
      >
        {item.type === "folder" && (
          <>
            <ContextMenuItem
              onClick={onCreateFile}
              className='text-sm'
            >
              New File 
            </ContextMenuItem>
             <ContextMenuItem
              onClick={onCreateFolder}
              className='text-sm'
            >
              New Folder  
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
         <ContextMenuItem
              onClick={onRename}
              className='text-sm'
            >
              Rename... 
              <ContextMenuShortcut>
                Enter
              </ContextMenuShortcut>
            </ContextMenuItem>
             <ContextMenuItem
              onClick={onDelete}
              className='text-sm'
            >
              Delete Permanantly 
              <ContextMenuShortcut>
                Enter
              </ContextMenuShortcut>
            </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default TreeItemWrapper