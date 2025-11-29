export type PaginationQuery = {
  page?: string | number
  size?: string | number
}

export function getPagination(q: PaginationQuery, defaults = { page: 1, size: 20 }) {
  const pageNum = Number(q.page ?? defaults.page)
  const sizeNum = Number(q.size ?? defaults.size)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : defaults.page
  let size = Number.isFinite(sizeNum) && sizeNum > 0 ? sizeNum : defaults.size
  if (size > 100) size = 100
  const skip = (page - 1) * size
  const take = size
  return { page, size, skip, take }
}

export type SortQuery = string | undefined

export function parseSort(sort: SortQuery, allowed: Record<string, string> = { 'created_at': 'createdAt' }) {
  const def = { createdAt: 'desc' as const }
  if (!sort) return def
  const [fieldRaw, dirRaw] = sort.split(':')
  const field = allowed[fieldRaw] ?? 'createdAt'
  const dir = dirRaw === 'asc' ? 'asc' : 'desc'
  return { [field]: dir } as Record<string, 'asc' | 'desc'>
}