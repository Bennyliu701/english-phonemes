import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>英语音标学习 MVP</h1>
      <p>面向初中生的 H5 在线平台（示例）。</p>
      <ul>
        <li><Link href="/lessons">课程列表</Link></li>
        <li><Link href="/practice">练习（录音+评分占位）</Link></li>
      </ul>
    </div>
  );
}
