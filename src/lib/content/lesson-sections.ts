/**
 * Lessons that are taken in sittings rather than in one go.
 *
 * Lesson 1 ran to 35–40 minutes and nobody finished it in one visit
 * (GA4, Sept 2026), so it is cut into three sections of about eleven
 * screens each. Since 1 Oct 2026 learners see them as three short
 * lessons ("Lesson 1 · part N"): a dashboard card each (ProgressMap), opened
 * with ?part=N, and no three-step strip on the lesson page. A section ends on a quick check, saves the learner's
 * place (ExpeditionState.sections) and shows the upgrade screen.
 *
 * Groups, for the door lesson: 0 = the name on the door, 1–4 = word sets.
 *
 *   Section 1  intro · choice · name · door · check · word set 1 · check
 *   Section 2  word sets 2 and 3, a check after each
 *   Section 3  word set 4 · check · choice · Spell It · the wall · Site Report · letter
 */

export type LessonSection = {
  title: string;
  /** One line for the resume card and the stepper */
  blurb: string;
};

export type SectionPlan = {
  sections: LessonSection[];
  /** breaksAfterGroup[i] = the group whose quick check closes section i + 1. One fewer than sections. */
  breaksAfterGroup: number[];
};

const PLANS: Record<string, SectionPlan> = {
  "expedition-begins": {
    sections: [
      { title: "The door", blurb: "Your name on the sealed door and your first three words." },
      { title: "The words", blurb: "Ten everyday words that bring in most of the alphabet." },
      { title: "The work", blurb: "The last signs, then spell, read a real wall and file your report." },
    ],
    breaksAfterGroup: [1, 3],
  },
};

export function sectionPlan(lessonId: string): SectionPlan | null {
  return PLANS[lessonId] ?? null;
}

/** The section (1-based) that finishing this group's quick check completes, or null if the lesson carries on. */
export function sectionEndingAtGroup(lessonId: string, groupIndex: number): number | null {
  const plan = PLANS[lessonId];
  if (!plan) return null;
  const i = plan.breaksAfterGroup.indexOf(groupIndex);
  return i === -1 ? null : i + 1;
}

/** The section (1-based) a group belongs to. */
export function sectionOfGroup(lessonId: string, groupIndex: number): number {
  const plan = PLANS[lessonId];
  if (!plan) return 1;
  return 1 + plan.breaksAfterGroup.filter((g) => g < groupIndex).length;
}

/** The first group of a section (1-based); section 1 starts at the intro, so 0. */
export function firstGroupOfSection(lessonId: string, section: number): number {
  const plan = PLANS[lessonId];
  if (!plan || section <= 1) return 0;
  const prev = plan.breaksAfterGroup[section - 2];
  return prev === undefined ? 0 : prev + 1;
}

/** A saved place worth offering: some sections done, but not the whole lesson. */
export function resumableSection(lessonId: string, done: number | undefined): number | null {
  const plan = PLANS[lessonId];
  if (!plan || !done || done < 1 || done >= plan.sections.length) return null;
  return done + 1;
}
