import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ImagePreviewUpload = ({ value, onChange, label = 'Image URL or Upload', placeholder = 'https://images.unsplash.com/...' }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 aspect-video max-h-48 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <label className="font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                Upload a file
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>{' '}
              or drag and drop
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}

      {/* URL Direct Input Fallback */}
      <div className="relative mt-2">
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
