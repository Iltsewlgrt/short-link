export function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString("en-US");
  } catch {
    return value;
  }
}
