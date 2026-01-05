import { useState, useRef } from 'react';

export function useFileHandler() {
    const [attachments, setAttachments] = useState<File[]>([]);
    const [fileTexts, setFileTexts] = useState<Array<{ name: string; text: string }>>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [appFile, setAppFile] = useState<File | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const ALLOWED_TYPES = ['image/*', 'application/pdf', 'text/*'];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    const isValidFile = (file: File) => {
        // Simple regex check for types
        const isTypeValid = ALLOWED_TYPES.some(type => {
            if (type.endsWith('/*')) return file.type.startsWith(type.slice(0, -2));
            return file.type === type;
        }) || /\.(md|json|ts|tsx|js|csv|txt)$/i.test(file.name);

        return isTypeValid && file.size <= MAX_SIZE;
    };

    const processFile = async (file: File): Promise<{ name: string, text: string } | null> => {
        if (!isValidFile(file)) {
            console.warn(`File rejected: ${file.name} (Invalid type or size > 10MB)`);
            // Optionally trigger a toast or error state here
            return null; // Or return an error object to handle in UI
        }

        try {
            if (file.type.startsWith('image/')) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const MAX_DIM = 1024;
                        if (width > MAX_DIM || height > MAX_DIM) {
                            if (width > height) {
                                height = Math.round((height * MAX_DIM) / width);
                                width = MAX_DIM;
                            } else {
                                width = Math.round((width * MAX_DIM) / height);
                                height = MAX_DIM;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        resolve({ name: file.name, text: `[Imagen optimizada: ${width}x${height}]` });
                    };
                    img.src = URL.createObjectURL(file);
                });
            } else if (file.type === 'application/pdf') {
                try {
                    const pdfjsLib = (await import('pdfjs-dist')).default;
                    if (!pdfjsLib.GlobalWorkerOptions?.workerSrc) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    const parts: string[] = [];
                    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        parts.push(textContent.items.map((item: any) => item.str).join(' '));
                    }
                    return { name: file.name, text: parts.join('\n\n') };
                } catch (pdfError) {
                    console.error("PDF parse error:", pdfError);
                    return { name: file.name, text: '[PDF no procesable]' };
                }
            } else if (
                file.type.startsWith('text/') ||
                /\.(md|json|ts|tsx|js|csv|txt)$/i.test(file.name)
            ) {
                const text = await file.text();
                return { name: file.name, text };
            }
            return null;
        } catch (e) {
            console.error("Error processing file:", e);
            return null;
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setAttachments(prev => [...prev, ...files]);
            for (const file of files) {
                const result = await processFile(file);
                if (result) {
                    setFileTexts(prev => [...prev, result]);
                }
            }
            if (textareaRef.current) textareaRef.current.focus();
        }
    };

    const clearAttachments = () => {
        setAttachments([]);
        setFileTexts([]);
        setAppFile(null);
    };

    return {
        attachments, setAttachments,
        fileTexts, setFileTexts,
        isDragging, handleDragOver, handleDragLeave, handleDrop,
        appFile, setAppFile,
        clearAttachments,
        textareaRef,
        processFile
    };
}
