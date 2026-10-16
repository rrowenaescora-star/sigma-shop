export function isValidCheckoutEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length > 254) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && local.length <= 64 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    !local.startsWith(".") && !local.endsWith(".") && !local.includes("..") &&
    domain.includes(".") && domain.split(".").every(label =>
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)) &&
    /^[a-zA-Z]{2,63}$/.test(domain.split(".").at(-1)!);
}
