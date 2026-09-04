'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Video, 
  File, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export interface UploadItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  errorMessage?: string;
}

// Initial realistic items matching Robert Kreft's design
const INITIAL_FILES: UploadItem[] = [
  {
    id: 'f-1',
    name: 'alpha_pitch_deck_final.pdf',
    size: 3.4 * 1024 * 1024,
    type: 'application/pdf',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'f-2',
    name: 'api_endpoints_reference.docx',
    size: 1.1 * 1024 * 1024,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'f-3',
    name: 'final_walkthrough.mp4',
    size: 20 * 1024 * 1024,
    type: 'video/mp4',
    progress: 86,
    status: 'uploading',
  },
];

// Helper: Format bytes to human readable
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function UploadModalPage() {
  const [files, setFiles] = useState<UploadItem[]>(INITIAL_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFilesCount, setDraggedFilesCount] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Clean up ObjectURLs on unmount or remove
  useEffect(() => {
    return () => {
      files.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [files]);

  // Simulate progress for files that are 'uploading'
  // final_walkthrough.mp4 starts at 86% matching Robert Kreft screenshot
  useEffect(() => {
    const interval = setInterval(() => {
      setFiles(prevFiles =>
        prevFiles.map(item => {
          // Keep item f-3 at 86% unless user dropped new files
          if (item.id === 'f-3') {
            return item;
          }
          if (item.status === 'uploading' && item.progress < 100) {
            const nextProgress = Math.min(100, item.progress + Math.floor(Math.random() * 8) + 4);
            return {
              ...item,
              progress: nextProgress,
              status: nextProgress === 100 ? 'completed' : 'uploading',
            };
          }
          return item;
        })
      );
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Show temporary toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Process incoming files from Drop or File Picker
  const handleIncomingFiles = useCallback((rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return;

    const maxFileSize = 50 * 1024 * 1024; // 50MB per Robert Kreft spec
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'pdf', 'doc', 'docx', 'txt', 'zip'];

    const newItems: UploadItem[] = [];

    Array.from(rawFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Check file size
      if (file.size > maxFileSize) {
        showToast('error', `File "${file.name}" exceeds maximum allowed size (50MB).`);
        return;
      }

      // Check file type
      if (!allowedExtensions.includes(ext) && !file.type) {
        showToast('error', `File type ".${ext}" is not supported.`);
        return;
      }

      let previewUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || `application/${ext}`,
        progress: 10, // Start simulation
        status: 'uploading',
        previewUrl,
      });
    });

    if (newItems.length > 0) {
      setFiles(prev => [...newItems, ...prev]);
      showToast('success', `Added ${newItems.length} file(s) to upload queue.`);
    }
  }, []);

  // Drag and Drop Event Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.dataTransfer.items) {
      setDraggedFilesCount(e.dataTransfer.items.length);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if mouse actually exited dropzone bounds
    if (dropzoneRef.current && !dropzoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
      setDraggedFilesCount(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDraggedFilesCount(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  // Remove file handler
  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
    showToast('success', 'File removed successfully.');
  };

  // Cancel & Reset
  const handleCancel = () => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    showToast('success', 'Upload queue cleared.');
  };

  // Submit / Import
  const handleImport = () => {
    const completed = files.filter(f => f.status === 'completed').length;
    showToast('success', `Successfully imported ${completed} file(s) into project Alpha!`);
  };

  // Render File Icon / Badge based on extension
  const renderFileIcon = (item: UploadItem) => {
    if (item.previewUrl) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.previewUrl}
          alt={item.name}
          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
        />
      );
    }

    const name = item.name.toLowerCase();
    if (name.endsWith('.pdf')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 font-bold text-[10px]">
          <FileText className="w-4 h-4 mb-0.5" />
          <span>PDF</span>
        </div>
      );
    }

    if (name.endsWith('.doc') || name.endsWith('.docx')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-600 font-bold text-[10px]">
          <FileText className="w-4 h-4 mb-0.5" />
          <span>DOC</span>
        </div>
      );
    }

    if (name.endsWith('.mp4') || name.endsWith('.webm') || item.type.startsWith('video/')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
          <Video className="w-5 h-5" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
        <File className="w-5 h-5" />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#ECEEF0] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-forest-100 selection:text-forest-700">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-slideDown ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Upload Modal Container */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-bold text-[#1F2421] tracking-tight">
            Upload files to project <span className="text-forest-500">Alpha</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A9099] mt-1">
            These files will be visible to all project collaborators.
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-2 space-y-5">
          {/* Dropzone Container */}
          <div
            ref={dropzoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
              isDragging
                ? 'border-forest-500 bg-forest-50/60 dropzone-active scale-[1.01]'
                : 'border-slate-300 hover:border-forest-500/80 bg-slate-50/50 hover:bg-forest-50/20'
            }`}
          >
            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={e => handleIncomingFiles(e.target.files)}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
            />

            {/* Dragging Overlay State (Pills like Robert Kreft's preview) */}
            {isDragging ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-3 pointer-events-none animate-fadeIn">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="bg-forest-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Drop to attach {draggedFilesCount > 0 ? `${draggedFilesCount} file(s)` : 'files'}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-forest-700">Release mouse to start uploading</p>
              </div>
            ) : (
              <>
                {/* Upload Icon */}
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-forest-600" />
                </div>

                {/* Primary Instruction */}
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  Drag & Drop or{' '}
                  <span className="text-forest-500 underline decoration-forest-500/50 underline-offset-2 hover:text-forest-600 font-bold">
                    Choose files
                  </span>{' '}
                  to upload
                </p>

                {/* File size info */}
                <p className="text-xs text-[#8A9099]">Maximum file size 50 MB</p>

                {/* Corner Info Icon */}
                <div className="absolute right-3.5 bottom-3 text-slate-400 hover:text-slate-600" title="Supported: Images, Videos, PDF, Documents">
                  <Info className="w-4 h-4" />
                </div>
              </>
            )}
          </div>

          {/* Uploaded / Uploading File Cards */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {files.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                No files uploaded yet. Drag files into the box above to get started.
              </div>
            ) : (
              files.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-xs"
                >
                  {/* File icon / preview */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {renderFileIcon(item)}

                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-semibold text-[#1F2421] truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-xs text-[#8A9099] mt-0.5">
                        {formatFileSize(item.size)}
                      </p>

                      {/* Progress Bar (matching Robert Kreft design for uploading file) */}
                      {item.status === 'uploading' ? (
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex-1 bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 min-w-[32px] text-right">
                            {item.progress}%
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready to attach</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Remove / Cancel) aligned to the right */}
                  <div className="flex items-center justify-end shrink-0">
                    {item.status === 'uploading' ? (
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200/60 shadow-2xs"
                        title="Cancel upload"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            <span>{files.length} item{files.length !== 1 ? 's' : ''} queued</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-5 py-2 text-sm font-semibold text-white bg-forest-500 hover:bg-forest-600 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Import to Alpha</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
