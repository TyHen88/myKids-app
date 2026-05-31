"use client";

import { Award, Check, Crown, Lock, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-circular-progressbar/dist/styles.css";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
}: LessonButtonProps) => {
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  // Determine achievement icon based on progress
  let AchievementIcon;
  if (isCompleted) {
    if (index === 0) AchievementIcon = Trophy;
    else if (index % 5 === 0) AchievementIcon = Award;
    else AchievementIcon = Star;
  } else if (isLast) {
    AchievementIcon = Crown;
  } else {
    AchievementIcon = Star;
  }

  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
      className="group"
    >
      <div className="relative flex items-center gap-4">
        {/* Lesson node */}
        <div className="relative z-10 flex-shrink-0">
          {locked ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-3 border-gray-300 bg-gray-200">
              <Lock className="h-6 w-6 text-gray-400" />
            </div>
          ) : current ? (
            <div className="relative">
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: {
                    stroke: "#f59e0b",
                    strokeWidth: 8,
                  },
                  trail: {
                    stroke: "#fef3c7",
                    strokeWidth: 8,
                  },
                }}
                className="h-16 w-16"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-romduol-400 bg-gradient-to-br from-romduol-400 to-amber-500">
                  <AchievementIcon className="h-6 w-6 fill-white text-white" />
                </div>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-3 border-romduol-400 bg-gradient-to-br from-romduol-300 to-amber-400 transition-all duration-300 group-hover:scale-105">
              <AchievementIcon className="h-7 w-7 fill-white text-white" />
            </div>
          )}
        </div>

        {/* Lesson info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-romduol-800">មេរៀន {index + 1}</h3>
              {isCompleted && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-amber-600 ml-1">បានបញ្ចប់</span>
                </div>
              )}
              {current && (
                <p className="text-xs text-amber-600 mt-0.5">កំពុងរៀន • {Math.round(percentage)}%</p>
              )}
              {locked && (
                <p className="text-xs text-gray-400 mt-0.5">បានចាក់សោ</p>
              )}
            </div>
            {isCompleted && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
