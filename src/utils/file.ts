export type FileCategory = 'document' | 'image' | 'audio' | 'video' | 'archive' | 'unknown';

export function detectFileCategory(file: File): FileCategory {
    const mime = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) return 'audio';
    if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) return 'video';

    // Documents
    const documentMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'text/markdown',
    ];
    const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'md'];
    if (documentMimes.includes(mime) || documentExts.includes(extension || '')) return 'document';

    // Archieves
    const archiveMimes = [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip'
    ];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
    if (archiveMimes.includes(mime) || archiveExts.includes(extension || '')) return 'archive';

    return 'unknown';
}

export function formatBytes(bytes: number, decimals: number = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const SUPPORTED_CONVERSIONS: Record<string, string[]> = {
    // Documents
    'pdf': ['PDF', 'TXT', 'DOCX'],
    'docx': ['PDF', 'TXT', 'MD'],
    'txt': ['PDF', 'MD', 'TXT'],
    'md': ['PDF', 'MD', 'TXT'],
    // Images
    'png': ['PNG', 'JPG', 'WEBP'],
    'jpg': ['PNG', 'JPG', 'WEBP'],
    'jpeg': ['PNG', 'JPG', 'WEBP'],
    'webp': ['PNG', 'JPG', 'WEBP'],
};

export function getAvailableFormats(file: File): string[] {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return SUPPORTED_CONVERSIONS[extension] || [];
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { convert as convertHtmlToText } from 'html-to-text';

// Set worker for pdfjs (using CDN for simplicity in Vite)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function convertDocumentLocally(file: File, targetFormat: string): Promise<Blob> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isText = file.type === 'text/plain' || extension === 'txt' || extension === 'md';
    const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx';
    const isPdf = file.type === 'application/pdf' || extension === 'pdf';

    // Simulate heavy local processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Case 1: Identity conversion
    if (targetFormat.toLowerCase() === extension || (targetFormat === 'JPG' && extension === 'jpeg')) {
        return file;
    }

    // Case 2: Image Conversion (PNG/JPG/WEBP)
    if (isImage && ['PNG', 'JPG', 'WEBP'].includes(targetFormat)) {
        return await convertImageLocally(file, targetFormat);
    }

    // Case 3: DOCX to PDF/TXT/MD (High Fidelity)
    if (isDocx) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            if (targetFormat === 'PDF') {
                return await createHighFidelityPdfFromHtml(html);
            }
            if (targetFormat === 'TXT' || targetFormat === 'MD') {
                const text = convertHtmlToText(html, {
                    wordwrap: 130,
                    selectors: [
                        { selector: 'a', options: { ignoreHref: true } },
                        { selector: 'img', format: 'skip' }
                    ]
                });
                return new Blob([text], { type: targetFormat === 'MD' ? 'text/markdown' : 'text/plain' });
            }
        } catch (err) {
            console.error("Mammoth error:", err);
            throw new Error("Erreur lors de la conversion du document Word");
        }
    }

    // Case 4: PDF to DOCX/TXT
    if (isPdf) {
        const text = await extractTextFromPdf(file);
        if (targetFormat === 'DOCX') {
            return await createDocxFromText(text);
        }
        if (targetFormat === 'TXT') {
            return new Blob([text], { type: 'text/plain' });
        }
    }

    // Case 5: Text to PDF (Standard)
    if (targetFormat === 'PDF' && isText) {
        const text = await file.text();
        return await createPdfFromText(text);
    }

    // Fallback description
    const fallbackText = `OmniDocs Conversion\n` +
        `------------------\n` +
        `Source: ${file.name}\n` +
        `Target: ${targetFormat}\n\n` +
        `Note: La conversion complexe de ${extension?.toUpperCase()} vers ${targetFormat} ` +
        `sera enrichie dans la version Pro.\n` +
        `V1.5 supporte : Image -> Image, TXT/DOCX/PDF -> PDF/DOCX/TXT/MD (Haute Fidélité).`;

    return new Blob([fallbackText], { type: 'text/plain' });
}

async function createHighFidelityPdfFromHtml(html: string): Promise<Blob> {
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.padding = '40px';
    element.style.fontFamily = 'Helvetica, Arial, sans-serif';
    element.style.fontSize = '12pt';
    element.style.color = '#1a1a1a';
    element.style.backgroundColor = 'white';

    // Add some basic styling to the extracted HTML to look like a real document
    const style = document.createElement('style');
    style.textContent = `
        p { margin-bottom: 1em; line-height: 1.5; }
        h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: bold; }
        ul, ol { margin-left: 2em; margin-bottom: 1em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        td, th { border: 1px solid #ccc; padding: 8px; }
    `;
    element.appendChild(style);

    const options = {
        margin: 10,
        filename: 'converted.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    return await html2pdf().from(element).set(options).outputPdf('blob');
}

async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group items by their Y coordinate (transform[5])
        const items = textContent.items as any[];
        const lines: { [key: number]: any[] } = {};

        items.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!lines[y]) lines[y] = [];
            lines[y].push(item);
        });

        // Sort Y coordinates descending (PDF coordinate system starts at bottom)
        const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);

        let pageText = "";
        let lastY = -1;

        sortedY.forEach(y => {
            // Sort items in the same line by X coordinate
            const lineItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
            const lineStr = lineItems.map(item => item.str).join(" ");

            // If the jump is significant, consider it a new paragraph
            if (lastY !== -1 && Math.abs(lastY - y) > 20) {
                pageText += "\n";
            }

            pageText += lineStr + "\n";
            lastY = y;
        });

        fullText += pageText + "\n\n";
    }

    return fullText;
}

async function createDocxFromText(text: string): Promise<Blob> {
    const doc = new Document({
        sections: [{
            properties: {},
            children: text.split('\n').map(line =>
                new Paragraph({
                    children: [new TextRun(line)],
                })
            ),
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}

async function createPdfFromText(text: string): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const lineHeight = 14;
    const margin = 50;

    // Split text into lines (filtering non-ASCII characters to avoid pdf-lib errors)
    const rawLines = text.split('\n');
    const cleanLines: string[] = [];
    rawLines.forEach(line => {
        const cleaned = line.replace(/[^\x00-\x7F]/g, " ");
        // Simple wrapping logic (80 chars max per line)
        for (let i = 0; i < cleaned.length; i += 80) {
            cleanLines.push(cleaned.slice(i, i + 80));
        }
    });

    let currentPage = pdfDoc.addPage();
    let { height } = currentPage.getSize();
    let currentY = height - margin;

    for (const line of cleanLines) {
        if (currentY < margin + lineHeight) {
            currentPage = pdfDoc.addPage();
            currentY = height - margin;
        }

        currentPage.drawText(line, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });
        currentY -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

async function convertImageLocally(file: File, targetFormat: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject();
                ctx.drawImage(img, 0, 0);

                const type = targetFormat === 'JPG' ? 'image/jpeg' : `image/${targetFormat.toLowerCase()}`;
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject();
                }, type, 0.9);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}
