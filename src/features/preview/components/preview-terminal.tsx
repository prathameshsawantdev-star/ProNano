import "@xterm/xterm/css/xterm.css"
import { useEffect, useRef } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"

interface PreviewTerminalProps {
    output: string 
}

export const PreviewTerminal = ({ output }:PreviewTerminalProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<Terminal>(null)
    const addFitRef = useRef<FitAddon>(null)
    const lastLengthRef = useRef(0)

    useEffect(() => {
        if(!containerRef.current || !terminalRef.current) return;

        const terminal = new Terminal({
            convertEol: true,
            disableStdin: true,
            fontSize: 12,
            fontFamily: "monospace",
            theme: { background: "#1f2228"}
        })

        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)

        terminalRef.current = terminal
        addFitRef.current = fitAddon

        if(output){
            terminal.write(output);
            lastLengthRef.current = output.length;
        }

        // fitting functionality 
        requestAnimationFrame(() => fitAddon.fit())
        
        const resizableObserver = new ResizeObserver(() => fitAddon.fit())
        resizableObserver.observe(containerRef.current)


        // unmount function\
        return () => {
            resizableObserver.disconnect()
            terminal.dispose()
            terminalRef.current = null 
            addFitRef.current = null 
        }
    },[])

    useEffect(() => {
        if(!terminalRef.current) return;

        if(output?.length < lastLengthRef.current){
            terminalRef.current.clear()
            lastLengthRef.current = 0
        }

        const newData = output.slice(lastLengthRef.current)
        if(newData){
            terminalRef.current.write(newData);
            lastLengthRef.current = output.length
        }

    },[output])

    return(
        <div ref={containerRef}
         className="min-h-0 p-3 flex-1 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full! bg-sidebar"
        />
    )
}