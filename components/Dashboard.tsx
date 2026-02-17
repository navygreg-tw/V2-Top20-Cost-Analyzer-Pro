import React from 'react';
import { Calculator, TrendingUp, DollarSign, CalendarRange, Table2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardProps {
  results: AnalysisResult[]; // Changed from single result to array
  exchangeRate: number;
  wattsPerPiece: number;
}

const Dashboard: React.FC<DashboardProps> = ({ results, exchangeRate, wattsPerPiece }) => {
  if (!results || results.length === 0) return null;

  // Aggregate Data
  const totalInbound = results.reduce((acc, curr) => acc + curr.inboundQty, 0);
  const totalCostSum = results.reduce((acc, curr) => acc + curr.totalCost, 0);
  
  // Weighted Average Unit Cost = Total Cost (Sum) / Total Inbound (Sum)
  const weightedUnitCost = totalInbound > 0 ? totalCostSum / totalInbound : 0;

  // Helper to calculate US Cents
  const getUsCents = (costTwd: number) => {
    if (costTwd > 0 && exchangeRate > 0 && wattsPerPiece > 0) {
      const usdPerPiece = costTwd / exchangeRate;
      const usdPerWatt = usdPerPiece / wattsPerPiece;
      return (usdPerWatt * 100).toFixed(3);
    }
    return '-';
  };

  // Overall Weighted US Cents
  const weightedUsCents = getUsCents(weightedUnitCost);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isRange = results.length > 1;
  const periodLabel = isRange 
    ? `${results[0].month} - ${results[results.length-1].month}`
    : results[0].month;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Aggregate Cards */}
      <div className="space-y-2">
        {isRange && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 w-fit shadow-sm">
            <CalendarRange className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-700">區間加權平均</span>
            <span className="text-slate-300">|</span>
            <span>{periodLabel}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Inbound Qty */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-sm font-medium mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {isRange ? '期間總入庫量' : '當月入庫量'}
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-auto">
              {totalInbound > 0 ? (
                formatNumber(totalInbound)
              ) : (
                <span className="text-slate-300 text-2xl">未找到</span>
              )}
              <span className="text-base font-normal text-slate-400 ml-2">pcs</span>
            </div>
          </div>

          {/* Card 2: Unit Cost */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-sm font-medium mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {isRange ? '平均單位成本' : '實際單位成本'}
            </div>
            <div className="text-3xl font-bold text-emerald-600 tracking-tight mt-auto">
              $
              {weightedUnitCost > 0 ? (
                formatNumber(weightedUnitCost)
              ) : (
                <span className="text-slate-300 text-2xl">0.00</span>
              )}
              <span className="text-xs text-slate-400 ml-2 font-normal">
                {isRange ? '(加權平均)' : '(細項加總)'}
              </span>
            </div>
          </div>

          {/* Card 3: US Cents / Watt */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <DollarSign className="w-20 h-20 text-indigo-500" />
            </div>
            <div className="text-slate-500 text-sm font-medium mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              美分 / 瓦 (US Cents)
            </div>
            <div className="text-3xl font-bold text-indigo-600 tracking-tight mt-auto">
              {weightedUsCents !== '-' ? (
                weightedUsCents
              ) : (
                <span className="text-slate-300 text-xl font-normal">需輸入參數</span>
              )}
              {weightedUsCents !== '-' && <span className="text-sm font-normal text-slate-400 ml-1">¢/W</span>}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {isRange ? '基於期間平均成本' : '(單位成本/匯率/瓦數)*100'}
            </div>
          </div>

          {/* Card 4: Total Cost */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Calculator className="w-24 h-24" />
            </div>
            <div className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {isRange ? '期間總成本' : '實際總成本'}
            </div>
            <div className="text-3xl font-bold tracking-tight mt-auto text-emerald-400">
              {totalCostSum > 0
                ? formatCurrency(totalCostSum)
                : '無法計算'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {isRange ? '各月總成本加總' : '公式：入庫量 × 單位成本'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Monthly Breakdown Table (Only for Range Mode) */}
      {isRange && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <h3 className="text-md font-bold text-slate-700 flex items-center gap-2">
               <Table2 className="w-5 h-5 text-blue-500" />
               分月數據明細
             </h3>
             <span className="text-xs text-slate-400">包含入庫量、成本與美分換算</span>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
               <thead>
                 <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                   <th className="p-4 pl-6">月份</th>
                   <th className="p-4 text-right">入庫量 (pcs)</th>
                   <th className="p-4 text-right">單位成本 (TWD)</th>
                   <th className="p-4 text-right">美分/瓦 (US¢)</th>
                   <th className="p-4 text-right pr-6">當月總成本 (TWD)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {results.map((res) => {
                   const monthlyUsCents = getUsCents(res.unitCost);
                   return (
                     <tr key={res.month} className="hover:bg-blue-50/30 transition-colors group">
                       <td className="p-4 pl-6 font-bold text-slate-700 group-hover:text-blue-600">
                         {res.month}
                       </td>
                       <td className="p-4 text-right font-mono text-slate-600">
                         {formatNumber(res.inboundQty)}
                       </td>
                       <td className="p-4 text-right font-mono text-emerald-600 font-medium">
                         ${formatNumber(res.unitCost)}
                       </td>
                       <td className="p-4 text-right font-mono text-indigo-600 font-medium bg-indigo-50/10">
                         {monthlyUsCents}
                       </td>
                       <td className="p-4 text-right font-mono text-slate-500 pr-6">
                         {formatCurrency(res.totalCost)}
                       </td>
                     </tr>
                   );
                 })}
                 {/* Footer Row for Average/Total */}
                 <tr className="bg-slate-50/80 border-t border-slate-200 font-bold">
                    <td className="p-4 pl-6 text-slate-800">期間加權平均 / 總計</td>
                    <td className="p-4 text-right font-mono text-slate-800">{formatNumber(totalInbound)}</td>
                    <td className="p-4 text-right font-mono text-emerald-700">${formatNumber(weightedUnitCost)}</td>
                    <td className="p-4 text-right font-mono text-indigo-700">{weightedUsCents}</td>
                    <td className="p-4 text-right font-mono text-slate-800 pr-6">{formatCurrency(totalCostSum)}</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;