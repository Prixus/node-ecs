import { Router, Request, Response, NextFunction } from 'express';
import { orderService, OrderNotFoundError, InvalidOrderError } from '../services/orderService';
import { CreateOrderDto } from '../models/order';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(orderService.getAll());
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(orderService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto: CreateOrderDto = req.body;
    if (!dto.userId || !dto.items) {
      res.status(400).json({ error: 'userId and items are required' });
      return;
    }
    const order = orderService.create(dto);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/cancel', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(orderService.cancel(req.params.id));
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

export default router;
