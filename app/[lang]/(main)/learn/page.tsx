import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

import { Header } from "./header";
import { Unit } from "./unit";

type Props = {
  params: Promise<{
    lang: string;
  }>;
};

const LearnPage = async ({ params }: Props) => {
  const { lang } = await params;
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,
  ]);

  if (!courseProgress || !userProgress || !userProgress.activeCourse)
    redirect(`/${lang}/courses`);

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-romduol-50 via-amber-50 to-romduol-100">
      {/* Decorative Khmer pattern background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L45 15 L37 22 L40 32 L30 26 L20 32 L23 22 L15 15 L25 15 Z' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative flex flex-row-reverse gap-[48px] px-6 py-8">
        <StickyWrapper>
          <div className="rounded-2xl border-4 border-romduol-300 bg-white/90 backdrop-blur-sm shadow-xl">
            <div className="border-b-4 border-romduol-400 bg-gradient-to-r from-romduol-500 to-amber-500 p-4">
              <h2 className="text-center text-xl font-bold text-white">ការរីកចម្រើន</h2>
            </div>
            <UserProgress
              activeCourse={userProgress.activeCourse}
              hearts={userProgress.hearts}
              points={userProgress.points}
              hasActiveSubscription={isPro}
            />
            {!isPro && <Promo />}
            <Quests points={userProgress.points} />
          </div>
        </StickyWrapper>

        <div className="flex-1">
          <Header title={userProgress.activeCourse.title} />
          {units.map((unit, unitIndex) => (
            <div key={unit.id} className="mb-12">
              <div className="relative overflow-hidden rounded-2xl border-4 border-romduol-400 bg-white shadow-2xl">
                {/* Temple-inspired decorative header */}
                <div className="bg-gradient-to-r from-romduol-600 via-amber-500 to-romduol-600 p-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-8 bg-amber-300" />
                    <div className="h-3 w-3 rounded-full bg-amber-200" />
                    <div className="h-2 w-8 bg-amber-300" />
                  </div>
                </div>

                <Unit
                  id={unit.id}
                  order={unit.order}
                  description={unit.description}
                  title={unit.title}
                  lessons={unit.lessons}
                  activeLesson={courseProgress.activeLesson}
                  activeLessonPercentage={lessonPercentage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
