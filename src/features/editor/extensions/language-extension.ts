import { Extension } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { markdown } from "@codemirror/lang-markdown"
import { mdxCompile } from "next/dist/build/swc/generated-native"

export const getLanguageExtension = (fileName: string):Extension => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    switch(ext){
        case "js":
            return javascript()
            break;
        case "jsx":
            return javascript({ jsx: true })
            break;
        case "ts":
            return javascript({ typescript: true })
            break;
        case "tsx":
            return javascript({ typescript: true, jsx: true })
            break;
        case "md":
         case"mdx":
            return markdown()
            break;
        case "py":
            return python()
            break;
        case "html":
            return html()
            break;
        case "css":
            return css()
            break;
        default: 
            return []
    }
}