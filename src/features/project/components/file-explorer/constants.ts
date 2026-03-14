const BASE_PADDING = 12
const LEVEL_PADDING = 12

export const getItemPadding = (level: number, isFile: boolean) => {
    const fileOffset = 16 * Number(isFile);
    return BASE_PADDING + level * LEVEL_PADDING + fileOffset; 
}