import { getCourses, getUserProgress } from "@/db/queries";
import { getDictionary, Locale } from "../../dictionaries";

import { List } from "./list";

type Props = {
  params: Promise<{
    lang: string;
  }>;
};

const CoursesPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const coursesData = getCourses();
  const userProgressData = getUserProgress();

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ]);

  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-romduol-800">
        {dict["courses.title"] || "Language Courses"}
      </h1>

      <List courses={courses} activeCourseId={userProgress?.activeCourseId} />
    </div>
  );
};

export default CoursesPage;
