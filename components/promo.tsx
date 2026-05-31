"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useDictionary, useLocale } from "@/app/[lang]/lang-provider";

export const Promo = () => {
  const dict = useDictionary();
  const locale = useLocale();

  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Pro" height={26} width={26} />

          <h3 className="text-lg font-bold">
            {dict["promo.upgradeToPro"] || "Upgrade to Pro"}
          </h3>
        </div>

        <p className="text-muted-foreground">
          {dict["promo.getUnlimitedHearts"] || "Get unlimited hearts and more!"}
        </p>
      </div>

      <Button variant="super" className="w-full" size="lg" asChild>
        <Link href={`/${locale}/shop`}>
          {dict["promo.upgradeToday"] || "Upgrade today"}
        </Link>
      </Button>
    </div>
  );
};
