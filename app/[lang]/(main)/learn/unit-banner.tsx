import { NotebookText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: UnitBannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border-3 border-amber-400 bg-gradient-to-br from-romduol-500 via-amber-500 to-romduol-600 p-4 text-white shadow-xl">
      {/* Decorative lotus pattern */}
      <div className="absolute right-0 top-0 opacity-10">
        <svg width="150" height="150" viewBox="0 0 200 200" fill="none">
          <ellipse cx="100" cy="100" rx="80" ry="40" stroke="white" strokeWidth="2" />
          <ellipse cx="100" cy="100" rx="40" ry="80" stroke="white" strokeWidth="2" />
          <circle cx="100" cy="100" r="20" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-amber-300" />
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-sm text-amber-100">{description}</p>
        </div>

        <Link href="/lesson">
          <Button
            size="sm"
            variant="secondary"
            className="hidden border-2 border-amber-200 border-b-3 bg-white text-romduol-700 active:border-b-1 xl:flex hover:bg-amber-50"
          >
            <NotebookText className="mr-2 h-4 w-4" />
            បន្ត
          </Button>
        </Link>
      </div>
    </div>
  );
};
