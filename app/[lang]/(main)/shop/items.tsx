"use client";

import { useTransition } from "react";

import Image from "next/image";
import { toast } from "sonner";

import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
import { useDictionary } from "@/app/[lang]/lang-provider";

type ItemsProps = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
}: ItemsProps) => {
  const [pending, startTransition] = useTransition();
  const dict = useDictionary();

  const onRefillHearts = () => {
    if (pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL) return;

    startTransition(() => {
      refillHearts().catch(() =>
        toast.error(dict["common.somethingWentWrong"] || "Something went wrong.")
      );
    });
  };

  const onUpgrade = () => {
    toast.loading("Redirecting to checkout...");
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) window.location.href = response.data;
        })
        .catch(() =>
          toast.error(dict["common.somethingWentWrong"] || "Something went wrong.")
        );
    });
  };

  return (
    <ul className="w-full">
      <div className="flex w-full items-center gap-x-4 border-t-2 p-4">
        <Image src="/heart.svg" alt="Heart" height={60} width={60} />

        <div className="flex-1">
          <p className="text-base font-bold text-romduol-800 lg:text-xl">
            {dict["shop.refillHearts"] || "Refill hearts"}
          </p>
        </div>

        <Button
          onClick={onRefillHearts}
          disabled={
            pending ||
            hearts === MAX_HEARTS ||
            points < POINTS_TO_REFILL ||
            hasActiveSubscription
          }
          aria-disabled={
            pending ||
            hearts === MAX_HEARTS ||
            points < POINTS_TO_REFILL ||
            hasActiveSubscription
          }
        >
          {hasActiveSubscription ? (
            dict["shop.active"] || "active"
          ) : hearts === MAX_HEARTS ? (
            dict["shop.full"] || "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" height={20} width={20} />

              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>

      <div className="flex w-full items-center gap-x-4 border-t-2 p-4 pt-8">
        <Image src="/unlimited.svg" alt="Unlimited" height={60} width={60} />

        <div className="flex-1">
          <p className="text-base font-bold text-romduol-800 lg:text-xl">
            {dict["shop.unlimitedHearts"] || "Unlimited hearts"}
          </p>
        </div>

        <Button disabled>
          {dict["shop.active"] || "active"}
        </Button>
      </div>
    </ul>
  );
};
