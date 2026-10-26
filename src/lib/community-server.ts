import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { displayName, snippet, type Answer, type QuestionSummary, type QuestionThread } from "@/lib/community";

/**
 * The Community board's database side. Who may do what:
 *
 *   • any signed-in account reads the list (title, a snippet, who and when,
 *     how many answers);
 *   • a paid account opens a thread, asks and answers.
 *
 * Seeded threads have no author row, only a name.
 */

export type Reader = { id: string; email: string; name: string; paid: boolean };

/** The signed-in reader and whether they are a member; null when signed out. */
export async function reader(): Promise<Reader | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return null;
  const access = await checkSubscription(user.email);
  return { id: user.id, email: user.email, name: displayName(user), paid: access.active };
}

const PAGE = 50;

export async function listQuestions(readerId: string): Promise<QuestionSummary[]> {
  const rows = await prisma.communityQuestion.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE,
    select: { id: true, title: true, body: true, authorName: true, authorId: true, createdAt: true, _count: { select: { answers: true } } },
  });
  return rows.map((q) => ({
    id: q.id,
    title: q.title,
    snippet: snippet(q.body),
    authorName: q.authorName,
    createdAt: q.createdAt.toISOString(),
    answers: q._count.answers,
    mine: q.authorId === readerId,
  }));
}

export async function getThread(id: string, readerId: string): Promise<QuestionThread | null> {
  const q = await prisma.communityQuestion.findUnique({
    where: { id },
    include: { answers: { orderBy: { createdAt: "asc" } } },
  });
  if (!q) return null;
  const answers: Answer[] = q.answers.map((a) => ({ id: a.id, authorName: a.authorName, body: a.body, createdAt: a.createdAt.toISOString(), mine: a.authorId === readerId }));
  return { id: q.id, title: q.title, body: q.body, authorName: q.authorName, createdAt: q.createdAt.toISOString(), answers };
}

export async function askQuestion(by: Reader, title: string, body: string): Promise<string> {
  const q = await prisma.communityQuestion.create({ data: { authorId: by.id, authorName: by.name, title, body }, select: { id: true } });
  return q.id;
}

/** Null when the question does not exist. */
export async function answerQuestion(by: Reader, questionId: string, body: string): Promise<Answer | null> {
  const exists = await prisma.communityQuestion.findUnique({ where: { id: questionId }, select: { id: true } });
  if (!exists) return null;
  const a = await prisma.communityAnswer.create({ data: { questionId, authorId: by.id, authorName: by.name, body } });
  return { id: a.id, authorName: a.authorName, body: a.body, createdAt: a.createdAt.toISOString(), mine: true };
}
