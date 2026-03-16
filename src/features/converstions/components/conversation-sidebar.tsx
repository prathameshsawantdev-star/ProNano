import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import {
    CopyIcon,
    HistoryIcon,
    Loader2Icon,
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


interface ConversationSidebarProps {
    projectId: Id<"projects">
}

const ConversationSidebar = ({ projectId }:ConversationSidebarProps) => {

  return (
    <div className='flex flex-col h-full bg-sidebar'>
        <div className='h-8.5 flex items-center justify-between border-b'>
            <div className='text-sm truncate pl-3'>
                {DEFAULT_CONVERSATION_TITLE}
            </div>
            <div className='flex items-center px-1 gap-1'>
                <Button
                    size="icon-xs"
                    variant="highlight"
                >
                    <HistoryIcon className='size-3.5' />
                </Button>
                <Button
                    size="icon-xs"
                    variant="highlight"
                >
                    <PlusIcon className='size-3.5' />
                </Button>
            </div>
        </div>

        <Conversation className='flex-1'>
            <ConversationContent>
                <p>messages</p>
            </ConversationContent>
            <ConversationScrollButton />
        </Conversation>

        <div className='p-3'>
            <PromptInput
                 onSubmit={() => {}}
                className='mt-2!'
            >
                <PromptInputBody>
                    <PromptInputTextarea
                        placeholder='Help me Pronano with this issue...'
                        onChange={() => {}}
                        value=""
                        disabled={false}
                    />
                </PromptInputBody>
                <PromptInputFooter>
                    <PromptInputTools />
                    <PromptInputSubmit 
                     disabled={false}
                     status="ready"
                    />
                </PromptInputFooter>
            </PromptInput>
        </div>
    </div>
  )
}

export default ConversationSidebar