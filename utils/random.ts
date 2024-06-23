export const random = (values: unknown[]) =>
  values[Math.floor(Math.random() * values.length)];
