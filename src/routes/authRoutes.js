import express from 'express';
import { authService } from '../services/authService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.register(email, password, displayName);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', auth, async (req, res, next) => {
  try {
    await authService.logout(req.headers.authorization.split(' ')[1]);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', auth, async (req, res, next) => {
  try {
    const { displayName } = req.body;
    const user = await authService.updateProfile(req.user.id, displayName);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
