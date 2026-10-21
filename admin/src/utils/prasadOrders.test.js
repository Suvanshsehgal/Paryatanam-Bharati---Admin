// Run with: node --test src/utils/prasadOrders.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrasadOrdersResponse, prasadOrdersParams, PRASAD_ORDER_STATUSES } from './prasadOrders.js';

const prasadBooking = {
  id: 'b1',
  booking_reference: 'DP-20261020-AB12CD',
  booking_date: '2026-10-22',
  quantity: 2,
  total_amount: 302,
  status: 'CONFIRMED',
  user: { id: 'u1', name: 'Asha' },
  temple: { id: 't1', name: 'Kashi Vishwanath', slug: 'kashi', city: 'Varanasi', state: 'UP' },
  offering: { id: 'o1', name: 'Laddu Prasad' },
};

test('uses the server pagination total, not the length of the current page', () => {
  const res = normalizePrasadOrdersResponse(
    { status: 'success', data: [prasadBooking], pagination: { total: 23, page: 3, limit: 10, pages: 3 } },
  );
  assert.equal(res.items.length, 1);
  assert.deepEqual(res.pagination, { page: 3, limit: 10, total: 23, pages: 3 });
});

test('without metadata the total is derived from the returned rows (never invented)', () => {
  const res = normalizePrasadOrdersResponse({ data: [prasadBooking, { ...prasadBooking, id: 'b2' }] }, { page: 1, limit: 10 });
  assert.equal(res.pagination.total, 2);
  assert.equal(res.pagination.pages, 1);
});

test('an empty result is an honest empty list with total 0', () => {
  const res = normalizePrasadOrdersResponse({ data: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
  assert.deepEqual(res.items, []);
  assert.equal(res.pagination.total, 0);
  assert.equal(res.pagination.pages, 1);
});

test('rows keep the Prasad booking shape (temple/offering), no wellness fields are added', () => {
  const [row] = normalizePrasadOrdersResponse({ data: [prasadBooking] }).items;
  assert.ok(row.booking_reference.startsWith('DP-'));
  assert.equal(row.offering.name, 'Laddu Prasad');
  assert.equal(row.temple.name, 'Kashi Vishwanath');
  assert.equal(row.service, undefined);
  assert.equal(row.provider, undefined);
});

test('status filter params: ALL sends no status; a status is sent as-is; paging is sent', () => {
  assert.deepEqual(prasadOrdersParams({ status: 'ALL', page: 2, limit: 20 }), { page: 2, limit: 20 });
  assert.deepEqual(prasadOrdersParams({ status: 'COMPLETED' }), { page: 1, limit: 10, status: 'COMPLETED' });
  assert.deepEqual(PRASAD_ORDER_STATUSES, ['CONFIRMED', 'COMPLETED', 'CANCELLED']);
});
