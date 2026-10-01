const PLAN_NAME_ALIASES: Record<string, string> = {
  LITE_PLAN: 'LITE',
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  STARTER: 'Starter plan',
  LITE: 'Lite plan',
  GROWTH: 'Growth plan',
  PROFESSIONAL: 'Professional plan',
  ENTERPRISE: 'Enterprise plan',
  DESIGN_LAB: 'Design Lab',
  COMMERCIAL_LAB_PLAN: 'Commercial Lab plan',
}

export const normalizePlanName = (planName?: string | null) => {
  const normalizedName = String(planName ?? '')
    .trim()
    .toUpperCase()

  return PLAN_NAME_ALIASES[normalizedName] ?? normalizedName
}

export const getPlanDisplayName = (planName?: string | null) => {
  const normalizedName = normalizePlanName(planName)

  if (!normalizedName) return ''

  return (
    PLAN_DISPLAY_NAMES[normalizedName] ??
    normalizedName
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  )
}

export const isStarterOrLitePlan = (planName?: string | null) => {
  const normalizedName = normalizePlanName(planName)
  return normalizedName === 'STARTER' || normalizedName === 'LITE'
}
