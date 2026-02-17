import React from 'react';
import { Download, FileSpreadsheet, Layers, Calendar } from 'lucide-react';
import { AnalysisResult } from '../types';
import { exportToExcel } from '../utils/xlsxHelper';

interface CostTableProps {
  results: AnalysisResult[];
  selectedLabel: string; // "202601" or "202601 - 202603"
  exchangeRate: number;
  wattsPerPiece: number;
}

const CostTable: React.FC<CostTableProps> = ({ 
  results, 
  selectedLabel,
  exchangeRate,
  wattsPerPiece
}) => {
  
  const handleExport = () => {
    exportToExcel(results, selectedLabel, exchangeRate, wattsPerPiece);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(
      num
    );
  };

  const calculateUsCents = (value: number) => {
    if (value > 0 && exchangeRate > 0 && wattsPerPiece > 0) {
        const usdVal = value / exchangeRate;
        const usdPerWatt = usdVal / wattsPerPiece;
        return (usdPerWatt * 100).toFixed(3);
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            逐月成本明細
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            以下列出各月份的前 20 大成本項目 (依金額排序)。
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Download className="w-4 h-4" />
          匯出 Excel 報表
        </button>
      </div>

      {/* Render Separate Table for Each Month */}
      {results.length > 0 ? (
        results.map((result) => (
          <div key={result.month} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
            {/* Month Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-base font-bold text-slate-800">{result.month}</span>
                    <span className="text-xs text-slate-400 ml-2">Top 20</span>
                  </div>
               </div>
               <div className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                 入庫: {formatNumber(result.inboundQty)}
               </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 w-16 text-center">排名</th>
                    <th className="p-4 w-24">項目代號</th>
                    <th className="p-4 min-w-[200px]">項目名稱</th>
                    <th className="p-4 text-right">金額 (TWD)</th>
                    <th className="p-4 text-right text-indigo-600 bg-indigo-50/30">美分 (US¢/W)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.top20.length > 0 ? (
                    result.top20.map((item, index) => {
                      const usCents = calculateUsCents(item.value);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="p-4 text-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-sm">
                            {item.id}
                          </td>
                          <td className="p-4 text-slate-700 font-medium group-hover:text-blue-700 transition-colors">
                            {item.name}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-600 font-semibold">
                            {formatNumber(item.value)}
                          </td>
                          <td className="p-4 text-right font-mono text-indigo-600 font-bold bg-indigo-50/10 group-hover:bg-indigo-50/20">
                            {usCents}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                        無資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet className="w-10 h-10 opacity-20" />
            <p>暫無分析結果。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostTable;