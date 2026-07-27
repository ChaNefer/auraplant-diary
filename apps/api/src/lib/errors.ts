import type { Context } from "hono";
import type { ZodError } from "zod";

export function zodError(c: Context, err: ZodError) {
  return c.json(
    {
      error: "validation_error",
      details: err.flatten(),
    },
    400,
  );
}

export function notFound(c: Context, message = "not_found") {
  return c.json({ error: message }, 404);
}

export function badRequest(c: Context, message: string, details?: unknown) {
  return c.json({ error: message, details }, 400);
}
