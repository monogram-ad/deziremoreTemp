import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express 4 (which this project runs — see the package.json vs.
 * @types/express version note in the audit report) does NOT forward a
 * rejected promise from an `async (req, res) => {}` route handler to the
 * error-handling middleware. Without this wrapper, a thrown/rejected
 * error inside an async handler just hangs the request forever with no
 * response and nothing logged. Wrap every async handler with this.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
