// ---------------------------------------------------------------------------
// index.ts — Express server entry point
// ---------------------------------------------------------------------------

import 'dotenv/config';
import express from 'express';
import healthRouter from './routes/health.routes';
import interviewRouter from './routes/interview.routes';
import { verifyAuth } from './middleware/auth.middleware';

const app = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

app.use(express.json());

// Routes
app.use(healthRouter);
app.use(interviewRouter);
app.get('/api/test-auth', verifyAuth, (req, res) => {
  res.status(200).json({
    message: 'Success! You have a valid token.',
    user_id: req.user?.id
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;
