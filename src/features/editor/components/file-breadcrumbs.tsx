import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { useEditor } from '../hooks/use-editor'
import { useFilePath } from '@/features/project/hooks/use-files'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Item } from '@/components/ui/item'
import { FileIcon } from '@react-symbols/icons/utils'

const FileBreadcrumbs = ({
    projectId
}:{
    projectId: Id<"projects">
}) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  if(filePath === undefined || !activeTabId){
    return(
        <div className='bg-background border-b p-2 pl-4'>
            <Breadcrumb>
                <BreadcrumbList className='sm:gap-0.5 gap-0.5'>
                    <BreadcrumbItem className='text-sm'>
                        <BreadcrumbPage>
                            &nbsp;
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
  }

  return(
    <div className='bg-background border-b p-2 pl-4'>
        <Breadcrumb>
            <BreadcrumbList className='p-0.5 sm:gap-0.5 gap-0.5 flex items-center'>
                {filePath?.map((item, index) => {
                    const isLast = index === filePath.length - 1
                    const fileName = item.name
                    return (
                    <React.Fragment
                     key={index}
                    >
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage className='flex items-center gap-1'>
                                    <FileIcon 
                                        fileName={fileName}
                                        autoAssign
                                        className='size-4'
                                     />
                                     {item.name}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href="#">
                                    {item.name}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    </div>
  )
}

export default FileBreadcrumbs