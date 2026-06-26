export function resolveRequestedOrganizationId(
  explicitOrgId: string | null | undefined,
  authOrgId: string | null | undefined
) {
  const normalize = (value: string | null | undefined) => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed || null
  }

  return normalize(explicitOrgId) ?? normalize(authOrgId)
}
