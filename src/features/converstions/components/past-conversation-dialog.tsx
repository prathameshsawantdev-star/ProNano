import { Dialog } from "@/components/ui/dialog";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConversations } from "../hooks/use-conversation";
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from "@/components/ui/command";
import { Conversation } from "@/components/ai-elements/conversation";
import { formatDistanceToNow } from "date-fns";

interface PastConversationDialogProps {
    projectId: Id<"projects">,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onSelect?: (conversationId: Id<"conversations">) => void 
}

const PastConversationDialog = ({
    projectId,
    open,
    onOpenChange,
    onSelect
}: PastConversationDialogProps) => {
  const conversations = useConversations(projectId);

  const handleSelect = (conversationId: Id<"conversations">) => {
    onSelect?.(conversationId)
    onOpenChange(false)
  }

  return (
    <CommandDialog
     open={open}
     onOpenChange={onOpenChange}
     title="Past conversations"
     description="Search and Select Past conversations"
    >
        <CommandInput placeholder="Search conversation" />
        <CommandList>
            <CommandEmpty>No Conversation Found</CommandEmpty>
            <CommandGroup heading="Conversations" className="py-4 px-1.5">
                {conversations?.map((convo, index) => {
                    return( 
                        <CommandItem 
                            key={convo._id}
                            value={`${convo.title}-${convo._id}`}
                            onSelect={() => handleSelect(convo._id)}
                            className="px-2"
                            >
                                <div className="flex flex-col gap-0.5 px-2">
                                    <span>{convo.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(convo._creationTime, {
                                            addSuffix: true
                                        })}
                                    </span>
                                </div>
                        </CommandItem>
                    )
                })}
            </CommandGroup>
        </CommandList>
    </CommandDialog>
  )
}

export default PastConversationDialog