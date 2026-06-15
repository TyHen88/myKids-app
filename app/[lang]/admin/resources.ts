// Shared, framework-agnostic description of every admin resource.
//
// This module is intentionally pure data (no React, no server-only imports)
// so it can be consumed by both the client admin UI (tables/forms/uploads)
// and the server-side Excel import route (`app/api/import/route.ts`).

export type FieldType = "text" | "number" | "boolean" | "select" | "reference";

export type FieldConfig = {
  /** Column name — must match the db column and the Excel header. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Options for `type: "select"`. */
  choices?: { value: string; label: string }[];
  /** Resource name this FK points at, for `type: "reference"`. */
  reference?: string;
  /** Hide from the create/edit form (still shown in the table). */
  hideInForm?: boolean;
  placeholder?: string;
};

export type ResourceConfig = {
  /** API path segment, e.g. "courses" → /api/courses. */
  name: string;
  label: string;
  /** Field used as the human label when this resource is referenced. */
  representation: string;
  fields: FieldConfig[];
  /** Field names shown as table columns (besides the always-present id). */
  columns: string[];
};

const TYPE_CHOICES = [
  { value: "SELECT", label: "SELECT" },
  { value: "ASSIST", label: "ASSIST" },
];

export const RESOURCES: ResourceConfig[] = [
  {
    name: "courses",
    label: "Courses",
    representation: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "imageSrc",
        label: "Image URL",
        type: "text",
        required: true,
        placeholder: "/kh.svg",
      },
    ],
    columns: ["title", "imageSrc"],
  },
  {
    name: "units",
    label: "Units",
    representation: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "description",
        label: "Description",
        type: "text",
        required: true,
      },
      {
        name: "courseId",
        label: "Course",
        type: "reference",
        reference: "courses",
        required: true,
      },
      { name: "order", label: "Order", type: "number", required: true },
    ],
    columns: ["title", "description", "courseId", "order"],
  },
  {
    name: "lessons",
    label: "Lessons",
    representation: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "unitId",
        label: "Unit",
        type: "reference",
        reference: "units",
        required: true,
      },
      { name: "order", label: "Order", type: "number", required: true },
    ],
    columns: ["title", "unitId", "order"],
  },
  {
    name: "challenges",
    label: "Challenges",
    representation: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        choices: TYPE_CHOICES,
        required: true,
      },
      {
        name: "lessonId",
        label: "Lesson",
        type: "reference",
        reference: "lessons",
        required: true,
      },
      { name: "order", label: "Order", type: "number", required: true },
    ],
    columns: ["question", "type", "lessonId", "order"],
  },
  {
    name: "challengeOptions",
    label: "Challenge Options",
    representation: "text",
    fields: [
      { name: "text", label: "Text", type: "text", required: true },
      { name: "correct", label: "Correct option", type: "boolean" },
      {
        name: "challengeId",
        label: "Challenge",
        type: "reference",
        reference: "challenges",
        required: true,
      },
      { name: "imageSrc", label: "Image URL", type: "text" },
      { name: "audioSrc", label: "Audio URL", type: "text" },
    ],
    columns: ["text", "correct", "challengeId", "imageSrc", "audioSrc"],
  },
];

export const getResource = (name: string): ResourceConfig | undefined =>
  RESOURCES.find((r) => r.name === name);
