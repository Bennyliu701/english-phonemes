import Link from 'next/link';

export default function Home() {
  return (
    <div className="section">
      <div className="card space-y-3">
        <h1>英语音标学习 MVP</h1>
        <p>面向初中生的 H5 在线平台（示例）。</p>
        <div className="flex gap-3 pt-2">
          <Link href="/lessons" className="btn-primary">课程列表</Link>
          <Link href="/practice" className="btn-ghost">练习（录音 + 评分占位）</Link>
        </div>
      </div>
    </div>
  );
}
