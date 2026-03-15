
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    keymap,    
    showTooltip
 } from "@codemirror/view"
import { EditorState, Extension, StateEffect, StateField, Transaction } from "@codemirror/state"
import { fetcher} from "./fetcher";
import { nullable } from "zod";
import { Tooltip } from "@codemirror/view";
import { effect } from "zod/v3";

// it is like reducer action
export const showQuickEditEffect = StateEffect.define<boolean>();

let editorView:EditorView | null = null
let abortController : AbortController | null = null  

export const quickEditState = StateField.define<boolean>({
    create(){
        return false;
    },

    update(value, transaction){
        for(const effect of transaction.effects){
            if(effect.is(showQuickEditEffect)){
                return effect.value 
            }
        }

        if(transaction.selection){
            const selection = transaction.state.selection.main;
            if(selection.empty) {
                return false 
            }
        }

        return value 
    },


})

const createQuickEditTooltip = (state: EditorState):readonly Tooltip[] => {
    const selection = state.selection.main;

    if(selection.empty) return []

    const isQuickEditActive = state.field(quickEditState);
    if(!isQuickEditActive) return [];

    return([
        {
            pos: selection.to,
            above: false,
            strictSide: false, 
            create(editorView: EditorView){
                const dom = document.createElement("div");
                dom.className = "p-2 flex flex-col gap-2 text-sm text-popover-foreground bg-popover z-50 border rounded-sm border-input"

                const form = document.createElement("form")
                    form.className = "flex flex-col gap-2"

                const input = document.createElement("input")
                    input.type = "text"
                    input.placeholder = "Edit selected text"
                    input.className = "w-100 px-2 py-1 font-sans bg-transparent border-none"
                    input.autofocus = true 
                
                const buttonContainer = document.createElement("div")
                    buttonContainer.className = "flex items-center justify-between gap-2"

                const cancelButton = document.createElement("button")
                    cancelButton.type = "button"
                    cancelButton.textContent = "Cancel"
                    cancelButton.className = "p-1 px-2 font-sans text-muted-foreground hover:text-foreground hover:bg-background/10 rounded-sm"
                    cancelButton.onclick = () => {
                        if(abortController){
                            abortController.abort()
                            abortController = null 
                        }

                        if(editorView){
                            editorView.dispatch({
                                effects: showQuickEditEffect.of(false)
                            })
                        }
                    }
                
                const SubmitButton = document.createElement("button")
                    SubmitButton.type = "submit"
                    SubmitButton.textContent = "Submit"
                    SubmitButton.className = "p-1 px-2 font-sans text-muted-foreground hover:text-foreground hover:bg-background/10 rounded-sm"

                form.onsubmit = async (e) => {
                    e.preventDefault()
                    if(!editorView) return 

                    const instruction = input.value.trim()
                    if(!instruction) return;

                    const selection = editorView.state.selection.main
                    const selectedCode = editorView.state.doc.sliceString(selection.from, selection.to);
                    const fullCode = editorView.state.doc.toString();

                    SubmitButton.disabled = true;
                    SubmitButton.textContent = "Editing...";

                    abortController = new AbortController();
                    const editedCode = await fetcher({
                        instruction,
                        fullCode,
                        selectedCode
                    }, abortController.signal)

                    if(editedCode){
                        editorView.dispatch({
                            changes: {
                                from: selection.from,
                                to: selection.to,
                                insert: editedCode
                            },
                            selection: { anchor: selection.from + editedCode.length },
                            effects: showQuickEditEffect.of(false)
                        })
                    } else {
                        SubmitButton.textContent = "Submit"
                        SubmitButton.disabled = false
                    }
                }

                buttonContainer.append(cancelButton)
                buttonContainer.append(SubmitButton)

                form.append(input)
                form.append(buttonContainer)
                
                dom.appendChild(form);

                setTimeout(() => {
                    input.focus()
                },0)

                return { dom }
            }
        }
    ])
}

const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
    create(state){
        return createQuickEditTooltip(state);
    },

    update(value, transaction){
        if(transaction.docChanged || transaction.selection){
            return createQuickEditTooltip(transaction.state)
        }

        for(const effect of transaction.effects){
            if(effect.is(showQuickEditEffect)){
                return createQuickEditTooltip(transaction.state) 
            }
        }

        return value; 
    },

    provide: (field) => showTooltip.computeN(
        [field],
        (state) => state.field(field)
    )
})

const quickEditTooltipKeymap = keymap.of([
    {
        key: "mod-k",
        run: (view) => {
            const selection = view.state.selection.main;
            if(selection.empty) return false;

            view.dispatch({
                effects: showQuickEditEffect.of(true)
            })

            return true;
        }
    }
])

const captureViewExtension = EditorView.updateListener.of((update) => {
    editorView = update.view 
})

export const quickEdit = (fileName: string):Extension => [
    quickEditState,
    quickEditTooltipField,
    quickEditTooltipKeymap,
    captureViewExtension
]