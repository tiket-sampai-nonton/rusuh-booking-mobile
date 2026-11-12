/** Remove trailing path separators without a backtracking regular expression. */
export function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.codePointAt(end - 1) === 47) end -= 1;
  return value.slice(0, end);
}

/** Remove leading path separators without a backtracking regular expression. */
export function trimLeadingSlashes(value: string): string {
  let start = 0;
  while (start < value.length && value.codePointAt(start) === 47) start += 1;
  return value.slice(start);
}
