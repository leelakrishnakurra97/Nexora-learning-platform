import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/topics/:topicId/assignments', async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { topicId: req.params.topicId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      subjectId: req.params.topicId,
      subjectTitle: assignment.title,
      deadline: assignment.deadline?.toISOString() ?? '',
      points: assignment.maxMarks,
      status: 'Pending',
    }))
  );
});

router.post('/assignments/:assignmentId/submit', requireAuth, async (req, res) => {
  const { submissionUrl } = req.body as { submissionUrl?: string };
  if (!submissionUrl) {
    return res.status(400).json({ error: 'submissionUrl is required' });
  }

  const student = await prisma.student.findUnique({ where: { id: req.auth!.userId } });
  if (!student) {
    return res.status(403).json({ error: 'Student profile required' });
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      studentId_assignmentId: {
        studentId: student.id,
        assignmentId: req.params.assignmentId,
      },
    },
    update: {
      submissionUrl,
      status: 'SUBMITTED',
    },
    create: {
      studentId: student.id,
      assignmentId: req.params.assignmentId,
      submissionUrl,
    },
  });

  res.json(submission);
});

router.get('/students/:studentId/submissions', requireAuth, async (req, res) => {
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { studentId: req.params.studentId },
    include: { assignment: true },
    orderBy: { submittedAt: 'desc' },
  });

  res.json(submissions);
});

export default router;
