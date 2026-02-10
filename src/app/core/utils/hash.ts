export const hashString = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

export const stableStringify = (value: unknown): string => {
  const seen = new WeakSet();
  const replacer = (_key: string, val: unknown) => {
    if (val && typeof val === 'object') {
      if (seen.has(val as object)) {
        return;
      }
      seen.add(val as object);
    }
    return val;
  };
  return JSON.stringify(value, replacer);
};
