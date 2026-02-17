import { AnalysisResult, CostItem, SheetData } from '../types';

export const processSheetData = (data: any[][]): SheetData | null => {
  let hIndex = -1;
  let foundMonths: any[] = [];

  // Scan first 30 rows to find header row containing date patterns like '202601'
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const row = data[i];
    if (!row) continue;

    const potentialMonths = row.filter((cell) => {
      const str = String(cell).trim();
      return /^20\d{4}$/.test(str);
    });

    if (potentialMonths.length > 0) {
      hIndex = i;
      foundMonths = potentialMonths;
      break;
    }
  }

  if (hIndex === -1) {
    return null;
  }

  // Filter unique months and sort descending (Newest first)
  // Ensure all months are converted to strings to match state types
  const uniqueMonths = [...new Set(foundMonths.map(m => String(m).trim()))]
    .sort((a, b) => Number(b) - Number(a));

  return {
    raw: data,
    headerRowIndex: hIndex,
    months: uniqueMonths,
  };
};

export const analyzeMonthData = (
  sheetData: SheetData,
  selectedMonth: string
): AnalysisResult | null => {
  const { raw, headerRowIndex } = sheetData;
  if (!raw || headerRowIndex < 0 || !raw[headerRowIndex]) return null;
  
  const headerRow = raw[headerRowIndex];

  // 1. Find column index for the selected month
  // Robust finding: trim strings, handle potential number conversions
  const targetMonthStr = String(selectedMonth).trim();
  const monthColIndex = headerRow.findIndex(
    (cell) => String(cell).trim() === targetMonthStr
  );

  if (monthColIndex === -1) return null;

  // 2. Find "Actual" (實際) cost column
  // Look in the row immediately below the header (headerRowIndex + 1)
  // Usually the structure is: [Month] [Budget] [Actual] ...
  let costColIndex = -1;
  const subHeaderRow = raw[headerRowIndex + 1];

  if (subHeaderRow) {
    // Search within a reasonable range (e.g., next 10 columns) to find "實際" under this month
    for (
      let i = monthColIndex;
      i < Math.min(monthColIndex + 10, subHeaderRow.length);
      i++
    ) {
      const cellText = String(subHeaderRow[i] || '');
      if (cellText.includes('實際')) {
        costColIndex = i;
        break;
      }
    }
  }

  // Fallback: if no "Actual" column found (maybe no subheaders), use the month column itself
  if (costColIndex === -1) {
    costColIndex = monthColIndex;
  }

  let inboundQty = 0;

  // PRIORITY: Get Inbound Quantity from Row 3 (Index 2)
  if (raw.length > 2) {
      const row3Value = raw[2][monthColIndex];
      if (typeof row3Value === 'number') {
          inboundQty = row3Value;
      } else if (typeof row3Value === 'string') {
          const parsed = parseFloat(row3Value.replace(/,/g, ''));
          if (!isNaN(parsed)) inboundQty = parsed;
      }
  }

  let items: CostItem[] = [];

  const normalize = (str: any) =>
    String(str || '')
      .replace(/\s+/g, '')
      .replace(/[\r\n]+/g, '');

  const qtyKeywords = ['入庫量', '工單入庫量', '入庫數量'];

  // Process rows
  raw.forEach((row, index) => {
    // Hard limit: only process first 67 rows (index 0-66)
    if (index >= 67) return;

    // Skip headers
    if (index <= headerRowIndex + 1) return;

    const cellA = row[0];
    const colA =
      cellA !== undefined && cellA !== null ? String(cellA).trim() : ''; // Item No
    const cellB = row[1];
    const colB =
      cellB !== undefined && cellB !== null ? String(cellB).trim() : ''; // Item Name

    const rowTextNorm = normalize(colA + colB);

    // Get Values
    let valCost = row[costColIndex];
    if (typeof valCost === 'string')
      valCost = parseFloat(valCost.replace(/,/g, ''));
    if (isNaN(valCost)) valCost = 0;

    let valMonth = row[monthColIndex];
    if (typeof valMonth === 'string')
      valMonth = parseFloat(valMonth.replace(/,/g, ''));
    if (isNaN(valMonth)) valMonth = 0;

    // Logic 1: Find Inbound Quantity (Fallback if Row 3 was empty)
    if (qtyKeywords.some((k) => rowTextNorm.includes(k))) {
      // If we haven't found a valid quantity in Row 3, try to find it here
      if (inboundQty <= 0) {
          if (valMonth > 0) inboundQty = valMonth;
          else if (valCost > 0) inboundQty = valCost;
      }
      return;
    }

    // Logic 2: Item Filtering
    if (colA === '') return;

    const itemNoVal = parseFloat(colA);
    if (isNaN(itemNoVal)) return;

    const isInteger = /^\d+\.?$/.test(colA);
    const hasDecimal = colA.includes('.') && !colA.endsWith('.');
    const majorPart = Math.floor(itemNoVal);

    let shouldKeep = false;

    // Rule A: Item No <= 2 (0, 1, 2). Keep integers only.
    if (majorPart <= 2) {
      if (isInteger) shouldKeep = true;
    } else {
      // Rule B: Item No >= 3. Keep decimals (sub-items) only.
      if (hasDecimal) shouldKeep = true;
    }

    // Exclude totals explicitly if named so
    if (colB.includes('總計') || colB.includes('合計')) shouldKeep = false;

    if (shouldKeep && valCost > 0) {
      items.push({
        id: colA,
        name: colB || colA,
        value: valCost,
        originalRow: index + 1,
      });
    }
  });

  const unitCostTotal = items.reduce((acc, item) => acc + item.value, 0);
  const totalCost = inboundQty * unitCostTotal;

  // Sort top 20 descending by value
  items.sort((a, b) => b.value - a.value);
  const top20 = items.slice(0, 20);

  return {
    month: selectedMonth,
    inboundQty,
    unitCost: unitCostTotal,
    totalCost,
    top20,
  };
};

export const analyzeRangeData = (
  sheetData: SheetData,
  startMonth: string,
  endMonth: string
): AnalysisResult[] => {
  // Use explicit base 10 for safety
  const s = parseInt(startMonth, 10);
  const e = parseInt(endMonth, 10);
  
  if (isNaN(s) || isNaN(e)) return [];

  const min = Math.min(s, e);
  const max = Math.max(s, e);

  // Filter months that fall within range
  const monthsInRange = sheetData.months.filter(m => {
    const val = parseInt(m, 10);
    return !isNaN(val) && val >= min && val <= max;
  });

  // Sort Ascending for the result array (Oldest -> Newest) to show trend left-to-right
  monthsInRange.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const results: AnalysisResult[] = [];
  monthsInRange.forEach(m => {
    // Important: Pass the string month 'm' exactly as it appears in sheetData.months
    const res = analyzeMonthData(sheetData, m);
    if (res) results.push(res);
  });

  return results;
}

export const exportToExcel = (
  results: AnalysisResult | AnalysisResult[],
  monthLabel: string, // Can be "202601" or "202601-202603"
  exchangeRate: number = 0,
  wattsPerPiece: number = 0
) => {
  if (!window.XLSX) return;

  const wb = window.XLSX.utils.book_new();
  const resultArray = Array.isArray(results) ? results : [results];
  const exportData: any[][] = [];

  // --- 1. Report Metadata ---
  exportData.push(['分析報告', `期間: ${monthLabel}`]);
  exportData.push(['匯率', exchangeRate || '-']);
  exportData.push(['每片瓦數', wattsPerPiece || '-']);
  exportData.push([]);

  // --- 2. Period Summary (Matching Dashboard) ---
  exportData.push(['【期間匯總 / 分月總表】']);
  
  // Header for Summary
  const summaryHeader = ['項目', ...resultArray.map(r => r.month), '合計/加權平均'];
  exportData.push(summaryHeader);

  // Helper for US Cents
  const calcUsCents = (twdVal: number) => {
    if (twdVal > 0 && exchangeRate > 0 && wattsPerPiece > 0) {
        const usdVal = twdVal / exchangeRate;
        const usdPerWatt = usdVal / wattsPerPiece;
        return (usdPerWatt * 100).toFixed(3);
    }
    return '-';
  };

  // Inbound Qty Row
  const totalInbound = resultArray.reduce((acc, r) => acc + r.inboundQty, 0);
  const inboundRow = ['入庫量 (pcs)', ...resultArray.map(r => r.inboundQty), totalInbound];
  exportData.push(inboundRow);

  // Unit Cost (TWD) Row
  const totalCostSum = resultArray.reduce((acc, r) => acc + r.totalCost, 0);
  const weightedAvgCost = totalInbound > 0 ? totalCostSum / totalInbound : 0;
  
  const unitCostRow = ['單位成本 (TWD)', ...resultArray.map(r => r.unitCost), weightedAvgCost.toFixed(2)];
  exportData.push(unitCostRow);

  // US Cents Row
  const usCentsRow = ['美分 (US¢/W)', ...resultArray.map(r => calcUsCents(r.unitCost)), calcUsCents(weightedAvgCost)];
  exportData.push(usCentsRow);

  // Total Cost Row
  const totalCostRow = ['當月總成本 (TWD)', ...resultArray.map(r => r.totalCost), totalCostSum];
  exportData.push(totalCostRow);

  exportData.push([]);
  exportData.push([]);

  // --- 3. Detailed Tables Per Month (Matching UI CostTable) ---
  // Iterate through each result and create a separate block
  resultArray.forEach((res) => {
    exportData.push([`【${res.month}】 Top 20 成本明細`]);
    exportData.push([`當月入庫量: ${res.inboundQty}`]);
    
    // Table Header
    exportData.push(['排名', '項目代號', '項目名稱', '金額 (TWD)', '美分 (US¢/W)']);

    if (res.top20.length === 0) {
      exportData.push(['無資料']);
    } else {
      res.top20.forEach((item, index) => {
        const usCents = calcUsCents(item.value);
        exportData.push([
          index + 1,
          item.id,
          item.name,
          item.value,
          usCents
        ]);
      });
    }

    // Spacer between months
    exportData.push([]);
    exportData.push([]);
  });

  const ws = window.XLSX.utils.aoa_to_sheet(exportData);
  
  // Set approximate column widths for better readability
  const wscols = [
    { wch: 10 }, // Rank / Label
    { wch: 20 }, // ID / Month 1
    { wch: 35 }, // Name / Month 2
    { wch: 15 }, // TWD
    { wch: 15 }, // US Cents
    { wch: 15 }, // Extra columns for summary
    { wch: 15 },
  ];
  ws['!cols'] = wscols;

  window.XLSX.utils.book_append_sheet(wb, ws, '分析報告');
  window.XLSX.writeFile(wb, `成本分析_${monthLabel}.xlsx`);
};