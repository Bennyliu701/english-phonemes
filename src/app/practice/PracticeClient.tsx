"use client";
import { useEffect, useRef, useState } from 'react';

type Exercise = { id: string; type: string; targetText: string };

export default function PracticeClient({
  lessonId,
  exercises,
  rows,
}: {
  lessonId: string;
  exercises: Exercise[];
  rows: { exerciseId: string; phonemeSymbol: string; exampleWord: string }[];
}) {
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [selectedId, setSelectedId] = useState<string>(exercises[0].id);
  const selected = exercises.find((e) => e.id === selectedId)!;
  const [text, setText] = useState(selected.targetText);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // keep text in sync when switching exercise
  useEffect(() => {
    const s = exercises.find((e) => e.id === selectedId);
    if (s) setText(s.targetText);
  }, [selectedId, exercises]);

  // fetch recent attempts for selected exercise
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/attempts?exerciseId=${encodeURIComponent(selectedId)}`);
        if (r.ok) {
          const json = await r.json();
          setHistory(json.attempts || []);
        } else {
          setHistory([]);
        }
      } catch {
        setHistory([]);
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e: any) {
      setError(e?.message || '无法开始录音');
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      let audioBlob: Blob | null = null;
      if (audioUrl) {
        const res = await fetch(audioUrl);
        audioBlob = await res.blob();
      }
      const form = new FormData();
      form.append('lessonId', lessonId);
      form.append('exerciseId', selectedId);
      form.append('targetText', text);
      if (audioBlob) form.append('audio', audioBlob, 'recording.webm');

      const r = await fetch('/api/attempts', { method: 'POST', body: form });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(msg || `提交失败: ${r.status}`);
      }
      const json = await r.json();
      setResult(json);
    } catch (e: any) {
      setError(e?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const u = new (window as any).SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    (window as any).speechSynthesis.cancel();
    (window as any).speechSynthesis.speak(u);
  };

  // Speak three parts: phoneme -> word (en-US), then zh meaning (zh-CN)
  const playTriple = (phoneme: string, word: string, zh: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = (window as any).speechSynthesis;
    synth.cancel();
    // English part: phoneme and word
    const uEn = new (window as any).SpeechSynthesisUtterance(`${phoneme}. ${word || ''}.`);
    uEn.lang = 'en-US';
    synth.speak(uEn);
    // Chinese part: meaning (if any)
    if (zh) {
      const uZh = new (window as any).SpeechSynthesisUtterance(zh);
      uZh.lang = 'zh-CN';
      synth.speak(uZh);
    }
  };

  // demo zh dict (简洁中文)
  const zhDict: Record<string, string> = {
    see: '看见',
    sit: '坐',
    ship: '船',
    big: '大',
  };

  // IPA -> speakable text for TTS to better approximate phoneme sound
  const phonemeSpeakMap: Record<string, string> = {
    '/i:/': 'ee', // long e
    '/ɪ/': 'ih',
    '/θ/': 'th, voiceless',
    '/ð/': 'th, voiced',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">练习（录音 + 评分占位）</h2>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">选择练习：</span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {exercises.map((e, idx) => (
            <option key={e.id} value={e.id}>
              {idx + 1}. [{e.type}] {e.targetText}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <strong className="block mb-2">练习内容</strong>
        <ul className="list-none p-0 m-0">
          {(() => {
            // 仅展示当前音标，避免重复
            const activeRow = rows.find((r) => r.exerciseId === selectedId);
            const activeSymbol = activeRow?.phonemeSymbol;
            const r0 = activeSymbol ? rows.find((r) => r.phonemeSymbol === activeSymbol) : rows[0];
            if (!r0) return null;
            const zh = zhDict[(r0.exampleWord || '').toLowerCase()] || '';
            const speakable = phonemeSpeakMap[r0.phonemeSymbol] || r0.phonemeSymbol;
              return (
                <li className="flex flex-wrap items-center gap-3">
                  <span className="text-lg">
                    音标：<span className="font-semibold">{r0.phonemeSymbol}</span>
                  </span>
                  <button
                    onClick={() => playTriple(speakable, r0.exampleWord || '', zh)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
                  >
                    播放
                  </button>
                  <span className="text-gray-500">
                    示例：{r0.exampleWord || '-'}{zh ? `（${zh}）` : ''}
                  </span>
                </li>
              );
          })()}
        </ul>
      </div>

      <label className="block">
        <span className="block mb-1 text-sm text-gray-600">目标文本：</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <div className="mt-3 space-x-2">
        {!recording ? (
          <button onClick={start} disabled={submitting} className="rounded-md bg-blue-600 px-3 py-2 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">开始录音</button>
        ) : (
          <button onClick={stop} className="rounded-md bg-red-600 px-3 py-2 text-white shadow-sm hover:bg-red-700">停止录音</button>
        )}
        {audioUrl && (
          <div className="mt-2">
            <audio src={audioUrl} controls />
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            const idx = exercises.findIndex((e) => e.id === selectedId);
            if (idx > 0) setSelectedId(exercises[idx - 1].id);
          }}
          disabled={submitting}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          上一题
        </button>
        <button
          onClick={() => {
            const idx = exercises.findIndex((e) => e.id === selectedId);
            if (idx < exercises.length - 1) setSelectedId(exercises[idx + 1].id);
          }}
          disabled={submitting}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          下一题
        </button>
        <button onClick={submit} disabled={submitting} className="rounded-md bg-green-600 px-3 py-2 text-white shadow-sm hover:bg-green-700 disabled:opacity-50">
          {submitting ? '提交中…' : '提交评分'}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-600">错误：{error}</div>
      )}

      {result && (
        <div className="mt-3">
          <h3 className="font-semibold">评分结果</h3>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded-md">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold">历史成绩（最近10次）</h3>
        {history.length === 0 ? (
          <div className="text-gray-500">暂无记录</div>
        ) : (
          <ul className="space-y-1">
            {history.map((a) => (
              <li key={a.id}>
                {new Date(a.createdAt).toLocaleString()} — 总分 {a.scoreOverall}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
