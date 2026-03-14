import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { getItemPadding } from "./constants"
import { cn } from "@/lib/utils"

const RenameInput = ({
    type, level, onSubmit, onCancel, defaultValue, isOpen
}:{
    type: "file" | "folder" | null,
    level: number, 
    defaultValue: string,
    isOpen: boolean,
    onSubmit: (name: string) => void,
    onCancel: () => void 
}) => {
    const [value, setValue] = useState<string>(defaultValue);

    const handleSubmit = () => {
        const name = value.trim()

        if(name){
            onSubmit(name)
        } else {
            onCancel()
        }
    }
    return(
        <div 
        className="w-full h-5.5 flex items-center gap-1 bg-accent/30"
        style={{
            paddingLeft: getItemPadding(level, type === "file")
        }}
        >
            <div className="flex items-center gap-0.5">
                {(type === "folder") && (
                    <ChevronRightIcon className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-90"
                    )} />
                )}
                {(type === "file") && (
                    <FileIcon fileName={value} autoAssign className="size-4" />
                )}
                {(type === "folder") && (
                    <FolderIcon folderName={value} className="size-4" />
                )}
            </div>
            <input 
            autoFocus
             type="text"
             value={value}
             onChange={(e) => setValue(e.target.value)}
             className="flex-1 text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring bg-transparent"
             onBlur={handleSubmit}
             onKeyDown={(e) => {
                if(e.key === "Enter") {
                    handleSubmit()
                } 
                if (e.key === "Escape") {
                    onCancel()
                }
             }}
             onFocus={(e) => {
                if (type === 'folder') {
                    e.currentTarget.select()
                } else {
                    const value = e.currentTarget.value;
                    const lastDotIndex = value.lastIndexOf("."); // get the index of . before extension
                    if (lastDotIndex > 0){
                        e.currentTarget.setSelectionRange(0, lastDotIndex)
                    } else {
                        e.currentTarget.select()
                    }
                }
             }}
            />
        </div>
    )
}

export default RenameInput 