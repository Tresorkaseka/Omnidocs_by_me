import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileArrowUp, FileText, FileImage, FileAudio, FileVideo, FileArchive, File as FileIcon } from '@phosphor-icons/react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatBytes, detectFileCategory, type FileCategory, convertDocumentLocally, getAvailableFormats } from '../utils/file';

// Utility for stricter Tailwind classes caching
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Stagger variants for the Bento grid
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
};

export function Dropzone() {
    const [isHovered, setIsHovered] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<FileCategory>('unknown');
    const [isConverting, setIsConverting] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [availableFormats, setAvailableFormats] = useState<string[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovered(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovered(false);
    }, []);

    const processFile = (droppedFile: File) => {
        if (droppedFile.size > 50 * 1024 * 1024) {
            alert("Fichier trop volumineux. La limite est de 50MB.");
            return;
        }
        setFile(droppedFile);
        setCategory(detectFileCategory(droppedFile));
        setAvailableFormats(getAvailableFormats(droppedFile));
        setSelectedFormat(null);
        setDownloadUrl(null);
    };

    const handleConvert = async () => {
        if (!file || !selectedFormat) return;
        setIsConverting(true);
        try {
            const resultBlob = await convertDocumentLocally(file, selectedFormat);
            const url = URL.createObjectURL(resultBlob);
            setDownloadUrl(url);
        } catch (err) {
            alert("Erreur de conversion");
            console.error(err);
        } finally {
            setIsConverting(false);
        }
    };

    const resetAll = () => {
        setFile(null);
        setCategory('unknown');
        setSelectedFormat(null);
        setAvailableFormats([]);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovered(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const renderIcon = () => {
        const props = { weight: "duotone" as const, className: "w-7 h-7 text-emerald-600" };
        switch (category) {
            case 'document': return <FileText {...props} />;
            case 'image': return <FileImage {...props} />;
            case 'audio': return <FileAudio {...props} />;
            case 'video': return <FileVideo {...props} />;
            case 'archive': return <FileArchive {...props} />;
            default: return <FileIcon {...props} />;
        }
    };

    return (
        <div className="w-full flex-1 min-h-[400px] flex items-center justify-center relative perspective-1000">
            <AnimatePresence mode="popLayout">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className={cn(
                            "w-full max-w-2xl aspect-video glass-panel shadow-diffusion flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden relative",
                            isHovered ? "border-emerald-500/50 scale-[1.02]" : "border-slate-200 hover:border-slate-300"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileUpload')?.click()}
                    >
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 transition-opacity duration-500 pointer-events-none",
                            isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                        )} />

                        <input
                            id="fileUpload"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) processFile(e.target.files[0]);
                            }}
                        />

                        <motion.div
                            animate={{ y: isHovered ? -10 : 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm"
                        >
                            <FileArrowUp weight="duotone" className="w-10 h-10 text-slate-400" />
                        </motion.div>

                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Glissez votre Fichier</h3>
                        <p className="text-slate-500 font-medium">Maximum 50MB. Traitement 100% Local.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="action-bento"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="w-full flex-col flex gap-6"
                    >
                        {/* File Info Card */}
                        <div className="glass-panel w-full p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-diffusion border-emerald-500/20 bg-white/90">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    {renderIcon()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-[300px]">{file.name}</h4>
                                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{formatBytes(file.size)} • {category.charAt(0).toUpperCase() + category.slice(1)}</p>
                                </div>
                            </div>

                            <button
                                onClick={resetAll}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Changer
                            </button>
                        </div>

                        {/* Conversion Options (Dynamic Bento) */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <motion.div variants={itemVariants} className="glass-panel p-8 shadow-diffusion border-slate-200 flex flex-col gap-4">
                                <h3 className="text-slate-900 font-bold tracking-tight">Convertir vers...</h3>

                                {availableFormats.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {availableFormats.map((fmt) => (
                                            <button
                                                key={fmt}
                                                onClick={() => { setSelectedFormat(fmt); setDownloadUrl(null); }}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all text-left flex flex-col gap-1 group",
                                                    selectedFormat === fmt ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30"
                                                )}
                                            >
                                                <span className={cn("font-bold", selectedFormat === fmt ? "text-emerald-700" : "text-slate-700 group-hover:text-emerald-700")}>{fmt}</span>
                                                <span className="text-xs font-medium text-slate-400">Format {fmt}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-sm font-medium text-slate-500">Format non supporté en local.</p>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants} className="glass-panel p-8 shadow-diffusion border-slate-200 flex flex-col">
                                <h3 className="text-slate-900 font-bold tracking-tight mb-4">Actions</h3>
                                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-6">
                                    {!selectedFormat ? (
                                        <p className="text-sm font-medium text-slate-400">Sélectionnez un format d'abord</p>
                                    ) : (
                                        <div className="w-full flex flex-col items-center gap-4">
                                            {downloadUrl ? (
                                                <a
                                                    href={downloadUrl}
                                                    download={`converted_${file.name.split('.')[0]}.${selectedFormat.toLowerCase()}`}
                                                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-center tracking-wide transition-colors shadow-sm"
                                                >
                                                    Télécharger
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={handleConvert}
                                                    disabled={isConverting}
                                                    className={cn(
                                                        "w-full py-4 rounded-xl font-bold tracking-wide transition-all",
                                                        isConverting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                                                    )}
                                                >
                                                    {isConverting ? "Traitement local..." : "Convertir maintenant"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
