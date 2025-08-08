"use client";
import { useEffect, useRef, useState } from 'react';

export default function PracticePage() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [text, setText] = useState('see the ship');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const start = async () => {
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
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    let audioBlob: Blob | null = null;
    if (audioUrl) {
      const res = await fetch(audioUrl);
      audioBlob = await res.blob();
    }
    const form = new FormData();
    form.append('targetText', text);
    if (audioBlob) form.append('audio', audioBlob, 'recording.webm');

    const r = await fetch('/api/attempts', { method: 'POST', body: form });
    const json = await r.json();
    setResult(json);
  };

  return (
    <div>
      <h2>练习（录音 + 评分占位）</h2>
      <label>
        目标文本：
        <input value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%' }} />
      </label>
      <div style={{ marginTop: 12 }}>
        {!recording ? (
          <button onClick={start}>开始录音</button>
        ) : (
          <button onClick={stop}>停止录音</button>
        )}
        {audioUrl && (
          <div style={{ marginTop: 8 }}>
            <audio src={audioUrl} controls />
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>提交评分</button>
      </div>
      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>评分结果</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
