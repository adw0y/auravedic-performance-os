import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AmazonASINItem } from '../data/initialData';

export interface ParsedReportResult {
  sourceType: 'amazon_business' | 'excel_workbook' | 'generic_csv' | 'unknown';
  fileName: string;
  rowCount: number;
  data: any[];
  summaryMessage: string;
}

/**
 * Parses any uploaded file (CSV or XLSX)
 */
export async function parseUploadedFile(file: File): Promise<ParsedReportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = results.data as any[];
          if (rows.length === 0) {
            resolve({
              sourceType: 'unknown',
              fileName: file.name,
              rowCount: 0,
              data: [],
              summaryMessage: 'The uploaded CSV file is empty.'
            });
            return;
          }

          const sampleKeys = Object.keys(rows[0] || {});
          
          // Check if Amazon Business Report
          const isAmazonBiz = sampleKeys.some(k => k.includes('ASIN') || k.includes('Units Ordered'));
          if (isAmazonBiz) {
            const mappedAmazonData: AmazonASINItem[] = rows.map((r: any) => {
              const childAsin = r['(Child) ASIN'] || r['Child ASIN'] || r['ASIN'] || '';
              const parentAsin = r['(Parent) ASIN'] || r['Parent ASIN'] || childAsin;
              const title = r['Title'] || r['Product Title'] || 'Unknown Listing';
              const rawUnits = r['Units Ordered'] || r['Units'] || 0;
              const rawOrders = r['Total Order Items'] || r['Orders'] || 0;
              const units = typeof rawUnits === 'string' ? parseInt(rawUnits.replace(/,/g, ''), 10) : Number(rawUnits) || 0;
              const orders = typeof rawOrders === 'string' ? parseInt(rawOrders.replace(/,/g, ''), 10) : Number(rawOrders) || 0;

              return {
                parentAsin,
                childAsin,
                title,
                unitsOrdered: units,
                totalOrderItems: orders,
                estRevenue: units * (title.includes('100') ? 999 : (title.includes('Rosemary') ? 499 : 585))
              };
            }).filter(i => i.childAsin);

            resolve({
              sourceType: 'amazon_business',
              fileName: file.name,
              rowCount: mappedAmazonData.length,
              data: mappedAmazonData,
              summaryMessage: `Successfully identified Amazon Business Report: Parsed ${mappedAmazonData.length} ASIN listings.`
            });
            return;
          }

          resolve({
            sourceType: 'generic_csv',
            fileName: file.name,
            rowCount: rows.length,
            data: rows,
            summaryMessage: `Parsed ${rows.length} rows from CSV file.`
          });
        },
        error: (err) => reject(err)
      });
    });
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const wb = XLSX.read(buffer, { type: 'binary' });
          const sheetNames = wb.SheetNames;
          
          let parsedData: any[] = [];
          let targetSheet = sheetNames[0];

          // Check for key recognizable sheets
          if (sheetNames.includes('Daily Spent - All')) targetSheet = 'Daily Spent - All';
          else if (sheetNames.includes('Amz-Inventory Plan')) targetSheet = 'Amz-Inventory Plan';
          else if (sheetNames.includes('Google Ads')) targetSheet = 'Google Ads';
          else if (sheetNames.includes('Meta Ads')) targetSheet = 'Meta Ads';

          const ws = wb.Sheets[targetSheet];
          parsedData = XLSX.utils.sheet_to_json(ws);

          resolve({
            sourceType: 'excel_workbook',
            fileName: file.name,
            rowCount: parsedData.length,
            data: parsedData,
            summaryMessage: `Successfully parsed Excel sheet [${targetSheet}] with ${parsedData.length} records. (Found ${sheetNames.length} tabs: ${sheetNames.slice(0, 5).join(', ')}...)`
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  }

  return {
    sourceType: 'unknown',
    fileName: file.name,
    rowCount: 0,
    data: [],
    summaryMessage: `Unsupported file format: .${extension}. Please upload .csv or .xlsx files.`
  };
}

/**
 * Download an array of objects as a CSV file
 */
export function exportToCSV(data: any[], filename: string = 'export.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
