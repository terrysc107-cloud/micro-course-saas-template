export type Answers = Record<string, string>;
export type Field = {
  key: string;
  label: string;
  hint?: string;
  type?: "textarea" | "url";
  options?: readonly string[];
  required?: boolean;
  max?: number;
};
export const APPLICATION_FIELDS: Field[] = [
  { key: "owner", label: "What should we call you?", required: true, max: 100 },
  {
    key: "business",
    label: "What is your business called?",
    required: true,
    max: 160,
  },
  {
    key: "offer",
    label: "What do you sell, and who do you help?",
    type: "textarea",
    required: true,
    max: 1500,
  },
  {
    key: "bottleneck",
    label: "What keeps coming back onto your plate?",
    hint: "Describe one recurring task or decision that takes too much of your time.",
    type: "textarea",
    required: true,
    max: 1500,
  },
  {
    key: "outcome",
    label: "What would you like working by the end of the lab?",
    type: "textarea",
    required: true,
    max: 1500,
  },
  {
    key: "experience",
    label: "How are you using AI today?",
    options: [
      "I am getting started",
      "I use chat tools regularly",
      "I have built an agent or automation",
    ],
    required: true,
  },
  {
    key: "time",
    label: "Time available for practice each week",
    options: [
      "Less than 2 hours",
      "2–4 hours",
      "4–6 hours",
      "More than 6 hours",
    ],
    required: true,
  },
];
export const INTAKE_SECTIONS: {
  title: string;
  description: string;
  fields: Field[];
}[] = [
  {
    title: "Your business",
    description: "Help us understand how work moves through your business.",
    fields: [
      {
        key: "customers",
        label: "Describe your ideal customer and the problem you solve.",
        type: "textarea",
        required: true,
      },
      {
        key: "team",
        label: "Who does the work today?",
        hint: "Your role, team members, contractors, and who can approve changes.",
        type: "textarea",
        required: true,
      },
      {
        key: "journey",
        label: "Walk us from a new inquiry to a paid customer.",
        type: "textarea",
        required: true,
      },
      {
        key: "baseline",
        label:
          "How often does your bottleneck happen, and how do you measure it?",
        hint: "Estimates are fine. Say when a number is an estimate.",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Your tools",
    description:
      "Names and access status only. Never enter passwords, API keys, or customer records.",
    fields: [
      { key: "website", label: "Website address (optional)", type: "url" },
      {
        key: "hosting",
        label: "Where is your website hosted?",
        hint: "For example: Wix, Squarespace, WordPress, Vercel, or I do not know.",
        required: true,
      },
      {
        key: "payments",
        label: "How do customers pay you?",
        hint: "For example: Stripe, Square, PayPal, invoices, or none yet.",
        required: true,
      },
      { key: "email", label: "Email and calendar tools", required: true },
      {
        key: "crm",
        label: "Where do you keep leads and customer information?",
        hint: "A CRM, a spreadsheet, your inbox, or another system.",
        required: true,
      },
      {
        key: "automation",
        label: "Other tools or automations already in use",
        type: "textarea",
      },
      {
        key: "access",
        label: "Can you administer the tools above?",
        options: [
          "Yes, I manage them",
          "Some; I need help with others",
          "A contractor or team member manages them",
          "I do not know",
        ],
        required: true,
      },
    ],
  },
  {
    title: "Your starting point",
    description: "We use this to adjust your preparation, not to grade you.",
    fields: [
      {
        key: "api",
        label: "Your experience with APIs and integrations",
        options: [
          "I do not know what an API is yet",
          "I understand the idea but have not connected one",
          "I have connected tools using an API",
          "I build or maintain integrations",
        ],
        required: true,
      },
      {
        key: "coding",
        label: "Your experience with code",
        options: [
          "None",
          "I can follow a guide",
          "I make changes with an AI coding tool",
          "I write and debug code",
        ],
        required: true,
      },
      {
        key: "device",
        label: "Computer and operating system you will use",
        hint: "For example: Mac laptop, Windows desktop. A phone alone is not sufficient for the working sessions.",
        required: true,
      },
      {
        key: "learning",
        label: "What helps you learn, and where do you usually get stuck?",
        type: "textarea",
        required: true,
      },
      {
        key: "budget",
        label: "Monthly software budget, separate from tuition",
        options: [
          "I need help estimating it",
          "Under $50",
          "$50–$150",
          "$150–$300",
          "Over $300",
        ],
        required: true,
      },
    ],
  },
  {
    title: "Your agent",
    description:
      "Define what your AI CEO should stand for and what a useful first workflow looks like.",
    fields: [
      {
        key: "values",
        label: "What standards and values must your agent reflect?",
        type: "textarea",
        required: true,
      },
      {
        key: "voice",
        label: "How should it communicate with you?",
        type: "textarea",
        required: true,
      },
      {
        key: "authority",
        label: "What must always come to you for approval?",
        hint: "For example: spending, client messages, publishing, pricing, deleting records.",
        type: "textarea",
        required: true,
      },
      {
        key: "sources",
        label: "What documents can teach it your business?",
        hint: "List document types or titles only. You can prepare sanitized copies later.",
        type: "textarea",
        required: true,
      },
      {
        key: "firstWorkflow",
        label: "Describe your first recurring workflow.",
        hint: "What starts it, what information is needed, and what should it produce?",
        type: "textarea",
        required: true,
      },
      {
        key: "restrictions",
        label: "Data or actions that must be excluded",
        type: "textarea",
        required: true,
      },
    ],
  },
];
export const INTAKE_FIELDS = INTAKE_SECTIONS.flatMap(
  (section) => section.fields,
);

export function validateAnswers(
  input: unknown,
  fields: Field[],
  complete: boolean,
): { answers: Answers; errors: Record<string, string> } {
  const answers: Answers = {},
    errors: Record<string, string> = {};
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  for (const field of fields) {
    const value =
      typeof raw[field.key] === "string"
        ? (raw[field.key] as string).trim()
        : "";
    const max = field.max ?? (field.type === "textarea" ? 2000 : 500);
    if (value.length > max)
      errors[field.key] = `Keep this answer under ${max} characters.`;
    if (complete && field.required && !value)
      errors[field.key] = "Add an answer to continue.";
    if (value && field.options && !field.options.includes(value))
      errors[field.key] = "Choose an option from the list.";
    if (value && field.type === "url" && !safeWebUrl(value))
      errors[field.key] = "Use a complete https:// or http:// website address.";
    answers[field.key] = value.slice(0, max);
  }
  return { answers, errors };
}
export function safeWebUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : fallback;
}
export type LearningPlan = {
  businessBrief: string;
  objective: string;
  assumptions: string[];
  preparation: string[];
  weeks: {
    week: number;
    objective: string;
    deliverable: string;
    acceptance: string;
  }[];
  agentCharter: string;
  operatingGuide: string;
  instructorNotes: string;
};
export function isLearningPlan(input: unknown): input is LearningPlan {
  if (!input || typeof input !== "object") return false;
  const p = input as LearningPlan;
  return (
    [p.businessBrief, p.objective, p.agentCharter, p.operatingGuide].every(
      (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 10000,
    ) &&
    typeof p.instructorNotes === "string" &&
    p.instructorNotes.length <= 10000 &&
    [p.assumptions, p.preparation].every(
      (a) =>
        Array.isArray(a) &&
        a.length <= 20 &&
        a.every((v) => typeof v === "string" && v.length <= 2000),
    ) &&
    Array.isArray(p.weeks) &&
    p.weeks.length === 4 &&
    p.weeks.every(
      (w, i) =>
        w !== null &&
        typeof w === "object" &&
        w.week === i + 1 &&
        [w.objective, w.deliverable, w.acceptance].every(
          (v) => typeof v === "string" && v.length > 0 && v.length <= 2500,
        ),
    )
  );
}
