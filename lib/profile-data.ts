type UserProfileSource = {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

type ProfileRow = {
  full_name?: string | null
  avatar_url?: string | null
}

function readMetadataString(metadata: Record<string, unknown> | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) {
        return trimmed
      }
    }
  }

  return null
}

export function resolveProfileDisplayName(source: UserProfileSource, profile?: ProfileRow | null) {
  return (
    profile?.full_name ||
    readMetadataString(source.user_metadata, ['full_name', 'name', 'display_name']) ||
    source.email ||
    'Your profile'
  )
}

export function resolveProfileAvatarUrl(source: UserProfileSource, profile?: ProfileRow | null) {
  return (
    profile?.avatar_url ||
    readMetadataString(source.user_metadata, ['avatar_url', 'picture', 'avatar']) ||
    undefined
  )
}

export function resolveProfileSyncData(source: UserProfileSource) {
  return {
    full_name: readMetadataString(source.user_metadata, ['full_name', 'name', 'display_name']),
    avatar_url: readMetadataString(source.user_metadata, ['avatar_url', 'picture', 'avatar']),
  }
}
