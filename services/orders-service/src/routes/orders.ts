import { Router, Request, Response, NextFunction } from 'express';
import { OrderService, orderService, OrderNotFoundError, InvalidOrderError } from '../services/orderService';
import { CreateOrderDto } from '../models/order';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../schemas/orderSchemas';

export function createOrdersRouter(service: OrderService): Router {
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

  router.post('/', validate(createOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateOrderDto;
      const order = await service.create(dto);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await service.cancel(req.params.id));
    } catch (err) {
      next(err);
    }
  });

  router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof OrderNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof InvalidOrderError) {
      res.status(422).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  });

  return router;
}

export default createOrdersRouter(orderService);
