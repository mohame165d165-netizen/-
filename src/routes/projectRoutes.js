import express from 'express';
import { projectService } from '../services/projectService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, packageName, config } = req.body;
    const project = await projectService.create(req.user.id, { name, description, packageName, config });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const projects = await projectService.list(req.user.id, { status, limit, offset });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.get('/:projectId', auth, async (req, res, next) => {
  try {
    const project = await projectService.get(req.params.projectId, req.user.id);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.put('/:projectId', auth, async (req, res, next) => {
  try {
    const { name, description, config, status } = req.body;
    const project = await projectService.update(req.params.projectId, req.user.id, { name, description, config, status });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.delete('/:projectId', auth, async (req, res, next) => {
  try {
    await projectService.delete(req.params.projectId, req.user.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
