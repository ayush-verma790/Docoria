// Simple global store to pass files between routes
// This works because Next.js client-side navigation preserves module state.

type FileStore = {
    file: File | null;
    sourceTool: string | null;
}

let store: FileStore = {
    file: null,
    sourceTool: null
};

export const setGlobalFile = (file: File, sourceTool: string = "upload") => {
    store = { file, sourceTool };
};

export const getGlobalFile = () => {
    const temp = store;
    // Optional: Clear after read to prevent stale state? 
    // Let's keep it for now so back button works or user can try multiple tools on same file.
    return temp;
};

export const clearGlobalFile = () => {
    store = { file: null, sourceTool: null };
};
