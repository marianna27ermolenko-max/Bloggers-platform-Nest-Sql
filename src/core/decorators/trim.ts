import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const items = value as unknown[];

      return items.map((item) =>
        typeof item === 'string' ? item.trim() : item,
      );
    }

    return value;
    // return typeof value === 'string' ? value.trim() : value;
  });
}
