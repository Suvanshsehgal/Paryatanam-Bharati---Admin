import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, FileText, Loader2 } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'svg'];

const looksLikeImage = (url) => {
  const clean = String(url || '').split('?')[0].toLowerCase();
  const dot = clean.lastIndexOf('.');
  return dot !== -1 && IMAGE_EXTENSIONS.includes(clean.slice(dot + 1));
};

const fileNameFromUrl = (url) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || 'Uploaded file');
  } catch {
    return 'Uploaded file';
  }
};

/**
 * Optional upload for any file type. The file is stored on the server in the
 * shared images bucket, and its public URL is passed to onChange.
 */
export const ImagePreviewUpload = ({
  value,
  onChange,
  label = 'Image URL or Upload',
  placeholder = 'https://...',
  folder = 'misc',
}) => {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      const response = await apiClient.post('/uploads', form, {
        headers: { 'Content-Type': undefined },
      });
      const url = response.data?.data?.url;
      if (!url) throw new Error('The server did not return a file link.');
      onChange(url);
      toast.success('File uploaded', file.name);
    } catch (err) {
      toast.error('Upload failed', err?.detail || err?.message || extractErrorMessage(err?.response?.data, 'Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    uploadFile(e.dataTransfer.files?.[0]);
  };

  const hasValue = Boolean(value);
  const isImage = hasValue && looksLikeImage(value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} <span className="font-normal text-slate-400">(optional)</span>
        </label>
      )}

      {hasValue ? (
        <div className="relative group rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
          {isImage ? (
            <img src={value} alt="Preview" className="w-full max-h-48 object-cover" />
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-3 text-xs font-semibold text-orange-600 hover:underline"
            >
              <FileText className="w-4 h-4" />
              <span className="truncate">{fileNameFromUrl(value)}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center transition-all bg-slate-50/50 dark:bg-slate-900/50',
            dragActive ? 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="font-semibold text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload a file'}
              </button>{' '}
              or drag and drop
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Any file type, up to 10 MB</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                uploadFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      )}

      {/* Paste-a-link fallback for files already hosted elsewhere */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <LinkIcon className="w-3.5 h-3.5" />
        </div>
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
};
