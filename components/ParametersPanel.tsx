import React from 'react';
import { Settings, DollarSign, Zap, PlayCircle } from 'lucide-react';

interface ParametersPanelProps {
  exchangeRate: string;
  setExchangeRate: (val: string) => void;
  wattsPerPiece: string;
  setWattsPerPiece: (val: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
}

const ParametersPanel: React.FC<ParametersPanelProps> = ({
  exchangeRate,
  setExchangeRate,
  wattsPerPiece,
  setWattsPerPiece,
  onAnalyze,
  canAnalyze,
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-2xl shadow-sm border-2 border-indigo-100 hover:border-indigo-200 transition-colors h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900">
        <Settings className="w-5 h-5 text-indigo-600" />
        3. 設定參數 & 執行
      </h2>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-bold text-indigo-800 mb-1.5">
            匯率 (TWD to USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <DollarSign className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-600" />
            </div>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="例如: 32.5"
              step="0.1"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-indigo-100 rounded-xl text-indigo-900 font-semibold placeholder:text-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-indigo-800 mb-1.5">
            每片瓦數 (Watts/pcs) <span className="text-red-500">*</span>
          </label>
           <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Zap className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-600" />
            </div>
            <input
              type="number"
              value={wattsPerPiece}
              onChange={(e) => setWattsPerPiece(e.target.value)}
              placeholder="例如: 8.41"
              step="0.01"
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-indigo-100 rounded-xl text-indigo-900 font-semibold placeholder:text-indigo-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="pt-2">
           <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 ${
              canAnalyze
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
           >
             <PlayCircle className={`w-6 h-6 ${canAnalyze ? 'animate-pulse' : ''}`} />
             開始分析報表
           </button>
        </div>
      </div>
      
       <div className="mt-5 p-3 bg-white border border-indigo-100 text-indigo-600 text-xs rounded-lg shadow-sm font-medium">
           💡 必須完成: 上傳檔案 + 選擇月份 + 輸入參數 (匯率/瓦數)，才能執行分析。
       </div>
    </div>
  );
};

export default ParametersPanel;