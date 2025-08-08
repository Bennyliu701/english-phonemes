import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { level: 'asc' },
    take: 8,
  });

  return (
    <div className="section space-y-6">
      <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="!text-3xl md:!text-4xl">英语音标学习 MVP</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/lessons" className="btn-primary">查看全部课程</Link>
          {lessons[0] ? (
            <Link href={`/practice?lessonId=${lessons[0].id}`} className="btn-ghost">立即开始练习</Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <h2>精选课程</h2>
        {lessons.length === 0 ? (
          <div className="card">暂无课程，请先运行数据库迁移和种子数据。</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((l) => (
              <li key={l.id} className="card card-hover p-4">
                <div className="flex flex-col gap-2">
                  <div className="text-base font-semibold text-gray-900">{l.title}</div>
                  <div className="flex justify-end">
                    <Link href={`/practice?lessonId=${l.id}`} className="link-btn">开始练习 →</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
