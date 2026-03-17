import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { useProject } from '@/features/project/hooks/use-project'
import { useWebContainer } from '../hooks/use-webcontainer'
import { Button } from '@/components/ui/button'
import { AlertTriangleIcon, Loader2Icon, RefreshCwIcon, TerminalSquareIcon } from 'lucide-react'
import { PreviewPopover } from './preview-settings-popover'
import { Allotment } from 'allotment'
import { PreviewTerminal } from './preview-terminal'

const PreviewView = ({ projectId }: {projectId: Id<"projects">}) => {
  const project = useProject({ projectId })
  const [ showTerminal, setShowTerminal ] = useState(false);

  const { status, error, restart, terminalOutput, previewUrl } = useWebContainer({
    projectId,
    settings: project?.settings,
    enabled: showTerminal
  })

  const isLoading = status === "booting" || status === "installing"
  return (
    <div className='flex flex-col shrink-0 bg-background'>
        <div className='h-8.5 flex items-center border-b bg-sidebar shrink-0'>
            <Button
             variant="ghost"
             size="sm"
             className='h-full rounded-none'
             onClick={restart}
             disabled={isLoading}
             title="Restart Container"
            >
                <RefreshCwIcon className='size-3.5' />
            </Button>

            <div className='px-3 flex-1 h-full flex items-center text-xs text-muted-foreground font-mono truncate bg-background border-x'>
               {isLoading && (
                 <div className='flex items-center gap-3'>
                    <Loader2Icon className='size-3.5 animate-spin' />
                    {status === "booting" ? "Starting..." : "Running..."}
                </div>
               )}
               {previewUrl && <span className='truncate'>${previewUrl}</span>}
               {!isLoading && !error && !previewUrl && <span>Ready to preview</span>}
            </div>
            <Button
             variant="ghost"
             size="sm"
             className='h-full rounded-none'
             title="Toggle terminal"
             onClick={() => setShowTerminal((term) => !term)}
            >
               <TerminalSquareIcon className='size-3' />
            </Button>
            <PreviewPopover 
             projectId={projectId}
             initialValues={project?.settings}
             onSave={restart}
            />
        </div>

        <div className='flex-1 min-h-0'>
               <Allotment>
                 <Allotment.Pane>
                   {error && (
                    <div className='size-full flex items-center justify-center text-muted-foreground'>
                      <div className='max-w-md mx-auto flex flex-col items-center gap-2 text-center'>
                        <AlertTriangleIcon className='size-3 text-red-500/30' />
                        <span className='text-sm font-medium'>{error}</span>
                        <Button
                         variant="outline"
                         size="sm"
                         onClick={restart}
                        >
                          <RefreshCwIcon className='size-4' />
                          Restart
                        </Button>
                      </div>
                    </div>
                   )}

                   {isLoading && !error && (
                    <div className='size-full flex items-center justify-center text-muted-foreground'>
                      <div className='max-w-md mx-auto flex flex-col items-center gap-2 text-center'>
                        <Loader2Icon className='size-6 animate-spin' />
                        <p className='text-sm font-medium'>Installing...</p>
                      </div>
                    </div>
                   )}

                   {previewUrl && (
                    <iframe 
                     src={previewUrl}
                     className='border-o'
                     title="Preview"
                    />
                   )}
                 </Allotment.Pane>
               </Allotment>

               {/* Finalyy the terminal code  */}
               {showTerminal && (
                <Allotment.Pane minSize={200} maxSize={500} preferredSize={500}>
                  <div className='h-ful flex flex-col bg-background border-t'>
                    <div className='h-7 px-3 flex items-center gap-1.5 text-xs text-muted-foreground border-border/30 border-b shrink-0'>
                      <TerminalSquareIcon className='size-3' />
                      Terminal 
                    </div>
                    <PreviewTerminal output={terminalOutput} />
                  </div>
                </Allotment.Pane>
               )}
        </div>
    </div>
  )
}

export default PreviewView
