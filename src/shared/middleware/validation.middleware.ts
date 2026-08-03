import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export const validationRequest =
  (schema: ZodSchema) => async (request: Request, response: Response, next: NextFunction) => {
    try {
      request.body = await schema.parseAsync(request.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(400).json({
          message: "Error de validación en los datos enviados.",
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          })),
        });
      }
      return response
        .status(500)
        .json({ message: "Ha ocurrido un error interno, intente más tarde." });
    }
  };
