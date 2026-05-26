import { Router, Request, Response, NextFunction } from 'express';
import { UserService, UserNotFoundError, EmailConflictError } from '../services/userService';
import { validate } from '../middleware/validate';
import { createUserSchema, CreateUserDto } from '../schemas/userSchemas';

export function createUsersRouter(service: UserService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await service.getAll());
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  // validate middleware runs first — route handler only runs if body is valid
  router.post(
    '/',
    validate(createUserSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = req.body as CreateUserDto;
        res.status(201).json(await service.create(dto));
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.params.id);
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

  return router;
}
