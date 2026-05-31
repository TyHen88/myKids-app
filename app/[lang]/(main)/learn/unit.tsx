import { lessons, units } from "@/db/schema";

import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson:
  | (typeof lessons.$inferSelect & {
    unit: typeof units.$inferSelect;
  })
  | undefined;
  activeLessonPercentage: number;
};

export const Unit = ({
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: UnitProps) => {
  return (
    <div className="p-6">
      <UnitBanner title={title} description={description} />

      {/* Game map progression layout */}
      <div className="relative mt-6">
        {/* Progress path line */}
        <div className="absolute left-7 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-romduol-300" />

        <div className="space-y-6 space-x-2">
          {lessons.map((lesson, i) => {
            const isCurrent = lesson.id === activeLesson?.id;
            const isLocked = !lesson.completed && !isCurrent;

            return (
              <LessonButton
                key={lesson.id}
                id={lesson.id}
                index={i}
                totalCount={lessons.length - 1}
                current={isCurrent}
                locked={isLocked}
                percentage={activeLessonPercentage}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
