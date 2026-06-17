import 'dotenv/config';
import { startDatabase } from './lib/db.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import academicRoutes from './routes/academic.js';
import courseRoutes from './routes/course.js';
import quizRoutes from './routes/quiz.js';
import assignmentRoutes from './routes/assignment.js';
import progressRoutes from './routes/progress.js';
import tutorRoutes from './routes/tutor.js';
import uploadRoutes from './routes/upload.js';
import liveClassRoutes from './routes/live-class.js';

// Start the database if it is not already running
await startDatabase();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eduverse-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api', academicRoutes);
app.use('/api', courseRoutes);
app.use('/api', quizRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', progressRoutes);
app.use('/api', tutorRoutes);
app.use('/api', liveClassRoutes);
app.use('/api', uploadRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`EduVerse API running at http://localhost:${port}/api`);
});
