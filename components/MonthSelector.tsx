import React from 'react';
import { Calendar, Search, ArrowRight, Layers } from 'lucide-react';

interface MonthSelectorProps {
  months: string[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  // Range props
  isRangeMode: boolean;
  setIsRangeMode: (val: boolean) => void;
  endMonth: string;
  onSelectEndMonth: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selectedMonth,
  onSelectMonth,
  isRangeMode,
  setIsRangeMode,
  endMonth,
  onSelectEndMonth,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
        <Calendar className="w-5 h-5 text-blue-500" />
        2. 選擇分析月份
      </h2>

      {months.length > 0 ? (
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setIsRangeMode(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isRangeMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              單月分析
            </button>
            <button
              onClick={() => setIsRangeMode(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                isRangeMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              逐月趨勢
            </button>
          </div>

          {!isRangeMode ? (
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                選擇月份
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-shadow cursor-pointer hover:border-blue-300"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
               <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                  起始月份 (From)
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => onSelectMonth(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {months.slice().reverse().map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-center -my-1 relative z-10">
                  <div className="bg-slate-50 rounded-full p-1 border border-slate-200">
                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                  結束月份 (To)
                </label>
                <select
                  value={endMonth}
                  onChange={(e) => onSelectEndMonth(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 text-xs text-slate-400 text-center border-t border-slate-50">
             資料庫範圍: {months[months.length - 1]} ~ {months[0]}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 min-h-[160px]">
          <Search className="w-8 h-8 mb-2 opacity-50" />
          請先上傳檔案
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
