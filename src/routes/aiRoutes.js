import express from 'express';
import { aiCommandService } from '../ai/aiCommandService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/projects/:projectId/commands', auth, async (req, res, next) => {
  try {
    const { command } = req.body;
    const result = await aiCommandService.executeCommand(req.params.projectId, req.user.id, command);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/projects/:projectId/commands', auth, async (req, res, next) => {
  try {
    const { limit } = req.query;
    const history = await aiCommandService.getHistory(req.params.projectId, req.user.id, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

router.post('/parse', auth, async (req, res, next) => {
  try {
    const { command } = req.body;
    const parsed = await aiCommandService.parseCommand(command);
    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
});

router.get('/supported-commands', (req, res) => {
  res.json({
    success: true,
    data: aiCommandService.getSupportedCommands()
  });
});

export default router;
