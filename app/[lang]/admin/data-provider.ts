// Thin client over the existing admin REST routes (`/api/<resource>`),
// plus the Excel import endpoint (`/api/import`). All calls are made from
// the browser; the routes enforce admin access server-side via getIsAdmin().

export type AdminRecord = Record<string, unknown> & { id: number };

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

const handle = async (res: Response) => {
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const dataProvider = {
  list: (resource: string): Promise<AdminRecord[]> =>
    fetch(`/api/${resource}`, { cache: "no-store" }).then(handle),

  getOne: (resource: string, id: number | string): Promise<AdminRecord> =>
    fetch(`/api/${resource}/${id}`, { cache: "no-store" }).then(handle),

  create: (
    resource: string,
    data: Record<string, unknown>,
  ): Promise<AdminRecord> =>
    fetch(`/api/${resource}`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then(handle),

  update: (
    resource: string,
    id: number | string,
    data: Record<string, unknown>,
  ): Promise<AdminRecord> =>
    fetch(`/api/${resource}/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then(handle),

  remove: (resource: string, id: number | string): Promise<AdminRecord> =>
    fetch(`/api/${resource}/${id}`, { method: "DELETE" }).then(handle),

  /** Bulk-append rows parsed from an Excel/CSV file. */
  importExcel: (
    resource: string,
    file: File,
  ): Promise<{ inserted: number }> => {
    const form = new FormData();
    form.append("resource", resource);
    form.append("file", file);
    return fetch(`/api/import`, { method: "POST", body: form }).then(handle);
  },
};
