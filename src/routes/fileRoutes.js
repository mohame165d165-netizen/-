import express from 'express';
import { fileService } from '../services/fileService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', auth, async (req, res, next) => {
  try {
    const files = await fileService.list(req.params.projectId, req.user.id);
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

router.get('/tree', auth, async (req, res, next) => {
  try {
    const tree = await fileService.getTree(req.params.projectId, req.user.id);
    res.json({ success: true, data: tree });
  } catch (error) {
    next(error);
  }
});

router.get('/all', auth, async (req, res, next) => {
  try {
    const files = await fileService.getAllWithContent(req.params.projectId, req.user.id);
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { path, content, language, fileType } = req.body;
    const file = await fileService.create(req.params.projectId, req.user.id, { path, content, language, fileType });
    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
});

router.post('/batch', auth, async (req, res, next) => {
  try {
    const { files } = req.body;
    const result = await fileService.batchUpsert(req.params.projectId, req.user.id, files);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:fileId/content', auth, async (req, res, next) => {
  try {
    const content = await fileService.getContent(req.params.fileId, req.user.id);
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
});

router.put('/:fileId', auth, async (req, res, next) => {
  try {
    const { content, path } = req.body;
    const file = await fileService.update(req.params.fileId, req.user.id, { content, path });
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
});

router.delete('/:fileId', auth, async (req, res, next) => {
  try {
    await fileService.delete(req.params.fileId, req.user.id);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
