
import { Tool } from "openai/resources/responses/responses.mjs";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    keymap,    
    showTooltip, 
    Tooltip
 } from "@codemirror/view"
 import { EditorState, StateField } from "@codemirror/state"
import { quickEditState, showQuickEditEffect } from "../quick-edit";

let editorView : EditorView | null = null;

const captureViewExtension = EditorView.updateListener.of((update) => {
    editorView = update.view 
})

const createTooltipForSelection = (state: EditorState):readonly Tooltip[]=> {
    const selection = state.selection.main 
    if(selection.empty) return []

    const isQuickEditActive = state.field(quickEditState)
    if(isQuickEditActive) return []

    return [
        {
            pos: selection.to,
            above: false,
            strictSide: false,
            create(view){
                const dom = document.createElement("div");
                    dom.className = "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex items-center gap-2 text-sm"

                const addToChatButton = document.createElement("button");
                    addToChatButton.textContent = "Add to Chat"
                    addToChatButton.className = "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm";

                const quickEditButton = document.createElement("button");
                    quickEditButton.className =
                        "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1";

                const quickEditButtonText = document.createElement("span");
                    quickEditButtonText.textContent = "Quick Edit";

                const quickEditButtonShortcut = document.createElement("span");
                quickEditButtonShortcut.textContent = "Ctrl+K";
                quickEditButtonShortcut.className = "text-sm opacity-60";

                quickEditButton.appendChild(quickEditButtonText);
                quickEditButton.appendChild(quickEditButtonShortcut);

                 quickEditButton.onclick = () => {
                    if (editorView) {
                        editorView.dispatch({
                        effects: showQuickEditEffect.of(true),
                        });
                    }
                };

                const div = document.createElement("div")
                div.className = "h-5 w-0 border-r border-r-white px-1"
                dom.appendChild(addToChatButton);
                dom.appendChild(div);
                dom.appendChild(quickEditButton);

                return { dom }
            }
        }
    ]
}

const createSelectionTooltipField = StateField.define<readonly Tooltip[]>({
    create(state){
        return createTooltipForSelection(state )
    },
    update(value, transaction){
        if(transaction.docChanged || transaction.selection) {
            return createTooltipForSelection(transaction.state)
        }

         for (const effect of transaction.effects) {
             if (effect.is(showQuickEditEffect)) {
                return createTooltipForSelection(transaction.state);
            }
         }

         return value; 
    },

    provide: (field) => showTooltip.computeN(
        [field],
        (state) => state.field(field)
    ),
})

export const selectionTooltip = () => [
    captureViewExtension,
    createSelectionTooltipField
]