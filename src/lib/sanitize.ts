export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

const CALC_WHITELIST = /^[0-9+\-*/().%\s×÷]+$/;

export function isValidExpression(expr: string): boolean {
  return CALC_WHITELIST.test(expr) && expr.trim().length > 0;
}

export function sanitizeExpression(expr: string): string {
  return expr.replace(/×/g, "*").replace(/÷/g, "/");
}
