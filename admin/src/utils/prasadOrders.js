// Pure helpers for the Admin "Prasadam Orders" tab (no React/axios imports so
// they can be tested with `node --test`).

/** Lifecycle states of a Prasad booking (backend PrasadamBookingStatus). */
export const PRASAD_ORDER_STATUSES = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];

/**
 * Normalises the backend PaginatedResponse[BookingResponse] from
 * GET /admin/prasad/bookings into rows + pagination for the DataTable.
 * The total comes from the server's pagination metadata; only if that is
 * absent is it derived from the rows actually returned.
 */
export const normalizePrasadOrdersResponse = (body, { page = 1, limit = 10 } = {}) => {
  const items = Array.isArray(body?.data) ? body.data : [];
  const meta = body?.pagination;
  const total = Number.isFinite(Number(meta?.total)) ? Number(meta.total) : items.length;
  const pageSize = Number(meta?.limit) || limit;
  return {
    items,
    pagination: {
      page: Number(meta?.page) || page,
      limit: pageSize,
      total,
      pages: Number(meta?.pages) || Math.max(1, Math.ceil(total / pageSize)),
    },
  };
};

/** Query params for the API: "ALL" means no status filter. */
export const prasadOrdersParams = ({ status = 'ALL', page = 1, limit = 10 } = {}) => ({
  page,
  limit,
  ...(status && status !== 'ALL' ? { status } : {}),
});
