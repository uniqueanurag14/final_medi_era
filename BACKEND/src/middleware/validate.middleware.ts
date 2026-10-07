/**
 * Generic DTO Validation Middleware Runner
 */

import { Request, Response, NextFunction } from 'express';

export function validateBody<T>(validator: (data: any) => { valid: boolean; errors: string[]; dto?: T }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.errors,
      });
    }

    // Attach strongly typed validated DTO to req.body
    req.body = result.dto;
    next();
  };
}
