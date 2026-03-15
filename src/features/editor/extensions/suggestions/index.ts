
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
    keymap    
 } from "@codemirror/view"
import { Extension, StateEffect, StateField } from "@codemirror/state"

// it is like reducer action
const setSuggestionEffect = StateEffect.define<string | null>();

// it holds the current suggestion state
const suggestionState = StateField.define<string | null>({
    create(){
        return "TODO: implement the initial state of suggsetion"
    },
    update(value, transaction){
        for(const effect of transaction.effects){
            if(effect.is(setSuggestionEffect)){
                return effect.value
            }
        }
        return value 
    }
})

const renderPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet

        constructor(view: EditorView){
            this.decorations = this.build(view)
        }

        update(update: ViewUpdate){
            const suggestionChanged = update.transactions.some((transaction) => {
                transaction.effects.some((effect) => effect.is(setSuggestionEffect))
            })

            const rebuild = update.docChanged || update.selectionSet || suggestionChanged
            if(rebuild){
                this.decorations = this.build(update.view)
            }
        }

        build(view: EditorView){
            const suggestion = view.state.field(suggestionState)
            if(!suggestion){
                return Decoration.none 
            }

            const cursor = view.state.selection.main.head;
            return Decoration.set([
                Decoration.widget({
                    widget: new SuggestionWidget(suggestion),
                    side: 1 // render this after cursor
                }).range(cursor)
            ])
        }
    },

    { decorations: (plugin) => plugin.decorations} // tell codemirror to use our decorations
)

class SuggestionWidget extends WidgetType {
    constructor(readonly text: string){
        super()
    }

    toDOM(){
        const span = document.createElement("span")
        span.textContent = this.text
        span.style.opacity = "0.4"
        span.style.pointerEvents = "none"
        return span  
    }
}

const acceptSuggestionKeymap = keymap.of([
    {
        key: "Tab",
        run: (view) => {
            const suggestion = view.state.field(suggestionState);
            if(!suggestion) return false; // normal tab behaviour ( indentation )

            const cursor = view.state.selection.main.head;
            view.dispatch({
                changes: { from: cursor, insert: suggestion },
                selection: { anchor: cursor + suggestion.length },
                effects: setSuggestionEffect.of(null)
            })
            return true; // the tab is used for suggestion inserting 
        }
    }
])

export const suggestions = (fileName: string):Extension => [
    suggestionState, // the suggestion state storage 
    renderPlugin, // render the suggestion in ghost text form 
    acceptSuggestionKeymap, // accept the suggestion text as code with "TAB"
]