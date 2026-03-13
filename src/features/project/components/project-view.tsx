"use client"

import Image from "next/image";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SparkleIcon } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { FaGithub } from "react-icons/fa";
import ProjectList from "./projectlist-view";
import { uniqueNamesGenerator, adjectives, animals, colors } from "unique-names-generator";
import { useProjectsCreate } from "../hooks/use-project";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
})

const ProjectView = () => {
    const createProject = useProjectsCreate();
    return(
        <div className="min-h-screen bg-sidebar flex flex-col justify-center items-center p-6 md:p-16">
            <div className="max-w-sm w-full mx-auto flex flex-col gap-4">
                <div className="w-full flex gap-4 items-center">
                    <div className="w-full flex items-center gap-4 group/logo">
                        <img src="/vercel.svg" className="size-[32px] md:size-[42px]" alt="Polaris" />
                        <h2 className={cn("text-4xl md:text-5xl font-semibold text-white", font.className)}>Polaris</h2>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2 ">
                        <Button
                        onClick={() => {
                            const projectName = uniqueNamesGenerator({
                                dictionaries: [adjectives, colors, animals],
                                separator: '-',
                                length: 3,
                            })
                            
                            createProject({ name: projectName })
                        }}
                        variant="outline" className="h-full text-white w-full p-4 flex flex-col justify-start items-start gap-6 bg-background rounded-none">
                            <div className="flex items-center justify-between w-full">
                                <SparkleIcon className="size-4" />
                                <Kbd className="bg-accent border">
                                    ctrl + J
                                </Kbd>
                            </div>
                            <div>
                                <span className="text-sm">
                                    New 
                                </span>
                            </div>
                        </Button>
                         <Button variant="outline" className="h-full w-full text-white p-4 flex flex-col justify-start items-start gap-6 bg-background rounded-none">
                            <div className="flex items-center justify-between w-full text-white">
                                <FaGithub className="size-4" />
                                <Kbd className="bg-accent border">
                                    ctrl + I
                                </Kbd>
                            </div>
                            <div>
                                <span className="text-sm">
                                    Import 
                                </span>
                            </div>
                        </Button>
                    </div>
                    <div className="">
                        <ProjectList onViewAllProjects={() => {}} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectView;