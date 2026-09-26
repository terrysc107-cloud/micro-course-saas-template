/** Editorial catalog. Cohort dates, availability and checkout prices come from the database. */
export const FOUNDATION = {
  slug: "ai-operating-company",
  title: "Your AI Operating Company",
  suggestedPriceCents: 199500,
  weeks: [
    {
      title: "Give it your business.",
      theme: "Context & identity",
      deliverable:
        "A verified business brief and an agent charter that captures your values, voice, responsibilities, and boundaries.",
      evidence:
        "The agent explains your business accurately, names what it does not know, and follows its authority limits.",
    },
    {
      title: "Build your leadership team.",
      theme: "CEO & board",
      deliverable:
        "Defined board roles and a first meeting on a real business decision.",
      evidence:
        "Recommendations cite your information, surface disagreements, and end with decisions for you.",
    },
    {
      title: "Give it standing work.",
      theme: "Memory & workflow",
      deliverable:
        "A decision log, a useful metrics file, and one recurring workflow using the tools you already have.",
      evidence:
        "A new run uses corrected information and previous decisions, and flags missing inputs.",
    },
    {
      title: "Prove you can run it.",
      theme: "Review & ownership",
      deliverable:
        "A tested operating routine, failure checklist, and a guide you can use after class.",
      evidence:
        "You demonstrate a real run, correct a bad result, and recover from a missing input.",
    },
  ],
} as const;

export const LABS = [
  {
    slug: FOUNDATION.slug,
    number: "01",
    title: FOUNDATION.title,
    category: "START HERE",
    description:
      "Give your agent an identity, teach it your business, and build your first working CEO and board.",
    outcome: "Your foundation for every lab that follows.",
    prerequisite:
      "A real business or a clearly defined offer. No coding experience required.",
    status: "foundation",
  },
  {
    slug: "content-and-brand",
    number: "02",
    title: "Your Content Engine",
    category: "CREATE",
    description:
      "Turn your expertise and brand voice into a repeatable research, drafting, and review process.",
    outcome: "An editorial workflow you can direct and approve.",
    prerequisite: "A working agent and a verified business brief.",
    status: "interest",
  },
  {
    slug: "leads-and-follow-up",
    number: "03",
    title: "Your Follow-up System",
    category: "CONNECT",
    description:
      "Connect inquiry capture, customer records, draft responses, and follow-up reminders.",
    outcome: "A tested path from inquiry to your next action.",
    prerequisite:
      "Foundation skills and access to your email and customer tools.",
    status: "interest",
  },
  {
    slug: "website-and-conversion",
    number: "04",
    title: "Your Business Front Door",
    category: "BUILD",
    description:
      "Build or improve the website that explains your offer and brings the right inquiries into your system.",
    outcome: "A clear offer, a working inquiry flow, and a way to measure it.",
    prerequisite: "A defined offer and access to your website or domain.",
    status: "interest",
  },
  {
    slug: "operations-and-reporting",
    number: "05",
    title: "Your Operations Brief",
    category: "OPERATE",
    description:
      "Bring your business information together in a useful briefing with exceptions, priorities, and clear next steps.",
    outcome: "A repeatable reporting workflow with traceable inputs.",
    prerequisite: "Foundation skills and accessible business records.",
    status: "interest",
  },
] as const;

export type LabSlug = (typeof LABS)[number]["slug"];
export const isLabSlug = (value: unknown): value is LabSlug =>
  LABS.some((lab) => lab.slug === value);
export const formatPrice = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

export const LAB_FAQ = [
  {
    question: "Do I need to code?",
    answer:
      "No. The foundation lab is designed for business owners who are new to agents. Your intake tells us which setup guides you need. Coding experience can help with later integrations, but it is not an entry requirement.",
  },
  {
    question: "What do we actually build?",
    answer:
      "An agent charter, business context files, CEO and board roles, and one recurring business workflow. You review the outputs, test failure cases, and leave with an operating guide. Advanced content, websites, and sales workflows have their own labs.",
  },
  {
    question: "How is it personalized?",
    answer:
      "After enrollment, you complete a business and tools questionnaire. AI helps draft a preparation plan and weekly objectives. Your instructor reviews the plan before you receive it, and adjusts it with you as the lab progresses.",
  },
  {
    question: "What happens between sessions?",
    answer:
      "You complete a weekly deliverable and submit notes and a link to your work. Your instructor reviews it and marks it ready or requests a revision. Plan for independent practice between the live sessions.",
  },
  {
    question: "Are software subscriptions included?",
    answer:
      "Tuition covers the lab, reviewed objectives, live sessions, and the foundation course. Third-party software, hosting, API usage, and payment processing costs are separate. Your preparation plan identifies the tools you need before you connect them.",
  },
  {
    question: "Will the agent run everything on its own?",
    answer:
      "You decide its responsibilities and approval limits. The foundation starts with a narrow workflow you can inspect and correct. You remain responsible for business decisions, published content, and actions affecting customers.",
  },
  {
    question: "When are the next labs?",
    answer:
      "Dates are published when a cohort is scheduled. Join the interest list for the topic you want next. Joining a list is free and does not reserve a paid seat.",
  },
] as const;
