"use client";

import { useRef, useState } from "react";

import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { dataProvider } from "../data-provider";
import type { ResourceConfig } from "../resources";

type ExcelUploadProps = {
  resource: ResourceConfig;
  onImported: () => void;
};

export const ExcelUpload = ({ resource, onImported }: ExcelUploadProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setLoading(true);
    try {
      const { inserted } = await dataProvider.importExcel(resource.name, file);
      toast.success(
        `Imported ${inserted} row${inserted === 1 ? "" : "s"} into ${resource.label}.`,
      );
      setOpen(false);
      reset();
      onImported();
    } catch (err) {
      toast.error((err as Error).message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="primaryOutline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Excel
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (loading) return;
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import {resource.label} from Excel</DialogTitle>
            <DialogDescription>
              Upload a .xlsx, .xls, or .csv file whose first row is a header
              row. Rows are appended — existing data is kept.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">Expected columns</p>
                <a
                  href={`/template/${resource.name}.xlsx`}
                  download
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download template
                </a>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                {resource.fields.map((f) => (
                  <li key={f.name}>
                    <code className="rounded bg-background px-1 py-0.5 text-foreground">
                      {f.name}
                    </code>{" "}
                    — {f.type}
                    {f.required ? " (required)" : " (optional)"}
                    {f.reference ? ` · id from ${f.reference}` : ""}
                    {f.choices
                      ? ` · ${f.choices.map((c) => c.value).join(" / ")}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent"
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmit}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Import"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
