import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import FileUploader from './components/FileUploader';
import MonthSelector from './components/MonthSelector';
import ParametersPanel from './components/ParametersPanel';
import Dashboard from './components/Dashboard';
import CostTable from './components/CostTable';
import { processSheetData, analyzeMonthData, analyzeRangeData } from './utils/xlsxHelper';
import { AnalysisResult, SheetData } from './types';

export default function App() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [isLibLoaded, setIsLibLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string>('');

  // Selection State
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Start Month
  const [endMonth, setEndMonth] = useState<string>(''); // End Month
  const [isRangeMode, setIsRangeMode] = useState<boolean>(false);

  // Analysis Result (Now an Array)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  // Parameters
  const [exchangeRate, setExchangeRate] = useState<string>('32.5');
  const [wattsPerPiece, setWattsPerPiece] = useState<string>('8.41');

  // Check if XLSX library is loaded
  useEffect(() => {
    const checkLib = setInterval(() => {
      if (window.XLSX) {
        setIsLibLoaded(true);
        clearInterval(checkLib);
      }
    }, 500);
    return () => clearInterval(checkLib);
  }, []);

  const handleAnalyze = () => {
    setAnalysisError('');
    setAnalysisResults([]);

    if (!sheetData) return;

    let res: AnalysisResult[] = [];

    try {
      if (!isRangeMode && selectedMonth) {
        // Single Month
        const single = analyzeMonthData(sheetData, selectedMonth);
        if (single) res = [single];
      } else if (isRangeMode && selectedMonth && endMonth) {
        // Range
        res = analyzeRangeData(sheetData, selectedMonth, endMonth);
      }
    } catch (e) {
      console.error(e);
      setAnalysisError('分析過程中發生錯誤，請檢查檔案格式。');
    }

    if (res.length > 0) {
      setAnalysisResults(res);
    } else {
      setAnalysisError('查無資料。請確認選擇的月份或區間是否正確，以及檔案內容是否符合格式。');
    }
  };

  const handleFileUpload = (file: File) => {
    if (!window.XLSX) {
      setError('系統組件尚未載入完成，請稍後再試。');
      return;
    }

    setLoading(true);
    setFileName(file.name);
    setError('');
    setAnalysisError('');
    setSheetData(null);
    setAnalysisResults([]);
    
    // Reset Selection
    setSelectedMonth('');
    setEndMonth('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        if (!bstr) throw new Error("File read failed");
        
        const workbook = window.XLSX.read(bstr, { type: 'binary' });

        // Default to first sheet or find one with "單位成本" (Unit Cost)
        let sheetName = workbook.SheetNames[0];
        const costSheetName = workbook.SheetNames.find((name: string) =>
          name.includes('單位成本')
        );
        if (costSheetName) sheetName = costSheetName;

        const ws = workbook.Sheets[sheetName];
        const data = window.XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: '',
        });

        const processed = processSheetData(data);
        if (processed) {
          setSheetData(processed);
          // Auto select latest month
          if (processed.months.length > 0) {
            setSelectedMonth(processed.months[0]); // Start (Often latest)
            setEndMonth(processed.months[0]); // End
          }
        } else {
          setError(
            '找不到包含月份 (如 202601) 的標題列，請確認檔案格式或分頁內容。'
          );
        }
      } catch (err) {
        console.error(err);
        setError('讀取檔案失敗，請確認格式是否正確 (Excel 或 CSV)');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Determine if the "Analyze" button should be enabled
  // Must have File, Month(s), and Parameters (Exchange Rate & Watts)
  const canAnalyze = 
    !!sheetData && 
    !!selectedMonth && 
    (!isRangeMode || !!endMonth) &&
    !!exchangeRate &&
    !!wattsPerPiece;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              電池成本分析儀 Pro
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              邏輯：項次0-2取整數(含矽片)，3+取分項 | 範圍：Row 1-67 | 名稱：B欄
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-xs text-slate-400 font-medium">
              {isLibLoaded ? (
                <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  系統就緒
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  模組載入中...
                </span>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              重新整理 / 重置
            </button>
          </div>
        </div>

        {/* Control Panel Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <FileUploader
            onFileUpload={handleFileUpload}
            isLoading={loading}
            error={error}
            fileName={fileName}
            isLibLoaded={isLibLoaded}
          />
          <MonthSelector
            months={sheetData?.months || []}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            isRangeMode={isRangeMode}
            setIsRangeMode={setIsRangeMode}
            endMonth={endMonth}
            onSelectEndMonth={setEndMonth}
          />
          <ParametersPanel 
            exchangeRate={exchangeRate}
            setExchangeRate={setExchangeRate}
            wattsPerPiece={wattsPerPiece}
            setWattsPerPiece={setWattsPerPiece}
            onAnalyze={handleAnalyze}
            canAnalyze={canAnalyze}
          />
        </div>

        {/* Analysis Error Message */}
        {analysisError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-center font-medium animate-pulse">
            ⚠️ {analysisError}
          </div>
        )}

        {/* Results */}
        {analysisResults.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            <Dashboard 
              results={analysisResults} 
              exchangeRate={parseFloat(exchangeRate) || 0}
              wattsPerPiece={parseFloat(wattsPerPiece) || 0}
            />
            <CostTable
              results={analysisResults}
              selectedLabel={isRangeMode ? `${selectedMonth}-${endMonth}` : selectedMonth}
              exchangeRate={parseFloat(exchangeRate) || 0}
              wattsPerPiece={parseFloat(wattsPerPiece) || 0}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}