import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { mapQuizForFrontend } from '../lib/mappers.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

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
function getQuestionsForTopic(subjectName: string, chapterName: string, topicName: string) {
  const cleanSub = subjectName.toLowerCase();
  const cleanChap = chapterName.toLowerCase();
  const cleanTop = topicName.toLowerCase();

  if (cleanSub.includes("math") || cleanChap.includes("matrices") || cleanTop.includes("matrix") || cleanTop.includes("determinant") || cleanTop.includes("sets") || cleanChap.includes("sets")) {
    return [
      {
        question: "What is the determinant of a 2x2 identity matrix?",
        options: ["1", "0", "-1", "2"],
        correctAnswerIndex: 0,
      },
      {
        question: "If det(A) = 0, the matrix A is defined as:",
        options: ["Singular", "Non-singular", "Invertible", "Symmetric"],
        correctAnswerIndex: 0,
      },
      {
        question: "For a square matrix A, which operation yields the identity matrix?",
        options: ["A * A⁻¹", "A + A", "A - A", "A * A"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the transpose of a symmetric matrix A?",
        options: ["A", "-A", "A⁻¹", "Aᵀ"],
        correctAnswerIndex: 0,
      },
      {
        question: "If set A has n elements, how many subsets does its power set contain?",
        options: ["2ⁿ", "n²", "2n", "n!"],
        correctAnswerIndex: 0,
      },
      {
        question: "Which of the following describes the intersection A ∩ B = Ø?",
        options: ["Disjoint sets", "Equal sets", "Subsets", "Universal sets"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the Cartesian product A × B for A={1,2} and B={3}?",
        options: ["{(1,3), (2,3)}", "{(3,1), (3,2)}", "{1, 2, 3}", "{}"],
        correctAnswerIndex: 0,
      },
      {
        question: "If a matrix has 12 elements, how many possible orders can it have?",
        options: ["6", "12", "4", "3"],
        correctAnswerIndex: 0,
      },
      {
        question: "A matrix in which all elements above or below the main diagonal are zero is called:",
        options: ["Diagonal matrix", "Row matrix", "Column matrix", "Scalar matrix"],
        correctAnswerIndex: 0,
      },
      {
        question: "If A and B are square matrices of the same order, then (AB)⁻¹ is equal to:",
        options: ["B⁻¹A⁻¹", "A⁻¹B⁻¹", "AB", "BA"],
        correctAnswerIndex: 0,
      }
    ];
  }

  if (cleanSub.includes("phys") || cleanChap.includes("motion") || cleanTop.includes("force") || cleanChap.includes("electrostatics") || cleanTop.includes("field")) {
    return [
      {
        question: "Which law is known as the Law of Inertia?",
        options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the formula for force according to Newton's Second Law?",
        options: ["F = ma", "F = m/a", "F = mv", "F = m + a"],
        correctAnswerIndex: 0,
      },
      {
        question: "If an object is thrown vertically upwards, what is its velocity at its maximum height?",
        options: ["Zero", "9.8 m/s", "Equal to initial velocity", "None of these"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the SI unit of electric charge?",
        options: ["Coulomb", "Ampere", "Volt", "Ohm"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the value of permittivity of free space (ε₀)?",
        options: ["8.85 x 10⁻¹² F/m", "9 x 10⁹ N m²/C²", "1.6 x 10⁻¹⁹ C", "8.85 x 10⁹ F/m"],
        correctAnswerIndex: 0,
      },
      {
        question: "The electric field inside a perfectly conducting sphere is:",
        options: ["Zero", "Constant", "Infinite", "Variable"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the unit of capacitance?",
        options: ["Farad", "Henry", "Tesla", "Weber"],
        correctAnswerIndex: 0,
      },
      {
        question: "According to Coulomb's Law, force is inversely proportional to:",
        options: ["Square of distance", "Distance", "Product of charges", "Permittivity"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the electric potential at an infinite distance from a point charge?",
        options: ["Zero", "Infinite", "Constant", "Undefined"],
        correctAnswerIndex: 0,
      },
      {
        question: "Which device is used to store electric charge and electrical energy?",
        options: ["Capacitor", "Resistor", "Inductor", "Diode"],
        correctAnswerIndex: 0,
      }
    ];
  }

  if (cleanSub.includes("chem") || cleanChap.includes("matter") || cleanTop.includes("bonding") || cleanTop.includes("metallurgy") || cleanTop.includes("kinetics") || cleanTop.includes("equilibrium")) {
    return [
      {
        question: "Which concentration method is typically used for sulphide ores?",
        options: ["Froth Flotation", "Hydraulic Washing", "Magnetic Separation", "Leaching"],
        correctAnswerIndex: 0,
      },
      {
        question: "Which chemical bond involves the sharing of electron pairs between atoms?",
        options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the main component of slag in iron extraction?",
        options: ["CaSiO₃", "FeSiO₃", "SiO₂", "CaO"],
        correctAnswerIndex: 0,
      },
      {
        question: "The heating of ore below its melting point in the presence of excess air is:",
        options: ["Roasting", "Calcination", "Smelting", "Refining"],
        correctAnswerIndex: 0,
      },
      {
        question: "Which of the following is an amphoteric oxide?",
        options: ["Al₂O₃", "Na₂O", "SO₂", "CO₂"],
        correctAnswerIndex: 0,
      },
      {
        question: "The valence shell configuration of Group 15 elements is:",
        options: ["ns² np³", "ns² np²", "ns² np⁴", "ns² np⁵"],
        correctAnswerIndex: 0,
      },
      {
        question: "Which method is used for refining volatile metals like Zinc and Mercury?",
        options: ["Distillation", "Liquation", "Electrolysis", "Zone refining"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the coordination number of atoms in a body-centered cubic (BCC) lattice?",
        options: ["8", "6", "12", "4"],
        correctAnswerIndex: 0,
      },
      {
        question: "An example of a stoichiometric crystal defect is:",
        options: ["Schottky defect", "Metal excess defect", "Impurity defect", "Non-stoichiometric defect"],
        correctAnswerIndex: 0,
      },
      {
        question: "What is the order of reaction if the unit of rate constant is L mol⁻¹ s⁻¹?",
        options: ["Second order", "First order", "Zero order", "Third order"],
        correctAnswerIndex: 0,
      }
    ];
  }

  return [
    {
      question: `What is the primary study focus of ${topicName}?`,
      options: ["Systematic analysis of core concepts and principles", "Memorizing definitions without understanding", "Ignoring experimental proofs", "Skipping problem-solving sets"],
      correctAnswerIndex: 0,
    },
    {
      question: `How are formulas and equations verified in the study of ${topicName}?`,
      options: ["Through empirical verification and deductive proofs", "By general consensus without checking", "By assuming they are always false", "None of the above"],
      correctAnswerIndex: 0,
    },
    {
      question: `Which strategy is most effective for learning ${topicName}?`,
      options: ["Breaking down the syllabus into structured sub-topics", "Memorizing entire textbook chapters overnight", "Avoiding practice tests", "Skipping mock worksheets"],
      correctAnswerIndex: 0,
    },
    {
      question: "What is the standard approach to solving complex problems here?",
      options: ["Analyzing boundary conditions and breaking down equations", "Guessing the final answer", "Copying from other sheets", "Ignoring the question text"],
      correctAnswerIndex: 0,
    },
    {
      question: "How does conceptual clarity help in practical applications?",
      options: ["It forms the foundation for advanced problem-solving", "It has no impact on practical work", "It is only needed for passing exams", "It replaces the need for practice"],
      correctAnswerIndex: 0,
    },
    {
      question: "What is the importance of reviewing weak sub-topics?",
      options: ["It patches knowledge gaps and builds confidence", "It is a waste of study time", "It should only be done after failing", "It has no correlation with scores"],
      correctAnswerIndex: 0,
    },
    {
      question: "Why is self-assessment critical for academic growth?",
      options: ["It highlights areas of improvement and tracks progress", "It is only for teachers' convenience", "It has no scientific basis", "It guarantees absolute marks"],
      correctAnswerIndex: 0,
    },
    {
      question: "What role does regular practice play in retaining concepts?",
      options: ["It strengthens memory retrieval and application skills", "It is secondary to memorization", "It has no relationship with retention", "It causes premature fatigue"],
      correctAnswerIndex: 0,
    },
    {
      question: "How can graphical representations clarify text descriptions?",
      options: ["By visualizing relationships between variables dynamically", "By adding unnecessary visual clutter", "By replacing the equations completely", "By complicating simple definitions"],
      correctAnswerIndex: 0,
    },
    {
      question: "What is the final goal of completing structured worksheets?",
      options: ["Achieving comprehensive subject mastery and high scores", "Completing them as quickly as possible", "Filling details without reading", "Submitting blank templates"],
      correctAnswerIndex: 0,
    }
  ];
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
        const questionsToCreate = getQuestionsForTopic(
          topic.chapter.unit.subject.name,
          topic.chapter.name,
          topic.name
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
