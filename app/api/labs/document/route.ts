import {
  labUser,
  paidApplication,
  LabError,
  labResponseError,
} from "@/lib/labs/server";
export async function GET(request: Request) {
  try {
    const user = await labUser();
    const app = await paidApplication(
      new URL(request.url).searchParams.get("applicationId"),
      user.id,
    );
    const p = app.published_plan;
    if (!p || app.published_revision !== app.intake_revision)
      throw new LabError(
        "Your current plan is awaiting instructor review.",
        409,
      );
    const text = [
      `# ${app.answers.business} — Build Lab guides`,
      `Reviewed ${app.published_at?.slice(0, 10)}`,
      "## Business brief",
      p.businessBrief,
      "## Your objective",
      p.objective,
      "## Preparation",
      ...p.preparation.map((s) => `- ${s}`),
      "## Assumptions to confirm",
      ...p.assumptions.map((s) => `- ${s}`),
      ...p.weeks.flatMap((w) => [
        `## Week ${w.week}: ${w.objective}`,
        w.deliverable,
        `Ready when: ${w.acceptance}`,
      ]),
      "## Agent charter",
      p.agentCharter,
      "## Operating guide",
      p.operatingGuide,
    ].join("\n\n");
    return new Response(text, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": "attachment; filename=build-lab-guides.md",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return labResponseError(error);
  }
}
