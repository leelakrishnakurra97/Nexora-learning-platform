import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadToR2, buildStorageKey, deleteFromR2 } from '../lib/r2.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Use memory storage so we can pipe directly to R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'application/zip',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// ─────────────────────────────────────────────
//  GET /upload/structure
//  Return boards → classes → subjects for admin picker
// ─────────────────────────────────────────────
router.get('/upload/structure', requireAuth, async (_req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        classes: {
          include: { subjects: { select: { id: true, name: true } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ boards });
  } catch (err) {
    console.error('Failed to fetch upload structure:', err);
    res.status(500).json({ error: 'Failed to fetch structure' });
  }
});

// ─────────────────────────────────────────────
//  POST /upload/note
//  Admin uploads a note/PDF for a class & subject
// ─────────────────────────────────────────────
router.post(
  '/upload/note',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      const { subjectId, title, classTitle, subjectTitle } = req.body as {
        subjectId?: string;
        title?: string;
        classTitle?: string;
        subjectTitle?: string;
      };

      if (!req.file || !subjectId || !title) {
        return res.status(400).json({ error: 'file, subjectId, and title are required' });
      }

      // Find a topic to attach the note to (first topic in subject)
      const topic = await prisma.topic.findFirst({
        where: { chapter: { unit: { subjectId } } },
        orderBy: { sortOrder: 'asc' },
      });

      if (!topic) {
        return res.status(404).json({ error: 'No topic found for this subject' });
      }

      const key = buildStorageKey(
        'notes',
        classTitle || 'general',
        subjectTitle || 'general',
        req.file.originalname,
      );

      let fileUrl: string;
      try {
        fileUrl = await uploadToR2(key, req.file.buffer, req.file.mimetype);
      } catch (r2Err) {
        // Fallback: store as local reference when R2 is not yet configured
        console.warn('R2 upload failed (credentials may not be set), using local path:', r2Err);
        fileUrl = `/uploads/${key}`;
      }

      // Save note record in DB
      const note = await prisma.courseNote.create({
        data: {
          title,
          fileUrl,
          topicId: topic.id,
          sortOrder: 999,
          isRequiredForComplete: false,
        },
      });

      res.status(201).json({
        success: true,
        note: { id: note.id, title: note.title, fileUrl: note.fileUrl },
      });
    } catch (err) {
      console.error('Note upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  },
);

// ─────────────────────────────────────────────
//  POST /upload/assignment
//  Admin creates/uploads an assignment for a class & subject
// ─────────────────────────────────────────────
router.post(
  '/upload/assignment',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      const {
        subjectId,
        title,
        description,
        classTitle,
        subjectTitle,
        deadline,
        maxMarks,
        passingMarks,
      } = req.body as {
        subjectId?: string;
        title?: string;
        description?: string;
        classTitle?: string;
        subjectTitle?: string;
        deadline?: string;
        maxMarks?: string;
        passingMarks?: string;
      };

      if (!subjectId || !title || !deadline) {
        return res.status(400).json({ error: 'subjectId, title, and deadline are required' });
      }

      // Find a topic to attach the assignment to
      const topic = await prisma.topic.findFirst({
        where: { chapter: { unit: { subjectId } } },
        orderBy: { sortOrder: 'asc' },
      });

      if (!topic) {
        return res.status(404).json({ error: 'No topic found for this subject' });
      }

      let fileUrl: string | null = null;

      if (req.file) {
        const key = buildStorageKey(
          'assignment',
          classTitle || 'general',
          subjectTitle || 'general',
          req.file.originalname,
        );

        try {
          fileUrl = await uploadToR2(key, req.file.buffer, req.file.mimetype);
        } catch (r2Err) {
          console.warn('R2 upload failed, using local path:', r2Err);
          fileUrl = `/uploads/${key}`;
        }
      }

      const assignment = await prisma.assignment.create({
        data: {
          title,
          description: description || '',
          fileUrl: fileUrl || undefined,
          topicId: topic.id,
          maxMarks: parseFloat(maxMarks || '100'),
          passingMarks: parseFloat(passingMarks || '40'),
          deadline: new Date(deadline),
        },
      });

      res.status(201).json({
        success: true,
        assignment: {
          id: assignment.id,
          title: assignment.title,
          deadline: assignment.deadline,
          fileUrl: assignment.fileUrl,
        },
      });
    } catch (err) {
      console.error('Assignment upload error:', err);
      res.status(500).json({ error: 'Assignment creation failed' });
    }
  },
);

// ─────────────────────────────────────────────
//  GET /upload/notes?subjectId=xxx
//  List all notes for a subject
// ─────────────────────────────────────────────
router.get('/upload/notes', requireAuth, async (req, res) => {
  const { subjectId } = req.query as { subjectId?: string };
  if (!subjectId) return res.status(400).json({ error: 'subjectId is required' });

  try {
    const notes = await prisma.courseNote.findMany({
      where: { topic: { chapter: { unit: { subjectId } } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ─────────────────────────────────────────────
//  GET /upload/assignments?subjectId=xxx
//  List all assignments for a subject (with deadline-lock status)
// ─────────────────────────────────────────────
router.get('/upload/assignments', requireAuth, async (req, res) => {
  const { subjectId } = req.query as { subjectId?: string };
  if (!subjectId) return res.status(400).json({ error: 'subjectId is required' });

  try {
    const assignments = await prisma.assignment.findMany({
      where: { topic: { chapter: { unit: { subjectId } } } },
      orderBy: { deadline: 'asc' },
    });

    const now = new Date();
    const enriched = assignments.map((a) => ({
      ...a,
      isLocked: a.deadline ? a.deadline < now : false,
    }));

    res.json({ assignments: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ─────────────────────────────────────────────
//  PATCH /upload/assignment/:id/deadline
//  Admin updates the deadline (also controls locking)
// ─────────────────────────────────────────────
router.patch('/upload/assignment/:id/deadline', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { deadline } = req.body as { deadline?: string };
  if (!deadline) return res.status(400).json({ error: 'deadline is required' });

  try {
    const updated = await prisma.assignment.update({
      where: { id },
      data: { deadline: new Date(deadline) },
    });

    const now = new Date();
    res.json({ success: true, isLocked: updated.deadline ? updated.deadline < now : false, assignment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deadline' });
  }
});

// ─────────────────────────────────────────────
//  DELETE /upload/assignment/:id
// ─────────────────────────────────────────────
router.delete('/upload/assignment/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.assignment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ─────────────────────────────────────────────
//  DELETE /upload/note/:id
// ─────────────────────────────────────────────
router.delete('/upload/note/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.courseNote.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ─────────────────────────────────────────────
//  POST /upload/video
//  Admin uploads a video lecture for a class & subject
// ─────────────────────────────────────────────
router.post(
  '/upload/video',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      const { subjectId, title, duration, classTitle, subjectTitle } = req.body as {
        subjectId?: string;
        title?: string;
        duration?: string;
        classTitle?: string;
        subjectTitle?: string;
      };

      if (!req.file || !subjectId || !title) {
        return res.status(400).json({ error: 'file, subjectId, and title are required' });
      }

      // Find a topic to attach the video to (first topic in subject)
      const topic = await prisma.topic.findFirst({
        where: { chapter: { unit: { subjectId } } },
        orderBy: { sortOrder: 'asc' },
      });

      if (!topic) {
        return res.status(404).json({ error: 'No topic found for this subject' });
      }

      const key = buildStorageKey(
        'video',
        classTitle || 'general',
        subjectTitle || 'general',
        req.file.originalname,
      );

      let fileUrl: string;
      try {
        fileUrl = await uploadToR2(key, req.file.buffer, req.file.mimetype);
      } catch (r2Err) {
        console.warn('R2 video upload failed, using local path:', r2Err);
        fileUrl = `/uploads/${key}`;
      }

      // Duration parsing (input in minutes, convert to seconds)
      const durationSeconds = Math.max(10, Math.round(parseFloat(duration || '10') * 60));

      // Save video record in DB
      const video = await prisma.courseVideo.create({
        data: {
          title,
          videoUrl: fileUrl,
          duration: durationSeconds,
          topicId: topic.id,
          sortOrder: 999,
        },
      });

      res.status(201).json({
        success: true,
        video: { id: video.id, title: video.title, videoUrl: video.videoUrl, duration: video.duration },
      });
    } catch (err) {
      console.error('Video upload error:', err);
      res.status(500).json({ error: 'Video upload failed' });
    }
  },
);

// ─────────────────────────────────────────────
//  GET /upload/videos?subjectId=xxx
//  List all videos for a subject
// ─────────────────────────────────────────────
router.get('/upload/videos', requireAuth, async (req, res) => {
  const { subjectId } = req.query as { subjectId?: string };
  if (!subjectId) return res.status(400).json({ error: 'subjectId is required' });

  try {
    const videos = await prisma.courseVideo.findMany({
      where: { topic: { chapter: { unit: { subjectId } } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// ─────────────────────────────────────────────
//  DELETE /upload/video/:id
// ─────────────────────────────────────────────
router.delete('/upload/video/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.courseVideo.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
