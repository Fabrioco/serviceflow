// Monta o schema de um erro com status, mensagem e (opcional) "error" próprios.
// 401 e 403 sem mensagem não têm o campo "error" no corpo do Nest.
export const errorSchema = (
  statusCode: number,
  message: string | string[],
  error?: string,
) => ({
  type: 'object' as const,
  properties: {
    statusCode: { type: 'number' as const, example: statusCode },
    message: Array.isArray(message)
      ? {
          type: 'array' as const,
          items: { type: 'string' as const },
          example: message,
        }
      : { type: 'string' as const, example: message },
    ...(error ? { error: { type: 'string' as const, example: error } } : {}),
  },
});
