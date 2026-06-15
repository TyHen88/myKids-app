import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import db from "@/db/drizzle";
import * as schema from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { getResource, type FieldConfig } from "@/app/[lang]/admin/resources";

// Coerce a single Excel cell to the value the column expects.
const coerce = (field: FieldConfig, value: unknown) => {
  switch (field.type) {
    case "number":
    case "reference": {
      const n = Number(value);
      if (Number.isNaN(n))
        throw new Error(`"${field.name}" must be a number, got "${value}"`);
      return n;
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      const s = String(value).trim().toLowerCase();
      return ["true", "1", "yes", "y", "correct", "x"].includes(s);
    }
    case "select": {
      const s = String(value).trim();
      const valid = field.choices?.some((c) => c.value === s);
      if (!valid)
        throw new Error(
          `"${field.name}" must be one of ${field.choices
            ?.map((c) => c.value)
            .join(", ")} — got "${s}"`,
        );
      return s;
    }
    default:
      return String(value).trim();
  }
};

export const POST = async (req: NextRequest) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const form = await req.formData();
  const resourceName = form.get("resource");
  const file = form.get("file");

  if (typeof resourceName !== "string")
    return new NextResponse("Missing resource.", { status: 400 });

  const resource = getResource(resourceName);
  if (!resource)
    return new NextResponse(`Unknown resource "${resourceName}".`, {
      status: 400,
    });

  if (!(file instanceof File))
    return new NextResponse("Missing file.", { status: 400 });

  // Parse the first sheet into row objects keyed by header.
  let rows: Record<string, unknown>[];
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  } catch {
    return new NextResponse("Could not read the file as a spreadsheet.", {
      status: 400,
    });
  }

  if (!rows.length)
    return new NextResponse("The spreadsheet has no data rows.", {
      status: 400,
    });

  // Build typed records, validating/coercing each cell. Unknown columns
  // (and any `id` column) are ignored — append mode lets serial ids assign.
  const records: Record<string, unknown>[] = [];
  try {
    rows.forEach((raw, i) => {
      const byLowerKey: Record<string, unknown> = {};
      for (const key of Object.keys(raw))
        byLowerKey[key.trim().toLowerCase()] = raw[key];

      const record: Record<string, unknown> = {};
      for (const field of resource.fields) {
        const value = byLowerKey[field.name.toLowerCase()];
        if (value === undefined || value === null || value === "") {
          if (field.required)
            throw new Error(`Row ${i + 2}: missing "${field.name}"`);
          continue;
        }
        try {
          record[field.name] = coerce(field, value);
        } catch (err) {
          throw new Error(`Row ${i + 2}: ${(err as Error).message}`);
        }
      }
      records.push(record);
    });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 400 });
  }

  // Insert. A switch keeps each table's insert type intact.
  try {
    let inserted = 0;
    switch (resource.name) {
      case "courses":
        inserted = (
          await db
            .insert(schema.courses)
            .values(records as (typeof schema.courses.$inferInsert)[])
            .returning()
        ).length;
        break;
      case "units":
        inserted = (
          await db
            .insert(schema.units)
            .values(records as (typeof schema.units.$inferInsert)[])
            .returning()
        ).length;
        break;
      case "lessons":
        inserted = (
          await db
            .insert(schema.lessons)
            .values(records as (typeof schema.lessons.$inferInsert)[])
            .returning()
        ).length;
        break;
      case "challenges":
        inserted = (
          await db
            .insert(schema.challenges)
            .values(records as (typeof schema.challenges.$inferInsert)[])
            .returning()
        ).length;
        break;
      case "challengeOptions":
        inserted = (
          await db
            .insert(schema.challengeOptions)
            .values(records as (typeof schema.challengeOptions.$inferInsert)[])
            .returning()
        ).length;
        break;
      default:
        return new NextResponse("Unsupported resource.", { status: 400 });
    }

    return NextResponse.json({ inserted });
  } catch (err) {
    // Most likely a foreign-key violation (referenced id doesn't exist).
    return new NextResponse(
      `Import failed while inserting: ${(err as Error).message}`,
      { status: 400 },
    );
  }
};
