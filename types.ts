export interface CostItem {
  id: string;
  name: string;
  value: number;
  originalRow: number;
}

export interface AnalysisResult {
  month: string; // Added to track which month this result belongs to
  inboundQty: number;
  unitCost: number;
  totalCost: number;
  top20: CostItem[];
}

export interface SheetData {
  raw: any[][];
  headerRowIndex: number;
  months: string[];
}

// Declaration for the global XLSX object loaded via script tag
declare global {
  interface Window {
    XLSX: any;
  }
}
