import React, { useEffect, useMemo, useRef } from 'react'

import { EditorView, keymap } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { customTheme } from '../extensions/theme'
import { getLanguageExtension } from '../extensions/language-extension'
import { indentWithTab } from "@codemirror/commands"
import { minimap } from '../extensions/minimap'
import { Extension } from "@codemirror/state"
import { indentationMarkers } from "@replit/codemirror-indentation-markers"
import { customSetup } from '../extensions/custom-setup'
import { suggestions } from '../extensions/suggestions'

interface CodeEditorProps {
    fileName: string,
    onChange: (value: string) => void, 
    initialValue: string 
}

const CodeEditor = ({ fileName, initialValue, onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  const languageExtension = useMemo(() => getLanguageExtension(fileName), [fileName])

  useEffect(() => {
    const view = new EditorView({
        doc: initialValue,
        parent: editorRef.current!,
        extensions: [
            customSetup,
            languageExtension,
            suggestions(fileName),
            keymap.of([indentWithTab]),
            oneDark,
            customTheme,
            minimap(),
            indentationMarkers(),
            EditorView.updateListener.of((update) => {
                if(update.docChanged){
                    onChange(update.state.doc.toString())
                }
            }),
            
        ]
    })

    viewRef.current = view;

    return () => {
        view.destroy()
    }
  }, [languageExtension])
  return (
    <div ref={editorRef} className='size-full pl-4 bg-background'>

    </div>
  )
}

export default CodeEditor