import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { mapQuizForFrontend } from '../lib/mappers.js';
import { requireAuth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyValid = apiKey && (apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.')) && apiKey !== 'your-gemini-api-key-here' && apiKey.trim() !== '';
const genAI = isApiKeyValid ? new GoogleGenerativeAI(apiKey) : null;
const quizModels = Array.from(
  new Set([process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(Boolean))
);

interface AIQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const legacyFallback: AIQuestion[] = [
  {
    question: "What is the determinant of a 2x2 identity matrix?",
    options: ["1", "0", "-1", "2"],
    correctAnswerIndex: 0,
    explanation: "An identity matrix has 1s on its diagonal. Its determinant is 1."
  },
  {
    question: "If det(A) = 0, the matrix A is defined as:",
    options: ["Singular", "Non-singular", "Invertible", "Symmetric"],
    correctAnswerIndex: 0,
    explanation: "A matrix with a determinant of zero is called singular and lacks an inverse."
  },
  {
    question: "For a square matrix A, which operation yields the identity matrix?",
    options: ["A * A⁻¹", "A + A", "A - A", "A * A"],
    correctAnswerIndex: 0,
    explanation: "Multiplying a matrix by its inverse yields the identity matrix: A * A⁻¹ = I."
  },
  {
    question: "What is the transpose of a symmetric matrix A?",
    options: ["A", "-A", "A⁻¹", "Aᵀ"],
    correctAnswerIndex: 0,
    explanation: "A matrix A is symmetric if it is equal to its transpose: Aᵀ = A."
  },
  {
    question: "For any square matrix A, which of the following is always a symmetric matrix?",
    options: ["A + Aᵀ", "A - Aᵀ", "Aᵀ", "A²"],
    correctAnswerIndex: 0,
    explanation: "Adding a matrix and its transpose always produces a symmetric matrix: (A + Aᵀ)ᵀ = Aᵀ + A = A + Aᵀ."
  },
  {
    question: "A square matrix in which all non-diagonal elements are zero is called a:",
    options: ["Diagonal matrix", "Row matrix", "Column matrix", "Scalar matrix"],
    correctAnswerIndex: 0,
    explanation: "A diagonal matrix is a square matrix whose non-diagonal entries are all zero."
  },
  {
    question: "What is the rank of a 3x3 identity matrix?",
    options: ["3", "1", "0", "9"],
    correctAnswerIndex: 0,
    explanation: "The identity matrix of order 3 has 3 linearly independent rows, so its rank is 3."
  },
  {
    question: "Which of the following is the formula for the inverse of a matrix A?",
    options: ["adj(A) / det(A)", "det(A) * adj(A)", "adj(A) * det(A)", "Aᵀ / det(A)"],
    correctAnswerIndex: 0,
    explanation: "The inverse of matrix A is given by adj(A) / det(A), where det(A) != 0."
  },
  {
    question: "If matrix A is of order 3x2 and matrix B is of order 2x4, what is the order of matrix AB?",
    options: ["3x4", "2x2", "3x2", "Incompatible"],
    correctAnswerIndex: 0,
    explanation: "Multiplying (m x n) by (n x p) results in a matrix of order (m x p). Here, (3x2) * (2x4) yields 3x4."
  },
  {
    question: "What is the trace of a square matrix?",
    options: ["The sum of its diagonal elements", "The product of its diagonal elements", "The determinant of the matrix", "The sum of all its elements"],
    correctAnswerIndex: 0,
    explanation: "The trace of a square matrix is defined as the sum of elements on its main diagonal."
  }
];

async function generateQuestionsWithAI(subjectName: string, chapterName: string, topicName: string): Promise<AIQuestion[] | null> {
  const prompt = `You are a curriculum expert and assessment specialist.
Generate exactly 10 multiple-choice questions (MCQs) for the topic "${topicName}" under the chapter "${chapterName}" in the subject "${subjectName}".
Each question must have exactly 4 options.
The questions must be highly relevant and cover different concepts of "${topicName}" at varying difficulties (4 Easy, 4 Medium, 2 Hard).
Do not generate questions on general or unrelated concepts. Focus strictly on "${topicName}".
Respond ONLY with a valid JSON array of objects. Do not include markdown code block wraps (like \`\`\`json) or any preambles or explanations outside the JSON itself.
JSON format:
[
  {
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswerIndex": 0,
    "explanation": "short explanation of why the correct option is right"
  }
]`;

  const queryPollinations = async (): Promise<string | null> => {
    try {
      console.log('Attempting Pollinations AI quiz generation fallback...');
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "system",
              content: "You are an expert curriculum writer. Respond ONLY with a valid JSON array containing exactly 10 multiple choice questions. No explanations, no markdown blocks, no markdown formatting."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          console.log('✅ Pollinations AI quiz generation succeeded.');
          return text;
        }
      } else {
        console.warn(`Pollinations AI quiz generation returned non-ok status: ${response.status}`);
      }
    } catch (err) {
      console.error("Pollinations AI quiz generation failed:", err);
    }
    return null;
  };

  let responseText: string | null = null;

  if (genAI) {
    for (const modelName of quizModels) {
      try {
        console.log(`Attempting Gemini model ${modelName} for quiz generation...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim().length > 0) {
          responseText = text;
          break;
        }
      } catch (err: any) {
        console.warn(`Gemini model ${modelName} failed for quiz generation: ${err.message}`);
      }
    }
  }

  if (!responseText) {
    responseText = await queryPollinations();
  }

  if (responseText) {
    try {
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
      }
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length === 10) {
        // Validate each question structure briefly
        const isValid = parsed.every(q => 
          typeof q.question === 'string' &&
          Array.isArray(q.options) && q.options.length === 4 &&
          typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4
        );
        if (isValid) {
          return parsed as AIQuestion[];
        } else {
          console.warn("AI returned JSON array, but it did not have the required structure/elements.");
        }
      } else {
        console.warn(`AI returned JSON, but length was ${Array.isArray(parsed) ? parsed.length : 'not an array'}`);
      }
    } catch (err) {
      console.error("Failed to parse AI response for quiz generation:", err);
    }
  }

  return null;
}


router.get('/quizzes/:quizId', async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.quizId },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  res.json(mapQuizForFrontend(quiz));
});
function getCategoryKey(subjectName: string, chapterName: string, topicName: string): string {
  const cleanSubject = subjectName.toLowerCase();
  const cleanChapter = chapterName.toLowerCase();
  const cleanTopic = topicName.toLowerCase();

  if (cleanSubject.includes("math")) {
    if (
      cleanChapter.includes("set") ||
      cleanChapter.includes("relation") ||
      cleanChapter.includes("function") ||
      cleanTopic.includes("set") ||
      cleanTopic.includes("relation") ||
      cleanTopic.includes("function")
    ) {
      return "math-sets";
    }
    if (
      cleanChapter.includes("complex") ||
      cleanTopic.includes("complex")
    ) {
      return "math-complex";
    }
    if (
      cleanChapter.includes("matrix") ||
      cleanChapter.includes("determinant") ||
      cleanTopic.includes("matrix") ||
      cleanTopic.includes("determinant")
    ) {
      return "math-matrix";
    }
    if (
      cleanChapter.includes("ordinary differential") ||
      cleanTopic.includes("ordinary differential") ||
      cleanChapter.includes("differential equation") ||
      cleanTopic.includes("differential equation")
    ) {
      return "math-equations";
    }
    if (
      cleanChapter.includes("equation") ||
      cleanTopic.includes("equation") ||
      cleanChapter.includes("algebra") ||
      cleanTopic.includes("algebra")
    ) {
      if (cleanChapter.includes("basic") || cleanTopic.includes("real")) {
        return "math-numbers";
      }
      return "math-algebra";
    }
    if (
      cleanChapter.includes("geometry") ||
      cleanChapter.includes("vector") ||
      cleanChapter.includes("locus") ||
      cleanChapter.includes("conic") ||
      cleanChapter.includes("line") ||
      cleanTopic.includes("geometry") ||
      cleanTopic.includes("vector") ||
      cleanTopic.includes("locus") ||
      cleanTopic.includes("conic") ||
      cleanTopic.includes("line")
    ) {
      return "math-geometry";
    }
    if (
      cleanChapter.includes("trig") ||
      cleanTopic.includes("trig")
    ) {
      return "math-trig";
    }
    if (
      cleanChapter.includes("calculus") ||
      cleanChapter.includes("limit") ||
      cleanChapter.includes("diff") ||
      cleanTopic.includes("calculus") ||
      cleanTopic.includes("limit") ||
      cleanTopic.includes("diff")
    ) {
      return "math-calculus";
    }
    if (
      cleanChapter.includes("combinat") ||
      cleanChapter.includes("induction") ||
      cleanChapter.includes("count") ||
      cleanTopic.includes("combinat") ||
      cleanTopic.includes("induction") ||
      cleanTopic.includes("count")
    ) {
      return "math-combinatorics";
    }
    if (
      cleanChapter.includes("stat") ||
      cleanChapter.includes("prob") ||
      cleanChapter.includes("mensur") ||
      cleanTopic.includes("stat") ||
      cleanTopic.includes("prob") ||
      cleanTopic.includes("mensur")
    ) {
      return "math-stats";
    }
    return "math-numbers";
  }

  const isPhysics = cleanSubject.includes("physics") || cleanChapter.includes("physics") || cleanTopic.includes("physics") || cleanChapter.includes("phys") || cleanTopic.includes("phys");
  const isChemistry = cleanSubject.includes("chemistry") || cleanSubject.includes("chem") || cleanChapter.includes("chemistry") || cleanTopic.includes("chemistry") || cleanChapter.includes("chem") || cleanTopic.includes("chem");
  const isBiology = cleanSubject.includes("biology") || cleanSubject.includes("bio") || cleanChapter.includes("biology") || cleanTopic.includes("biology") || cleanChapter.includes("bio") || cleanTopic.includes("bio");

  if (isPhysics || cleanChapter.includes("electro") || cleanChapter.includes("electri") || cleanChapter.includes("magnet") || cleanChapter.includes("induction") || cleanTopic.includes("electro") || cleanTopic.includes("electri") || cleanTopic.includes("magnet") || cleanTopic.includes("induction")) {
    if (cleanChapter.includes("electro") || cleanChapter.includes("electri") || cleanChapter.includes("magnet") || cleanTopic.includes("electro") || cleanTopic.includes("electri") || cleanTopic.includes("magnet")) {
      return "science-physics-electro";
    }
    if (cleanChapter.includes("optic") || cleanChapter.includes("acoust") || cleanChapter.includes("sound") || cleanChapter.includes("wave") || cleanTopic.includes("optic") || cleanTopic.includes("acoust") || cleanTopic.includes("sound") || cleanTopic.includes("wave")) {
      return "science-physics-optics";
    }
    return "science-physics-motion";
  }

  if (isChemistry || cleanChapter.includes("metall") || cleanTopic.includes("metall")) {
    if (cleanChapter.includes("metall") || cleanTopic.includes("metall")) {
      return "science-chemistry-metallurgy";
    }
    if (cleanChapter.includes("organic") || cleanChapter.includes("carbon") || cleanChapter.includes("biomolec") || cleanTopic.includes("organic") || cleanTopic.includes("carbon") || cleanTopic.includes("biomolec")) {
      return "science-chemistry-organic";
    }
    if (cleanChapter.includes("reaction") || cleanChapter.includes("acid") || cleanChapter.includes("base") || cleanChapter.includes("salt") || cleanChapter.includes("equilibrium") || cleanChapter.includes("electrochem") || cleanTopic.includes("reaction") || cleanTopic.includes("acid") || cleanTopic.includes("base") || cleanTopic.includes("salt") || cleanTopic.includes("equilibrium") || cleanTopic.includes("electrochem")) {
      return "science-chemistry-physical";
    }
    return "science-chemistry-bonding";
  }

  if (isBiology) {
    if (cleanChapter.includes("cell") || cleanChapter.includes("tissu") || cleanChapter.includes("morphol") || cleanTopic.includes("cell") || cleanTopic.includes("tissu") || cleanTopic.includes("morphol")) {
      return "science-biology-cell";
    }
    if (cleanChapter.includes("health") || cleanChapter.includes("ill") || cleanChapter.includes("disease") || cleanTopic.includes("health") || cleanTopic.includes("ill") || cleanTopic.includes("disease")) {
      return "science-biology-health";
    }
    if (cleanChapter.includes("ecolog") || cleanChapter.includes("environ") || cleanChapter.includes("resource") || cleanChapter.includes("divers") || cleanTopic.includes("ecolog") || cleanTopic.includes("environ") || cleanTopic.includes("resource") || cleanTopic.includes("divers")) {
      return "science-biology-ecology";
    }
    return "science-biology-genetics";
  }

  return "science-physics-motion";
}

async function getQuestionsForTopic(subjectName: string, chapterName: string, topicName: string, topicId?: string) {
  // Try generating questions with AI first
  const aiQuestions = await generateQuestionsWithAI(subjectName, chapterName, topicName);
  if (aiQuestions && aiQuestions.length === 10) {
    return aiQuestions;
  }

  try {
    const questionsPath = path.join(process.cwd(), 'server', 'data', 'question-bank.json');
    if (fs.existsSync(questionsPath)) {
      const fileContent = fs.readFileSync(questionsPath, 'utf-8');
      const db = JSON.parse(fileContent);

      let topicQuestions: any[] = [];

      if (topicId) {
        const topicKey = topicId;
        const cleanTopicKey = topicName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        if (db[topicKey]) {
          topicQuestions = db[topicKey];
        } else if (db[cleanTopicKey]) {
          topicQuestions = db[cleanTopicKey];
        }
      }

      // If we found specific topic questions, let's use them as our base
      // If we don't have enough (we need 10), we fall back to category questions
      const catKey = getCategoryKey(subjectName, chapterName, topicName);
      const allCatQuestions = db[catKey] || [];

      let pool = topicQuestions.length > 0 ? topicQuestions : allCatQuestions;

      if (topicId && pool === allCatQuestions) {
        // Find the topic's relative index within its siblings to partition the questions
        const topic = await prisma.topic.findUnique({
          where: { id: topicId },
          select: { chapterId: true }
        });

        if (topic) {
          const siblingTopics = await prisma.topic.findMany({
            where: { chapterId: topic.chapterId },
            orderBy: { sortOrder: 'asc' }
          });
          const topicIndex = siblingTopics.findIndex(t => t.id === topicId);

          // Slice non-overlapping sets of 10 questions per topic
          const questionsPerTopic = 10;
          const start = Math.max(0, topicIndex) * questionsPerTopic;
          
          let sliced = allCatQuestions.slice(start, start + questionsPerTopic);
          if (sliced.length > 0) {
            pool = sliced;
          }
        }
      }

      // Ensure we have exactly 10 questions
      if (pool.length === 10) {
        return pool;
      }

      // If we have more or less, pad or slice to exactly 10
      const finalQuestions = pool.slice(0, 10);
      let backupPool = allCatQuestions.filter((q: any) => !finalQuestions.some((fq: any) => fq.question === q.question));
      if (backupPool.length === 0) {
        backupPool = allCatQuestions.length > 0 ? allCatQuestions : legacyFallback;
      }
      
      while (finalQuestions.length < 10) {
        const item = backupPool[finalQuestions.length % backupPool.length];
        if (item) {
          finalQuestions.push(item);
        } else {
          // Fallback to legacy hardcoded ones if nothing else exists
          finalQuestions.push(legacyFallback[finalQuestions.length % legacyFallback.length]);
        }
      }

      return finalQuestions;
    }
  } catch (err) {
    console.error('Failed to load questions from question-bank.json:', err);
  }

  // Fallback to legacy hardcoded matrices list if file reading fails
  return legacyFallback;
}

router.get('/topics/:topicId/quizzes', async (req, res) => {
  const topicId = req.params.topicId;
  let quizzes = await prisma.quiz.findMany({
    where: { topicId },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  // If a quiz already exists but has fewer than 10 questions, delete it so it gets regenerated with exactly 10 questions!
  const invalidQuizzes = quizzes.filter((q) => q.questions.length < 10);
  if (invalidQuizzes.length > 0) {
    console.log(`Found ${invalidQuizzes.length} quizzes for topic ${topicId} with fewer than 10 questions. Deleting to regenerate...`);
    for (const q of invalidQuizzes) {
      await prisma.quiz.delete({ where: { id: q.id } });
    }
    quizzes = []; // Set quizzes to empty so the regeneration block below runs
  }

  if (quizzes.length === 0) {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          chapter: {
            include: {
              unit: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });

      if (topic) {
        const questionsToCreate = await getQuestionsForTopic(
          topic.chapter.unit.subject.name,
          topic.chapter.name,
          topic.name,
          topic.id
        );

        const newQuiz = await prisma.quiz.create({
          data: {
            title: `${topic.name} Assessment`,
            description: `Assessment questions for topic: ${topic.name}`,
            topicId: topic.id,
            passingScore: 40.0,
            timeLimitMinutes: 10,
          }
        });

        for (let i = 0; i < questionsToCreate.length; i++) {
          const q = questionsToCreate[i];
          const question = await prisma.quizQuestion.create({
            data: {
              quizId: newQuiz.id,
              questionText: q.question,
              questionType: 'MCQ',
              marks: 1.0,
              sortOrder: i,
            }
          });

          await prisma.quizOption.createMany({
            data: q.options.map((opt: string, idx: number) => ({
              questionId: question.id,
              optionText: opt,
              isCorrect: idx === q.correctAnswerIndex,
              sortOrder: idx,
            }))
          });
        }

        const createdQuiz = await prisma.quiz.findUnique({
          where: { id: newQuiz.id },
          include: {
            questions: {
              orderBy: { sortOrder: 'asc' },
              include: {
                options: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        });

        if (createdQuiz) {
          quizzes = [createdQuiz];
        }
      }
    } catch (err) {
      console.error('Failed to auto-seed quiz in database:', err);
    }
  }

  res.json(quizzes.map(mapQuizForFrontend));
});

router.post('/quizzes/:quizId/attempt', requireAuth, async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: req.auth!.userId } });
  if (!student) {
    return res.status(403).json({ error: 'Student profile required' });
  }

  const responses = (req.body.responses ?? []) as Array<{
    questionId: string;
    selectedOptionId?: string;
  }>;

  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.quizId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const previousAttempts = await prisma.quizAttempt.count({
    where: { studentId: student.id, quizId: quiz.id },
  });

  let score = 0;
  const totalMarks = quiz.questions.reduce((sum, question) => sum + question.marks, 0);

  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId: student.id,
      quizId: quiz.id,
      attemptNumber: previousAttempts + 1,
      completedAt: new Date(),
    },
  });

  for (const response of responses) {
    const question = quiz.questions.find((item) => item.id === response.questionId);
    if (!question) continue;

    const selectedOption = question.options.find((option) => option.id === response.selectedOptionId);
    const isCorrect = Boolean(selectedOption?.isCorrect);
    if (isCorrect) score += question.marks;

    await prisma.quizQuestionResponse.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: response.selectedOptionId,
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
      },
    });
  }

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const passed = percentage >= quiz.passingScore;

  await prisma.quizAttempt.update({
    where: { id: attempt.id },
    data: { score, passed },
  });

  const result = await prisma.quizResult.create({
    data: {
      attemptId: attempt.id,
      studentId: student.id,
      quizId: quiz.id,
      score,
      percentage,
      passed,
    },
  });

  res.json({
    quizId: quiz.id,
    title: quiz.title,
    score,
    totalQuestions: quiz.questions.length,
    percentage,
    passed,
    resultId: result.id,
  });
});

router.get('/students/:studentId/quiz-results', requireAuth, async (req, res) => {
  const results = await prisma.quizResult.findMany({
    where: { studentId: req.params.studentId },
    include: { quiz: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    results.map((result) => ({
      quizId: result.quizId,
      title: result.quiz.title,
      score: result.score,
      totalQuestions: 0,
      timeTakenSeconds: 0,
      date: result.createdAt.toISOString(),
      incorrectAnswersDetails: [],
    }))
  );
});

export default router;
