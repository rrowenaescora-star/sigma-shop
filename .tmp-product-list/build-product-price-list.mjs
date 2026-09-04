import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = "C:/Users/Adelf/sigma-shop";
const csvPath = root + "/exports/bloxhop-shopify-products-php.csv";
const readmePath = root + "/exports/bloxhop-shopify-products-php-readme.txt";
const outputPath = root + "/outputs/product-price-list/bloxhop-product-price-list-usd-php.xlsx";
const previewPath = root + "/.tmp-product-list/product-price-list-preview.png";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') { value += '"'; index += 1; } else { inQuotes = !inQuotes; }
    } else if (char === "," && !inQuotes) {
      row.push(value); value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = []; value = "";
    } else {
      value += char;
    }
  }
  if (value !== "" || row.length > 0) { row.push(value); rows.push(row); }
  return rows;
}

const csvText = await fs.readFile(csvPath, "utf8");
const csvRows = parseCsv(csvText);
const headers = csvRows[0];
const records = csvRows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
const readme = await fs.readFile(readmePath, "utf8");
const rateMatch = readme.match(/USD to PHP rate used:\s*([0-9.]+)/);
if (!rateMatch) throw new Error("Could not find the PHP exchange rate.");
const phpRate = Number(rateMatch[1]);
if (!Number.isFinite(phpRate) || phpRate <= 0) throw new Error("Invalid PHP exchange rate.");

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Product Prices");
sheet.showGridLines = false;

sheet.mergeCells("A1:L1");
sheet.getRange("A1").values = [["BLOXHOP PRODUCT PRICE LIST"]];
sheet.getRange("A1:L1").format = { fill: "#0B1E2D", font: { bold: true, color: "#FFFFFF", size: 18 }, horizontalAlignment: "center", verticalAlignment: "center" };
sheet.getRange("A1:L1").format.rowHeight = 30;

sheet.getRange("A3:B4").values = [["USD to PHP rate", phpRate], ["Products listed", records.length]];
sheet.getRange("A3:A4").format = { fill: "#16344A", font: { bold: true, color: "#D9F4FF" } };
sheet.getRange("B3:B4").format = { fill: "#102A3B", font: { bold: true, color: "#FFFFFF" } };
sheet.getRange("B3").format.numberFormat = "0.0000";
sheet.getRange("B4").format.numberFormat = "#,##0";
sheet.mergeCells("D3:L4");
sheet.getRange("D3").values = [["PHP amounts are based on the rate at left. Change B3 to update the USD formula columns."]];
sheet.getRange("D3:L4").format = { fill: "#0F2A24", font: { color: "#C6F6D5", italic: true }, wrapText: true, verticalAlignment: "center" };

const headerRow = 6;
const columns = ["SKU", "Product", "Category", "Tags", "Stock Status", "Qty", "Price (USD)", "Price (PHP)", "Compare Price (USD)", "Compare Price (PHP)", "Cost (USD)", "Cost (PHP)"];
sheet.getRange("A6:L6").values = [columns];
sheet.getRange("A6:L6").format = { fill: "#126B71", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: "#3BC4C4" } };
sheet.getRange("A6:L6").format.rowHeight = 32;

const firstDataRow = headerRow + 1;
const values = records.map((record) => [
  record["Variant SKU"], record["Title"], record["Type"], record["Tags"],
  record["Status"] === "active" ? "Active" : "Draft",
  record["Variant Inventory Qty"] === "" ? null : Number(record["Variant Inventory Qty"]),
  null, record["Variant Price"] === "" ? null : Number(record["Variant Price"]),
  null, record["Variant Compare At Price"] === "" ? null : Number(record["Variant Compare At Price"]),
  null, record["Cost per item"] === "" ? null : Number(record["Cost per item"])
]);
const lastDataRow = firstDataRow + values.length - 1;
sheet.getRange("A" + firstDataRow + ":L" + lastDataRow).values = values;
sheet.getRange("G" + firstDataRow).formulas = [["=H" + firstDataRow + "/$B$3"]];
sheet.getRange("G" + firstDataRow + ":G" + lastDataRow).fillDown();
sheet.getRange("I" + firstDataRow).formulas = [["=IF(J" + firstDataRow + "=\"\",\"\",J" + firstDataRow + "/$B$3)"]];
sheet.getRange("I" + firstDataRow + ":I" + lastDataRow).fillDown();
sheet.getRange("K" + firstDataRow).formulas = [["=IF(L" + firstDataRow + "=\"\",\"\",L" + firstDataRow + "/$B$3)"]];
sheet.getRange("K" + firstDataRow + ":K" + lastDataRow).fillDown();

sheet.getRange("A" + firstDataRow + ":L" + lastDataRow).format = { borders: { insideHorizontal: { style: "thin", color: "#D6E5E8" } }, verticalAlignment: "center" };
sheet.getRange("A" + firstDataRow + ":F" + lastDataRow).format.wrapText = true;
sheet.getRange("G" + firstDataRow + ":G" + lastDataRow).format.numberFormat = '"$"#,##0.00';
sheet.getRange("H" + firstDataRow + ":H" + lastDataRow).format.numberFormat = '"₱"#,##0.00';
sheet.getRange("I" + firstDataRow + ":I" + lastDataRow).format.numberFormat = '"$"#,##0.00';
sheet.getRange("J" + firstDataRow + ":J" + lastDataRow).format.numberFormat = '"₱"#,##0.00';
sheet.getRange("K" + firstDataRow + ":K" + lastDataRow).format.numberFormat = '"$"#,##0.00';
sheet.getRange("L" + firstDataRow + ":L" + lastDataRow).format.numberFormat = '"₱"#,##0.00';
sheet.getRange("F" + firstDataRow + ":F" + lastDataRow).format.numberFormat = "#,##0";

sheet.getRange("D" + firstDataRow + ":D" + lastDataRow).conditionalFormats.add("containsText", { text: "Rare", format: { fill: "#F5E8FF", font: { color: "#86198F", bold: true } } });
sheet.getRange("D" + firstDataRow + ":D" + lastDataRow).conditionalFormats.add("containsText", { text: "New", format: { fill: "#E0F7FA", font: { color: "#0E7490", bold: true } } });

const widths = { A: 16, B: 30, C: 18, D: 25, E: 14, F: 9, G: 15, H: 15, I: 20, J: 20, K: 14, L: 14 };
for (const [column, width] of Object.entries(widths)) { sheet.getRange(column + ":" + column).format.columnWidth = width; }
sheet.freezePanes.freezeRows(headerRow);
sheet.tables.add("A" + headerRow + ":L" + lastDataRow, true, "ProductPriceTable");

const check = await workbook.inspect({ kind: "table", range: "Product Prices!A1:L12", include: "values,formulas", tableMaxRows: 12, tableMaxCols: 12 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan" });
console.log(errors.ndjson);

const preview = await workbook.render({ sheetName: "Product Prices", range: "A1:L18", scale: 1.5, format: "png" });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);