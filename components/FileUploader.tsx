import React from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string;
  fileName: string;
  isLibLoaded: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  isLoading,
  error,
  fileName,
  isLibLoaded,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
        <Upload className="w-5 h-5 text-blue-500" />
        1. 上傳 Excel / CSV
      </h2>
      
      <div
        className={`relative flex-1 border-2 border-dashed rounded-xl p-8 transition-all text-center group flex flex-col justify-center items-center ${
          !isLibLoaded || isLoading
            ? 'bg-slate-50 border-slate-200 cursor-wait'
            : 'border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
        }`}
      >
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleChange}
          disabled={!isLibLoaded || isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`p-3 rounded-full transition-colors ${
              fileName
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-white text-blue-400 shadow-sm'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">
              {fileName
                ? fileName
                : isLibLoaded
                ? '點擊或拖曳檔案至此'
                : '系統載入中...'}
            </span>
            <span className="block text-xs text-slate-400">
              支援 .xlsx, .csv 格式
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
