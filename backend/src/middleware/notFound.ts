import { Request, Response, NextFunction } from 'express'
import { NotFoundError } from './errorHandler.js'

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`パス '${req.originalUrl}' が見つかりません`)
  next(error)
}