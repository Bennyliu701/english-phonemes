// Mock scoring service for MVP
// Replace with cloud service (e.g., Azure Pronunciation Assessment) via server-side call

export type PhonemeScore = { symbol: string; accuracy: number };

export async function scorePronunciation(
  targetText: string,
  audioUrl: string | null
): Promise<{ scoreOverall: number; phonemeScores: PhonemeScore[]; advice: string[] }> {
  // Simple deterministic mock based on text length
  const base = Math.max(50, Math.min(95, 100 - Math.floor(targetText.length / 2)));
  const phonemes = Array.from(new Set(targetText.split(' ').join('').split('')))
    .slice(0, 5)
    .map((c, i) => ({ symbol: c, accuracy: Math.max(40, base - i * 3) }));
  const advice = [
    'Keep your tongue forward for /θ/.',
    'Lengthen long vowels like /i:/.',
  ];
  return { scoreOverall: base, phonemeScores: phonemes, advice };
}
