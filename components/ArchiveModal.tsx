
/**
 * @file A modal component for archiving new manuscripts.
 * It allows users to either paste text or upload a TXT/PDF file.
 * The component handles file processing, state management for loading/errors,
 * and calls the AI analysis function upon submission.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { XIcon, UploadIcon, SpinnerIcon } from '@/components/Icons';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker. This is required for the library to process PDFs.
// The URL points to the worker file provided by the esm.sh CDN.
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs";


interface ArchiveModalProps {
  onClose: () => void;
  onArchive: (payload: { textContent: string, fileDataUrl?: string }) => Promise<void>;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300, duration: 0.3 } 
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  },
};

type ActiveTab = 'paste' | 'upload';

const ArchiveModal: React.FC<ArchiveModalProps> = ({ onClose, onArchive }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('paste');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  
  // State for UI feedback during async operations
  const [isProcessingFile, setIsProcessingFile] = useState(false); // For parsing the file content
  const [isLoading, setIsLoading] = useState(false); // For the AI API call
  const [isDragging, setIsDragging] = useState(false); // For drag-and-drop UI
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for keyboard accessibility (Escape key) and initial focus
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    modalRef.current?.focus(); // Focus modal on open
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  /**
   * Processes an uploaded file (PDF or TXT) and extracts its text content and data URL.
   */
  const processFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    setIsProcessingFile(true);
    setError(null);
    setFileContent('');
    setFileDataUrl(null); // Reset on new file
    
    try {
        // Read the file as a Data URL for storage purposes, regardless of type.
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file as Data URL.'));
            reader.readAsDataURL(selectedFile);
        });
        setFileDataUrl(dataUrl);

        // Now, extract text content for AI analysis.
        if (selectedFile.type === 'application/pdf') {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const paragraphBreakThreshold = 1.5;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                if (!textContent.items.length) continue;

                const lines = new Map<number, any[]>();
                for (const item of textContent.items) {
                    if (!('str' in item) || !item.str.trim()) continue;
                    const y = Math.round(item.transform[5]);
                    if (!lines.has(y)) lines.set(y, []);
                    lines.get(y)!.push(item);
                }

                const sortedY = Array.from(lines.keys()).sort((a, b) => b - a);
                
                const pageLines: string[] = [];
                let lastY: number | null = null;
                let lastHeight: number = 12;

                for (const y of sortedY) {
                    const lineItems = lines.get(y)!;
                    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
                    
                    const currentHeight = lineItems.length > 0 ? lineItems[0].height : lastHeight;
                    
                    if (lastY !== null && (lastY - y > lastHeight * paragraphBreakThreshold)) {
                        pageLines.push('');
                    }

                    pageLines.push(lineItems.map(item => item.str).join(' '));
                    lastY = y;
                    lastHeight = currentHeight;
                }
                
                fullText += pageLines.join('\n') + '\n\n';
            }
            setFileContent(fullText.trim());
        } else if (selectedFile.type === 'text/plain') {
            const text = await selectedFile.text();
            setFileContent(text);
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
        }
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Error reading file.');
        console.error(e);
    } finally {
        setIsProcessingFile(false);
    }
  }, []);

  // Effect to process a file whenever it's set
  useEffect(() => {
    if (file) {
      processFile(file);
    }
  }, [file, processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        setFile(droppedFiles[0]);
    }
  }, []);

  // The final text content to be submitted for analysis
  const textToSubmit = useMemo(() => {
    return activeTab === 'paste' ? pastedText : fileContent;
  }, [activeTab, pastedText, fileContent]);

  /**
   * Submits the extracted text to the parent `onArchive` function.
   */
  const handleSubmit = async () => {
    if (!textToSubmit || isLoading || isProcessingFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
          textContent: textToSubmit,
          fileDataUrl: activeTab === 'upload' ? fileDataUrl : undefined,
      };
      await onArchive(payload);
      onClose(); // Close modal on success
    } catch (e) {
      // Log the detailed error for debugging purposes
      console.error("Archive submission failed:", e);
      // The `analyzeText` function now provides user-friendly errors.
      const message = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again later.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton: React.FC<{tab: ActiveTab, children: React.ReactNode}> = ({ tab, children }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`w-full py-3 font-serif tracking-wider text-sm transition-all duration-300 ${activeTab === tab ? 'bg-gold-900/50 text-gold-200' : 'text-stone-400 hover:bg-black/20'}`}
        role="tab"
        aria-selected={activeTab === tab}
    >
        {children}
    </button>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 outline-none"
      variants={backdropVariants} initial="hidden" animate="visible" exit="exit"
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="archive-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] bg-void border border-gold-800 rounded-lg shadow-2xl shadow-gold-900/20 flex flex-col"
        variants={modalVariants} onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gold-900/50">
            <h2 id="archive-title" className="font-serif text-2xl font-bold text-gold-200 tracking-wider">Archive a Manuscript</h2>
            <p className="text-stone-400 mt-1">Submit a text for the AI Scribe to analyze and catalog.</p>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            <div className="flex border border-gold-900 rounded-lg overflow-hidden" role="tablist">
                <TabButton tab="paste">Paste Text</TabButton>
                <TabButton tab="upload">Upload File</TabButton>
            </div>
            
            <div className="mt-6">
                {activeTab === 'paste' && (
                    <div role="tabpanel">
                        <textarea
                            placeholder="Paste the contents of your esoteric text here..."
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            className="w-full h-48 sm:h-64 p-4 bg-black/30 backdrop-blur-sm border border-gold-900 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-gold-600 focus:border-gold-600 transition-all duration-300 custom-scrollbar"
                            aria-label="Paste the contents of your esoteric text here..."
                        />
                    </div>
                )}
                {activeTab === 'upload' && (
                    <div role="tabpanel">
                        <label
                            htmlFor="file-upload"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/40 transition-all duration-300 ${isDragging ? 'border-gold-500 bg-gold-900/20' : 'border-gold-900'}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadIcon className="w-10 h-10 mb-3 text-gold-700" />
                                {file ? (
                                    <>
                                        <p className="font-bold text-gold-300">{file.name}</p>
                                        <p className="text-xs text-stone-400">{isProcessingFile ? 'Analyzing...' : 'Ready to archive'}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-2 text-sm text-stone-400"><span className="font-semibold text-gold-400">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-stone-500">PDF or TXT</p>
                                    </>
                                )}
                            </div>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
                        </label>
                    </div>
                )}
            </div>

            {error && <p className="mt-4 text-center text-red-400 bg-red-900/30 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="p-6 mt-auto border-t border-gold-900/50 bg-black/20 flex items-center justify-end gap-4">
             <button
                onClick={onClose} aria-label="Cancel"
                className="px-6 py-2 bg-transparent text-gold-300 rounded-md border border-gold-800 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-900/50 hover:border-gold-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
            >
                Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!textToSubmit || isLoading || isProcessingFile}
              className="flex items-center justify-center px-6 py-2 bg-gold-800 text-gold-100 rounded-md border border-gold-700 font-serif tracking-wider text-sm transition-all duration-300 ease-in-out hover:bg-gold-700 disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void focus:ring-gold-500"
            >
              {isLoading || isProcessingFile ? <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" /> : null}
              {isLoading ? 'Archiving...' : isProcessingFile ? 'Processing...' : 'Submit to Scribe'}
            </button>
        </div>
        <button
          onClick={onClose} aria-label="Close modal"
          className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ArchiveModal;