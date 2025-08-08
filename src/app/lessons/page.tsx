import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function LessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { level: 'asc' },
    take: 20,
  });

  return (
    <div className="section">
      <div className="card space-y-4">
        <h2>课程列表</h2>
        {lessons.length === 0 && (
          <p>暂无课程，请先运行数据库迁移和种子数据。</p>
        )}
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {lessons.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
              <div className="text-gray-900 font-medium">{l.title}</div>
              <Link className="link-btn" href={`/practice?lessonId=${l.id}`}>
                去练习 →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
