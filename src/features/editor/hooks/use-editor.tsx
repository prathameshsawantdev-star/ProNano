import { useCallback } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { lastDayOfQuarter } from "date-fns";
import { useEditorStore } from "../store/use-editor-store";

export const useEditor = (projectId: Id<"projects">) => {
    const store = useEditorStore();
    const tabState = useEditorStore((state) => state.getTabState(projectId));

    const openFile = useCallback((
        fileId: Id<"files">,
        options: { pinned: boolean }
    ) => {
        store.openFile(projectId, fileId, options)
    },[projectId, store])

    const closeFile = useCallback((
        fileId: Id<"files">
    ) => {
        store.closeTab(projectId, fileId)
    }, [projectId, store])
    
    const closeAllTabs = useCallback(() => {
        store.closeAllTabs(projectId)
    }, [projectId, store])

    const setActiveTab = useCallback((fileId: Id<"files">) => {
        store.setActiveTab(projectId, fileId)
    }, [projectId, store])

    return {
        openTabs: tabState.openTabs,
        activeTabId: tabState.activeTabId,
        previewTabId: tabState.previewTabId,
        openFile,
        closeFile,
        closeAllTabs,
        setActiveTab
    }
}