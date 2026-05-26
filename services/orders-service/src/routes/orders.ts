import { Router, Request, Response, NextFunction } from 'express';
import { orderService, OrderNotFoundError, InvalidOrderError } from '../services/orderService';
import { CreateOrderDto } from '../models/order';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await orderService.getAll());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await orderService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto: CreateOrderDto = req.body;
    if (!dto.userId || !dto.items) {
      res.status(400).json({ error: 'userId and items are required' });
      return;
    }
    const order = await orderService.create(dto);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await orderService.cancel(req.params.id));
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
