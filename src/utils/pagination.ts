export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return { page, limit, total, totalPages };
}

export function normalizePagination(
  rawPage?: unknown,
  rawLimit?: unknown
): { page: number; limit: number } {
  let page = Number(rawPage);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let limit = Number(rawLimit);
  if (!Number.isFinite(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  return { page, limit };
}
