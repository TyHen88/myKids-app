"use client";

import { useState } from "react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

import { useLocale } from "../lang-provider";
import { ResourceForm } from "./components/resource-form";
import { ResourceList } from "./components/resource-list";
import { RESOURCES } from "./resources";

type View =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; id: number };

const AdminContent = () => {
  const locale = useLocale();
  const [activeName, setActiveName] = useState(RESOURCES[0].name);
  const [view, setView] = useState<View>({ kind: "list" });

  const active = RESOURCES.find((r) => r.name === activeName) ?? RESOURCES[0];

  const selectResource = (name: string) => {
    setActiveName(name);
    setView({ kind: "list" });
  };

  return (
    <div className="flex min-h-screen w-full bg-background/60">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card/70 p-4 backdrop-blur md:flex">
        <div className="mb-6 px-2">
          <h1 className="text-xl font-bold text-romduol-700">RomduolKids</h1>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Admin
          </p>
        </div>

        <nav className="space-y-1">
          {RESOURCES.map((r) => (
            <button
              key={r.name}
              onClick={() => selectResource(r.name)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                r.name === activeName
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {r.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <Link
            href={`/${locale}/learn`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-auto p-4 md:p-8">
        {/* Resource selector (mobile) */}
        <div className="mb-4 flex flex-wrap gap-2 md:hidden">
          {RESOURCES.map((r) => (
            <button
              key={r.name}
              onClick={() => selectResource(r.name)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                r.name === activeName
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {view.kind === "list" ? (
          <ResourceList
            resource={active}
            onCreate={() => setView({ kind: "create" })}
            onEdit={(id) => setView({ kind: "edit", id })}
          />
        ) : (
          <ResourceForm
            resource={active}
            id={view.kind === "edit" ? view.id : undefined}
            onDone={() => setView({ kind: "list" })}
            onCancel={() => setView({ kind: "list" })}
          />
        )}
      </main>
    </div>
  );
};

export default AdminContent;
