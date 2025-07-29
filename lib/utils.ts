/**
 * @file A collection of shared utility functions used across the application.
 */

/**
 * Takes a file URL (which can be a standard URL or a data URL), fetches its content as a blob,
 * and opens it in a new browser tab.
 * @param fileUrl The URL of the file to open.
 */
export const openFileInNewTab = async (fileUrl: string): Promise<void> => {
    if (!fileUrl || fileUrl === '#') return;
    
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        // The browser will handle revoking the object URL when the new tab is closed.
    } catch (error) {
        console.error("Error opening file:", error);
        // In a real application, you might want to show a toast notification to the user.
    }
};
