import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';

export default async function LessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { level: 'asc' },
    take: 20,
  });

  return (
    <div>
      <h2>课程列表</h2>
      {lessons.length === 0 && <p>暂无课程，请先运行数据库迁移和种子数据。</p>}
      <ul>
        {lessons.map((l) => (
          <li key={l.id}>
            <Link href={`/practice?lessonId=${l.id}`}>{l.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
