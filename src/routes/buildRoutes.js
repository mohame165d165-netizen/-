import express from 'express';
import { buildService } from '../services/buildService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/projects/:projectId/build', auth, async (req, res, next) => {
  try {
    const build = await buildService.startBuild(req.params.projectId, req.user.id);
    res.status(201).json({ success: true, data: build });
  } catch (error) {
    next(error);
  }
});

router.get('/projects/:projectId/builds', auth, async (req, res, next) => {
  try {
    const builds = await buildService.listBuilds(req.params.projectId, req.user.id);
    res.json({ success: true, data: builds });
  } catch (error) {
    next(error);
  }
});

router.get('/:buildId', auth, async (req, res, next) => {
  try {
    const build = await buildService.getStatus(req.params.buildId, req.user.id);
    res.json({ success: true, data: build });
  } catch (error) {
    next(error);
  }
});

router.get('/:buildId/logs', auth, async (req, res, next) => {
  try {
    const logs = await buildService.getLogs(req.params.buildId, req.user.id);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

router.post('/:buildId/cancel', auth, async (req, res, next) => {
  try {
    const result = await buildService.cancelBuild(req.params.buildId, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/download/:fileName', auth, async (req, res, next) => {
  try {
    const filePath = await buildService.getDownloadPath(req.params.fileName, req.user.id);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', auth, async (req, res, next) => {
  try {
    const stats = await buildService.getStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
