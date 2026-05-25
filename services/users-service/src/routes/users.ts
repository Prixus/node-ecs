import { Router, Request, Response, NextFunction } from 'express';
import { userService, UserNotFoundError, EmailConflictError } from '../services/userService';
import { CreateUserDto } from '../models/user';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(userService.getAll());
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(userService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto: CreateUserDto = req.body;
    if (!dto.name || !dto.email) {
      res.status(400).json({ error: 'name and email are required' });
      return;
    }
    const user = userService.create(dto);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    userService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof UserNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof EmailConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

export default router;
