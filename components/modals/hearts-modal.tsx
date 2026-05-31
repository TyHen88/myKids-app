"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { useDictionary, useLocale } from "@/app/[lang]/lang-provider";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();
  const dict = useDictionary();
  const locale = useLocale();

  useEffect(() => setIsClient(true), []);

  const onClick = () => {
    close();
    router.push(`/${locale}/shop`);
  };

  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/mascot_bad.svg"
              alt="Mascot Bad"
              height={80}
              width={80}
            />
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            {dict["heartsModal.title"] || "You ran out of hearts!"}
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            {dict["heartsModal.description"] || "Get Pro for unlimited hearts, or purchase them in the store."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onClick}
            >
              {dict["heartsModal.getUnlimited"] || "Get unlimited hearts"}
            </Button>

            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              {dict["heartsModal.noThanks"] || "No thanks"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
