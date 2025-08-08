import { PrismaClient, Role, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Simple seed: a few phonemes and lessons/exercises
  const phonemes = await prisma.phoneme.createMany({
    data: [
      { symbol: '/i:/', type: 'vowel', tips: 'Spread lips, tense', examples: 'see, beat' },
      { symbol: '/ɪ/', type: 'vowel', tips: 'Relaxed, short', examples: 'sit, bit' },
      { symbol: '/θ/', type: 'consonant', tips: 'Tongue between teeth, voiceless', examples: 'think, thin' },
      { symbol: '/ð/', type: 'consonant', tips: 'Tongue between teeth, voiced', examples: 'this, that' },
    ],
    skipDuplicates: true,
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: 'seed-lesson-1' },
    update: {},
    create: { id: 'seed-lesson-1', title: 'Vowels: /i:/ vs /ɪ/', module: 'vowel', level: 1 },
  });

  await prisma.exercise.createMany({
    data: [
      { lessonId: lesson.id, type: ExerciseType.phoneme, targetText: '/i:/', phonemeIds: ['i:'] },
      { lessonId: lesson.id, type: ExerciseType.word, targetText: 'see', phonemeIds: ['i:'] },
      { lessonId: lesson.id, type: ExerciseType.word, targetText: 'sit', phonemeIds: ['ɪ'] },
      { lessonId: lesson.id, type: ExerciseType.sentence, targetText: 'I see a big ship.', phonemeIds: ['i:', 'ɪ'] },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
