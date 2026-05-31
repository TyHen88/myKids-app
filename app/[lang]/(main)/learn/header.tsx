"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/app/[lang]/lang-provider";

type HeaderProps = {
  title: string;
};

export const Header = ({ title }: HeaderProps) => {
  const locale = useLocale();

  return (
    <div className="sticky top-0 z-50 mb-8 overflow-hidden rounded-2xl border-4 border-romduol-400 bg-gradient-to-r from-romduol-500 via-amber-500 to-romduol-500 shadow-xl lg:mt-[-28px]">
      {/* Temple-inspired decorative top */}
      <div className="flex items-center justify-center gap-3 border-b-2 border-amber-300 bg-amber-200/30 py-2">
        <div className="h-1 w-12 bg-amber-400" />
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <div className="h-1 w-12 bg-amber-400" />
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <Link href={`/${locale}/courses`}>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full border-2 border-amber-200 bg-white/90 text-romduol-700 hover:bg-amber-100"
          >
            <ArrowLeft className="h-5 w-5 stroke-2" />
          </Button>
        </Link>

        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
          <p className="text-sm text-amber-100">មេរៀនភាសា</p>
        </div>

        <div className="w-10" aria-hidden />
      </div>
    </div>
  );
};
