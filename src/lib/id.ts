export function createId(prefix: string) {
  // `crypto.randomUUID()` поддерживается в современных браузерах.
  // fallback делаем для старых окружений.
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${uuid}`;
}

