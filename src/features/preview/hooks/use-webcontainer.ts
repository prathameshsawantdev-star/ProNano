import { WebContainer } from "@webcontainer/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useFiles } from "@/features/project/hooks/use-files";
import { fileSystemTree, getFilePath } from "../utils/file-tree";

let webContainerInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null 

const getWebContainer = async():Promise<WebContainer> => {
    if(webContainerInstance){
        return webContainerInstance
    }

    if(!bootPromise){
        bootPromise = WebContainer.boot({ coep: "credentialless" })
    }

    webContainerInstance = await bootPromise

    return webContainerInstance
}

const teardownWebContainer = () => {
    if(webContainerInstance){
        webContainerInstance.teardown()
        webContainerInstance = null 
    }

    bootPromise = null 
}

interface UseWebContainerProps {
    projectId: Id<"projects">,
    enabled: boolean,
    settings?: {
        installCommand?: string,
        devCommand?: string 
    }
}

export const useWebContainer({ projectId, enabled, settings}:UseWebContainerProps) => {
    const [status, setStatus] = useState<"idle" | "booting" | "installing" | "running" | "error">("idle");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [restartKey, setRestartKey] = useState<number>(0)
    const [terminalOutput, setTerminalOutput] = useState("");

    const containerRef = useRef<WebContainer | null>(null)
    const hasStartedRef = useRef(false);

    const files = useFiles(projectId)

    // initial boot and mount
    useEffect(() => {
        // to check if the boot is already done while file exists and terminal is enabled 
        if(!files || files.length === 0 || hasStartedRef.current || !enabled){
            return 
        }

        hasStartedRef.current = true 

        // boot process: start
        const start = async () => {
            try{
                setStatus("booting")
                setError(null)
                setTerminalOutput("")

                const appendOutput = (data: string) => {
                    setTerminalOutput(prev => prev + data) 
                }

                // create container using hook, and set ref 
                const container = await getWebContainer()
                containerRef.current = container 

                // get file tree and mount 
                const fileTree = fileSystemTree(files);
                await container.mount(fileTree)
                
                container.on("server-ready", (_port, url) => {
                    setPreviewUrl(url)
                    setStatus("running")
                })

                setStatus("installing")

                const installCmd = settings?.installCommand ?? "npm install"
                
                // separate the program/command name(bin) from args
                const [installBin, ...installArgs] = installCmd.split(" ");
                appendOutput(` ${installCmd}`)

                // create process
                const installProcess = await container.spawn(installBin, installArgs);
                // append the output of the install process
                installProcess.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            appendOutput(data)
                        }
                    })
                )

                const installExitCode = await installProcess.exit
                if(installExitCode !== 0){
                    throw new Error(`Error running install command, ${installCmd} failed with code ${installExitCode}`)
                }

                const devCommand = settings?.devCommand ?? "npm run dev";
                const [devBin, ...devArgs] = devCommand.split(" ")
                const devProcess = await container.spawn(devBin, devArgs);
                devProcess.output.pipeTo(
                    new WritableStream({
                        write(data){
                            appendOutput(data)
                        }
                    })
                )
                const devProcessCode = await devProcess.exit;
                if(devProcessCode !== 0){
                    throw new Error(`Error running dev command, ${devCommand} failed with code ${devProcessCode}`)
                }
            } catch(error) {
                setError(`${error instanceof Error ? error.message : "Unknown error"}`)
                setStatus("error")
            }
        }

        start()
    },[enabled, files, restartKey, settings?.installCommand,settings?.devCommand])

    // sync file changes aka hot-reload
    useEffect(() => {
        const container = containerRef.current;

        if(!container || !files || status !== "running") return;

        const fileMap = new Map(files.map(f => [f._id, f]));

        // update the file contents in the tree
        for(const file of files){
            if(file.type !== "file" || file.storageId || !file.content){
                return 
            }

            const filePath = getFilePath(file, fileMap)
            container.fs.writeFile(filePath, file.content)
        }
    },[files, status])

    // reset on disable event 
    useEffect(() => {
        if(!enabled){
           hasStartedRef.current = false;
           setError(null)
           setPreviewUrl(null)
           setStatus("idle") 
        }
    },[enabled])

    const restart = useCallback(() => {
        teardownWebContainer(),
        containerRef.current = null 
        hasStartedRef.current = false
        setError(null)
        setPreviewUrl(null)
        setStatus("idle") 

        setRestartKey(key => key + 1)

    },[])

    return {
       status,
       error, 
       previewUrl,
       restart,
       terminalOutput, 
    }

}   