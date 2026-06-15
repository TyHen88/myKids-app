"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { dataProvider, type AdminRecord } from "../data-provider";
import {
  getResource,
  type FieldConfig,
  type ResourceConfig,
} from "../resources";
import { ExcelUpload } from "./excel-upload";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ResourceListProps = {
  resource: ResourceConfig;
  onCreate: () => void;
  onEdit: (id: number) => void;
};

export const ResourceList = ({
  resource,
  onCreate,
  onEdit,
}: ResourceListProps) => {
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refMaps, setRefMaps] = useState<
    Record<string, Record<string, string>>
  >({});
  const [deleting, setDeleting] = useState<AdminRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const columnFields = useMemo(
    () =>
      resource.columns
        .map((name) => resource.fields.find((f) => f.name === name))
        .filter((f): f is FieldConfig => Boolean(f)),
    [resource],
  );
  const referenceFields = useMemo(
    () => resource.fields.filter((f) => f.type === "reference"),
    [resource],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dataProvider.list(resource.name);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error((err as Error).message || "Failed to load.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [resource.name]);

  useEffect(() => {
    load();
  }, [load]);

  // Build id → label maps so FK columns show a name, not just a number.
  useEffect(() => {
    let active = true;
    Promise.all(
      referenceFields.map(async (f) => {
        const ref = getResource(f.reference!);
        if (!ref) return [f.name, {}] as const;
        const data = await dataProvider.list(ref.name).catch(() => []);
        const map: Record<string, string> = {};
        for (const r of data)
          map[String(r.id)] = String(r[ref.representation] ?? `#${r.id}`);
        return [f.name, map] as const;
      }),
    ).then((entries) => {
      if (active) setRefMaps(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [referenceFields]);

  // Jump back to the first page when switching resources.
  useEffect(() => {
    setPage(0);
  }, [resource.name]);

  // Keep the current page valid as the row count / page size changes
  // (e.g. after a delete empties the last page).
  useEffect(() => {
    setPage((p) =>
      Math.min(p, Math.max(0, Math.ceil(rows.length / pageSize) - 1)),
    );
  }, [rows.length, pageSize]);

  const onConfirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await dataProvider.remove(resource.name, deleting.id);
      toast.success("Deleted.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error((err as Error).message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  const renderCell = (row: AdminRecord, field: FieldConfig) => {
    const value = row[field.name];

    if (field.type === "boolean")
      return (
        <span
          className={
            value
              ? "inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {value ? "Yes" : "No"}
        </span>
      );

    if (field.type === "reference") {
      if (value === null || value === undefined)
        return <span className="text-muted-foreground">—</span>;
      const label = refMaps[field.name]?.[String(value)];
      return (
        <span>
          {label ?? "?"}{" "}
          <span className="text-muted-foreground">#{String(value)}</span>
        </span>
      );
    }

    if (value === null || value === undefined || value === "")
      return <span className="text-muted-foreground">—</span>;

    return <span className="line-clamp-1 max-w-[28ch]">{String(value)}</span>;
  };

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  const firstRow = rows.length === 0 ? 0 : page * pageSize + 1;
  const lastRow = Math.min((page + 1) * pageSize, rows.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-romduol-800">
            {resource.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${rows.length} record${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
          <ExcelUpload resource={resource} onImported={load} />
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              {columnFields.map((f) => (
                <TableHead key={f.name}>{f.label}</TableHead>
              ))}
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columnFields.length + 2}
                  className="h-24 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnFields.length + 2}
                  className="h-24 text-center text-muted-foreground"
                >
                  No records yet.
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onEdit(row.id)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.id}
                  </TableCell>
                  {columnFields.map((f) => (
                    <TableCell key={f.name}>{renderCell(row, f)}</TableCell>
                  ))}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.id)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="dangerOutline"
                        size="icon"
                        onClick={() => setDeleting(row)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-9 w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {firstRow}–{lastRow} of {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[6rem] text-center text-muted-foreground">
                Page {page + 1} of {pageCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={!!deleting}
        onOpenChange={(next) => {
          if (!busy && !next) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              {resource.label} #{deleting?.id} will be permanently removed. Rows
              that reference it may be deleted too (cascade). This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleting(null)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onConfirmDelete}
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
