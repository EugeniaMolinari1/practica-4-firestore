/** Mensaje legible a partir de un error de Firebase. */
export function mensajeDeError(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}
