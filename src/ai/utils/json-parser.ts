export function parseAIResponse<T>(response: string): T {
  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned) as T;
}
