export function generateUUID(): string {
  return `${new Date().getTime().toString()}${Math.random()
    .toString(36)
    .substring(2)}`;
}
