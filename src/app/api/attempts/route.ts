import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { scorePronunciation } from '@/src/lib/scoring';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData();
  const targetText = String(form.get('targetText') || '').trim();
  if (!targetText) {
    return NextResponse.json({ error: 'targetText required' }, { status: 400 });
  }

  // In MVP, we do not store audio; in production, upload to object storage first
  const audio = form.get('audio') as File | null;
  const audioUrl = null; // placeholder

  // Mock user & exercise for MVP
  const [user] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: { email: 'student@example.com', role: 'student', name: 'Student' },
    }),
  ]);

  // Score
  const scored = await scorePronunciation(targetText, audioUrl);

  // Create ad-hoc exercise and attempt for demo
  const lesson = await prisma.lesson.upsert({
    where: { id: 'ad-hoc-lesson' },
    update: {},
    create: { id: 'ad-hoc-lesson', title: 'Ad-hoc Practice', module: 'vowel', level: 1 },
  });
  const exercise = await prisma.exercise.create({
    data: { lessonId: lesson.id, type: 'sentence', targetText, phonemeIds: [] },
  });
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
