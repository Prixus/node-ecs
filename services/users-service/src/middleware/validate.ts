import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Factory that returns an Express middleware for the given Zod schema.
// On failure: 400 with structured field errors.
// On success: req.body is replaced with the parsed (coerced + stripped) data.
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
