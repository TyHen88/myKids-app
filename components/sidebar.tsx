"use client";

import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useDictionary, useLocale } from "@/app/[lang]/lang-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const dict = useDictionary();
  const locale = useLocale();

  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href={`/${locale}/learn`}>
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/mascot.svg" alt="Mascot" height={40} width={40} />

          <h1 className="text-2xl font-extrabold tracking-wide text-romduol-600">
            RomduolKids
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem
          label={dict["sidebar.learn"] || "Learn"}
          href="/learn"
          iconSrc="/learn.svg"
        />
        <SidebarItem
          label={dict["sidebar.leaderboard"] || "Leaderboard"}
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem
          label={dict["sidebar.quests"] || "Quests"}
          href="/quests"
          iconSrc="/quests.svg"
        />
        <SidebarItem
          label={dict["sidebar.shop"] || "Shop"}
          href="/shop"
          iconSrc="/shop.svg"
        />
      </div>

      <div className="p-4 flex flex-col gap-y-4">
        <LanguageSwitcher />

        <div>
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>

          <ClerkLoaded>
            <UserButton
              appearance={{
                elements: { userButtonPopoverCard: { pointerEvents: "initial" } },
              }}
            />
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
};
