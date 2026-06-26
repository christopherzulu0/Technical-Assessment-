import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveRequestedOrganizationId } from '../lib/request-org'

test('prefers an explicit organization ID from the request over the auth context', () => {
  assert.equal(resolveRequestedOrganizationId('org_from_header', 'org_from_auth'), 'org_from_header')
})

test('falls back to the active Clerk organization when no explicit ID is provided', () => {
  assert.equal(resolveRequestedOrganizationId(null, 'org_from_auth'), 'org_from_auth')
})

test('returns null when neither source provides an organization', () => {
  assert.equal(resolveRequestedOrganizationId('', undefined), null)
})
