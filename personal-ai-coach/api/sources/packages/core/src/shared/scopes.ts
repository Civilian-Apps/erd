
// OAuth product scopes (AP-11 / rail R9) — the ONE definition the provider,
// the MCP route, the consent page and the tool registry all import. Client-safe
// (no imports, no I/O): the consent page renders these labels in the browser.
//
//   coach:read  — read the coaching record: `cycle_read` and future entity readers.
//   coach:write — every write-capable tool, `loadBriefing` included (it opens a Session).
//
// Identity scopes (`openid profile email offline_access`) stay: the MCP route
// requires `openid` to identify the caller; a PRODUCT scope is enforced per
// tool by the registry (`ToolDef.scope`). Default dynamic-client registration
// requests both product scopes; a client may register for `coach:read` alone.

export const PRODUCT_SCOPES = ['coach:read', 'coach:write'] as const

export type ProductScope = (typeof PRODUCT_SCOPES)[number]


export const IDENTITY_SCOPES = ['openid', 'profile', 'email', 'offline_access'] as const


/** Every scope the authorization server supports and advertises. */
export const SUPPORTED_SCOPES = [...IDENTITY_SCOPES, ...PRODUCT_SCOPES] as const


/** Consent-screen copy per scope; unknown scopes render raw. */
export const SCOPE_LABELS: Readonly<Record<string, string>> = {
  openid: 'Verify your identity',
  profile: 'Read your basic profile',
  email: 'Read your email address',
  offline_access: 'Stay connected when you are away',
  'coach:read': 'Read your coaching record',
  'coach:write': 'Run coaching sessions and update your coaching record',
}


export function hasScope(granted: readonly string[], required: ProductScope): boolean {
  return granted.includes(required)
}