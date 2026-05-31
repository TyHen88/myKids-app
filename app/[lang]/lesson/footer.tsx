"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDictionary, useLocale } from "@/app/[lang]/lang-provider";

type FooterProps = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");
  const dict = useDictionary();
  const locale = useLocale();

  return (
    <footer
      className={cn(
        "h-[100px] border-t-2 lg:h-[140px]",
        status === "correct" && "border-transparent bg-romduol-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex items-center text-base font-bold text-romduol-600 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            {dict["lesson.nicelyDone"] || "Nicely done!"}
          </div>
        )}

        {status === "wrong" && (
          <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
            <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            {dict["lesson.tryAgain"] || "Try again."}
          </div>
        )}

        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => (window.location.href = `/${locale}/lesson/${lessonId}`)}
          >
            {dict["lesson.practiceAgain"] || "Practice again"}
          </Button>
        )}

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && (dict["lesson.check"] || "Check")}
          {status === "correct" && (dict["lesson.next"] || "Next")}
          {status === "wrong" && (dict["lesson.retry"] || "Retry")}
          {status === "completed" && (dict["lesson.continue"] || "Continue")}
        </Button>
      </div>
    </footer>
  );
};
