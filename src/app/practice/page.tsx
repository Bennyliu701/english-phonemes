import { prisma } from '@/lib/prisma';
import PracticeClient from './PracticeClient';

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const lessonId = (searchParams?.lessonId as string) || '';

  if (!lessonId) {
    return (
      <div className="section">
        <div className="card space-y-2">
          <h2>练习（录音 + 评分占位）</h2>
          <p>缺少 lessonId，请从课程列表进入。</p>
        </div>
      </div>
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { exercises: true },
  });

  const exercises = (lesson?.exercises || []).map((e) => ({
    id: e.id,
    type: e.type,
    targetText: e.targetText,
    phonemeIds: e.phonemeIds,
  }));

  // Build phoneme symbol set from exercises
  const toSymbol = (s: string) => (s.startsWith('/') ? s : `/${s}/`);
  const symbolSet = new Set<string>();
  for (const e of exercises) {
    if (e.type === 'phoneme') symbolSet.add(e.targetText);
    (e.phonemeIds || []).forEach((pid: string) => symbolSet.add(toSymbol(pid)));
  }

  const phonemes = await prisma.phoneme.findMany({
    where: { symbol: { in: Array.from(symbolSet) } },
  });

  const phonemeMap = new Map(phonemes.map((p) => [p.symbol, p]));

  const rows = exercises.map((e) => {
    const symbol = e.type === 'phoneme' ? e.targetText : toSymbol((e as any).phonemeIds?.[0] || '');
    const p: any = phonemeMap.get(symbol);
    const exampleWord = (p?.examples || '').split(',')[0]?.trim() || '';
    return {
      exerciseId: e.id,
      phonemeSymbol: symbol,
      exampleWord,
    };
  });

  if (exercises.length === 0) {
    return (
      <div className="section">
        <div className="card space-y-2">
          <h2>练习（录音 + 评分占位）</h2>
          <p>该课程暂无练习。</p>
        </div>
      </div>
    );
  }

  return (
    <PracticeClient
      lessonId={lessonId}
      exercises={exercises as any}
      rows={rows}
    />
  );
}
