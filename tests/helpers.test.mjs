import test from 'node:test';
import assert from 'node:assert/strict';
import { getErrorMessage, isOfflineError, NETWORK_ERROR, TIMEOUT_ERROR, titleCase, getCowImageUrl } from '../src/utils/helpers.js';

test('getErrorMessage prefers the server message', () => {
  assert.equal(getErrorMessage({ response: { data: { message: 'Bad input' } } }), 'Bad input');
});

test('network failures and timeouts are detectable as offline errors', () => {
  const net = getErrorMessage({ request: {}, message: 'Network Error' });
  const timeout = getErrorMessage({ code: 'ECONNABORTED' });
  assert.equal(net, NETWORK_ERROR);
  assert.equal(timeout, TIMEOUT_ERROR);
  assert.ok(isOfflineError(net));
  assert.ok(isOfflineError(timeout));
});

test('server validation errors are NOT treated as offline', () => {
  const msg = getErrorMessage({ response: { status: 400, data: { message: 'Invalid cow' } } });
  assert.equal(isOfflineError(msg), false);
});

test('titleCase converts snake_case', () => {
  assert.equal(titleCase('in_progress'), 'In Progress');
});

test('cows without an image return no URL (placeholder is rendered instead)', () => {
  assert.equal(getCowImageUrl({ id: '1' }), null);
  assert.match(getCowImageUrl({ id: 'abc', image: 'x' }), /\/cows\/abc\/image$/);
});
