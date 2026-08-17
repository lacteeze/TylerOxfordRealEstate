export function inquiryNeighbors<T extends { id: string }>(
  items: T[],
  selectedId: string | null
): { current: T | null; prev: T | null; next: T | null; index: number } {
  if (!selectedId) {
    return { current: null, prev: null, next: null, index: -1 };
  }
  const index = items.findIndex((item) => item.id === selectedId);
  if (index < 0) {
    return { current: null, prev: null, next: null, index: -1 };
  }
  return {
    current: items[index],
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
    index,
  };
}
