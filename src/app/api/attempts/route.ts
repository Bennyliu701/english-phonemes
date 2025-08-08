import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scorePronunciation } from '@/lib/scoring';

export const runtime = 'nodejs';

// List recent attempts for an exercise (demo user)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exerciseId = String(searchParams.get('exerciseId') || '').trim();
  if (!exerciseId) {
    return NextResponse.json({ error: 'exerciseId required' }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: { email: 'student@example.com', role: 'student', name: 'Student' },
  });

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, exerciseId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ attempts });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const targetText = String(form.get('targetText') || '').trim();
  const lessonId = String(form.get('lessonId') || '').trim();
  const exerciseId = String(form.get('exerciseId') || '').trim();

  if (!targetText) {
    return NextResponse.json({ error: 'targetText required' }, { status: 400 });
  }
  if (!lessonId || !exerciseId) {
    return NextResponse.json({ error: 'lessonId and exerciseId required' }, { status: 400 });
  }

  // Validate exercise belongs to lesson
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise || exercise.lessonId !== lessonId) {
    return NextResponse.json({ error: 'invalid exerciseId or mismatched lessonId' }, { status: 400 });
  }

  // In MVP, we do not store audio; in production, upload to object storage first
  const audio = form.get('audio') as File | null;
  const audioUrl = null; // placeholder

  // Mock user for MVP
  const user = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: { email: 'student@example.com', role: 'student', name: 'Student' },
  });

  // Score
  const scored = await scorePronunciation(targetText, audioUrl);

  // Create attempt
  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      exerciseId: exercise.id,
      scoreOverall: scored.scoreOverall,
      scorePhonemes: scored.phonemeScores,
      durationMs: 0,
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    scoreOverall: scored.scoreOverall,
    phonemeScores: scored.phonemeScores,
    advice: scored.advice,
  });
}
