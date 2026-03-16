import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import {
    CopyIcon,
    HistoryIcon,
    Loader2Icon,
    LoaderIcon,
    PlusIcon
} from "lucide-react"
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton
} from "@/components/ai-elements/conversation"
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageActions,
    MessageAction
} from "@/components/ai-elements/message"
import {
    PromptInput,
    PromptInputBody,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
    type PromptInputMessage
} from "@/components/ai-elements/prompt-input"

import {
    useConversation,
    useConversations,
    useCreateConversation,
    useMessages
} from "../hooks/use-conversation"
import { DEFAULT_CONVERSATION_TITLE } from '../../../../convex/constants'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import ky from 'ky'
import PastConversationDialog from './past-conversation-dialog'


interface ConversationSidebarProps {
    projectId: Id<"projects">
}

const ConversationSidebar = ({ projectId }:ConversationSidebarProps) => {
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const createConversation = useCreateConversation(projectId)
  const allConversation = useConversations(projectId);
  const activeConversationId = conversationId ?? allConversation?.[0]?._id ?? null;
  const activeConversation = useConversation(activeConversationId) 
  const conversationMessages = useMessages(activeConversationId);

  const [input, setInput] = useState("")
  const [pastDialogOpen, setPastDialogOpen] = useState(false)

  const isProcessing = conversationMessages?.some((msg) => msg.status === "processing")
  const handleCreateConversation = async() => {
    try{
        const newConversation = await createConversation({ 
            projectId,
            title: DEFAULT_CONVERSATION_TITLE
        })
        setConversationId(newConversation)
        return newConversation
    }catch{
        toast.error("Unable to create new conversation")
        return null;
    }
  }

  const handleCancel = async () => {
    try{
        await ky.post("/api/message/cancel", {
            json: {
                projectId
            }
        })
    }catch{
        toast("Unable to cancel AI request")
    }
  }

  const handleSubmit = async(message: PromptInputMessage) => {
    console.log(message);
   if(isProcessing && !message.text){
    await handleCancel()
    setInput("")
    return 
   }

   let conversationId = activeConversationId;
   if(!conversationId){
     conversationId = await handleCreateConversation()
     if(!conversationId) return;
   }

   // trigger inngest function via API
   try{
    await ky.post("/api/message", {
        json: {
            conversationId,
            message: message.text 
        }
    })
    setInput("")
   }catch{
    toast.error("Message failed to sent!")
   }
  }
  return (
    <>
    <PastConversationDialog 
     open={pastDialogOpen}
     onOpenChange={setPastDialogOpen}
     onSelect={setConversationId}
     projectId={projectId}
    />
    <div className='flex flex-col h-full bg-sidebar'>
        <div className='h-8.5 flex items-center justify-between border-b'>
            <div className='text-sm truncate pl-3'>
                {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </div>
            <div className='flex items-center px-1 gap-1'>
                <Button
                    size="icon-xs"
                    variant="highlight"
                    onClick={() => setPastDialogOpen(true)}
                >
                    <HistoryIcon className='size-3.5' />
                </Button>
                <Button
                    size="icon-xs"
                    variant="highlight"
                    onClick={handleCreateConversation}
                >
                    <PlusIcon className='size-3.5'  />
                </Button>
            </div>
        </div>

        <Conversation className='flex-1'>
            <ConversationContent>
                {conversationMessages?.map((message, index) => {
                    return(
                        <Message
                         key={message._id}
                         from={message.role}
                        >
                            <MessageContent>
                                {message.status === "processing" ? (
                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                        <LoaderIcon className='size-4 animate-spin' />
                                        <span className=''>Thinking...</span>
                                    </div>
                                ) : message.status === "cancelled" ?  (
                                    <span className='text-muted-foreground italic'>Request cancelled</span>
                                ) : (
                                    <MessageResponse>{message.content}</MessageResponse>
                                )}
                            </MessageContent>
                            {/* Add action to last AI message */}
                            {message.status === "completed" && message.role === "assistant" && index === (conversationMessages.length ?? 0) - 1 && (
                                <MessageActions>
                                    <MessageAction
                                     onClick={() => {
                                        navigator.clipboard.writeText(message.content)
                                     }}
                                     label="copy"
                                    >
                                        <CopyIcon className='size-3' />
                                    </MessageAction>
                                </MessageActions>
                            )}
                        </Message>
                    )
                })}
            </ConversationContent>
            <ConversationScrollButton />
        </Conversation>

        <div className='p-3'>
            <PromptInput
                onSubmit={handleSubmit}
                className='mt-2!'
            >
                <PromptInputBody>
                    <PromptInputTextarea
                        placeholder='Help me Pronano with this issue...'
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        disabled={false}
                    />
                </PromptInputBody>
                <PromptInputFooter>
                    <PromptInputTools />
                    <PromptInputSubmit 
                     disabled={isProcessing ? false : !input}
                     status={isProcessing ? "streaming" : undefined}
                    />
                </PromptInputFooter>
            </PromptInput>
        </div>
    </div>
    </>
  )
}

export default ConversationSidebar