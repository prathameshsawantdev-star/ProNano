import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { getItemPadding } from "./constants"

const CreateInput = ({
    type, level, onSubmit, onCancel
}:{
    type: "file" | "folder" | null,
    level: number, 
    onSubmit: (name: string) => void,
    onCancel: () => void 
}) => {
    const [value, setValue] = useState<string>("");

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
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
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
            />
        </div>
    )
}

export default CreateInput