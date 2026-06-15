// Generates an Excel import template per admin resource into
// `public/template/<resource>.xlsx`. Each template is a single header row
// whose columns match what `app/api/import/route.ts` expects.
//
// Run with: npm run templates:gen
// Re-run whenever the field definitions in app/[lang]/admin/resources.ts change.

import { existsSync, mkdirSync } from "fs";
import path from "path";

import * as XLSX from "xlsx";

import { RESOURCES } from "@/app/[lang]/admin/resources";

const OUT_DIR = path.join(process.cwd(), "public", "template");

const main = () => {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const resource of RESOURCES) {
    const headers = resource.fields.map((f) => f.name);

    // Header-only sheet — users fill rows beneath. Column meanings (types,
    // required/optional, allowed values) are shown in the upload dialog.
    const sheet = XLSX.utils.aoa_to_sheet([headers]);
    sheet["!cols"] = headers.map((h) => ({ wch: Math.max(12, h.length + 4) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      resource.label.slice(0, 31), // Excel sheet-name limit
    );

    const file = path.join(OUT_DIR, `${resource.name}.xlsx`);
    XLSX.writeFile(workbook, file);
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }

  console.log(`\nDone — ${RESOURCES.length} templates in public/template/`);
};

main();
