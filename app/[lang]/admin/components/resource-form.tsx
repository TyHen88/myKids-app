"use client";

import { useEffect, useMemo, useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { dataProvider } from "../data-provider";
import {
  getResource,
  type FieldConfig,
  type ResourceConfig,
} from "../resources";

type Option = { value: string; label: string };

const singular = (label: string) =>
  label.endsWith("s") ? label.slice(0, -1) : label;

type FieldProps = {
  field: FieldConfig;
  value: unknown;
  options: Option[];
  onChange: (value: unknown) => void;
};

const Field = ({ field, value, options, onChange }: FieldProps) => {
  const id = `field-${field.name}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <Label htmlFor={id}>{field.label}</Label>
      </div>
    );
  }

  const labelEl = (
    <Label htmlFor={id}>
      {field.label}
      {field.required && <span className="text-destructive"> *</span>}
    </Label>
  );

  if (field.type === "select" || field.type === "reference") {
    const items = field.type === "select" ? (field.choices ?? []) : options;
    const selected =
      value === undefined || value === null || value === ""
        ? undefined
        : String(value);

    return (
      <div className="space-y-1.5">
        {labelEl}
        <Select value={selected} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {items.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options
              </div>
            ) : (
              items.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                  {field.type === "reference" && (
                    <span className="text-muted-foreground"> #{o.value}</span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {labelEl}
      <Input
        id={id}
        type={field.type === "number" ? "number" : "text"}
        placeholder={field.placeholder}
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

type ResourceFormProps = {
  resource: ResourceConfig;
  id?: number;
  onDone: () => void;
  onCancel: () => void;
};

export const ResourceForm = ({
  resource,
  id,
  onDone,
  onCancel,
}: ResourceFormProps) => {
  const isEdit = id !== undefined;
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [refOptions, setRefOptions] = useState<Record<string, Option[]>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const referenceFields = useMemo(
    () => resource.fields.filter((f) => f.type === "reference"),
    [resource],
  );

  // Populate <Select> options for each reference (FK) field.
  useEffect(() => {
    let active = true;
    Promise.all(
      referenceFields.map(async (f) => {
        const ref = getResource(f.reference!);
        if (!ref) return [f.name, [] as Option[]] as const;
        const rows = await dataProvider.list(ref.name).catch(() => []);
        const opts = rows.map((r) => ({
          value: String(r.id),
          label: String(r[ref.representation] ?? `#${r.id}`),
        }));
        return [f.name, opts] as const;
      }),
    ).then((entries) => {
      if (active) setRefOptions(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [referenceFields]);

  // Prefill when editing.
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoading(true);
    dataProvider
      .getOne(resource.name, id!)
      .then((rec) => {
        if (active) setValues(rec ?? {});
      })
      .catch(() => toast.error("Could not load record."))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEdit, resource.name, id]);

  const setField = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    const payload: Record<string, unknown> = {};

    for (const f of resource.fields) {
      const v = values[f.name];

      if (f.type === "boolean") {
        payload[f.name] = !!v;
        continue;
      }

      const empty = v === undefined || v === null || String(v).trim() === "";
      if (empty) {
        if (f.required) {
          toast.error(`${f.label} is required.`);
          return;
        }
        // Allow clearing an optional field when editing.
        if (isEdit) payload[f.name] = null;
        continue;
      }

      payload[f.name] =
        f.type === "number" || f.type === "reference"
          ? Number(v)
          : String(v).trim();
    }

    setSaving(true);
    try {
      if (isEdit) await dataProvider.update(resource.name, id!, payload);
      else await dataProvider.create(resource.name, payload);
      toast.success(isEdit ? "Saved." : "Created.");
      onDone();
    } catch (err) {
      toast.error((err as Error).message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEdit
            ? `Edit ${singular(resource.label)} #${id}`
            : `New ${singular(resource.label)}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {resource.fields.map((f) => (
          <Field
            key={f.name}
            field={f}
            value={values[f.name]}
            options={refOptions[f.name] ?? []}
            onChange={(v) => setField(f.name, v)}
          />
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              "Save"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
