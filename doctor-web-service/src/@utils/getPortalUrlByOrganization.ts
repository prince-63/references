import brandNamesConstants from '@constants/brandNames.constants'
import {getLocalAppOrigin} from 'utils/envUtils'
/**
 * Maps organization name or ID to the corresponding portal URL
 * Used for multi-portal profile switching
 */
export const getPortalUrlByOrganization = (organizationName: string | null | undefined): string => {
  const localAppOrigin = getLocalAppOrigin()
  if (localAppOrigin) return localAppOrigin

  const stage = process.env.REACT_APP_BASE_ENVIRONMENT || ''
  // Normalize organization name to match brand constants
  const normalizedOrgName = organizationName?.toUpperCase().replace(/\s+/g, '').trim()

  switch (normalizedOrgName) {
    case brandNamesConstants.SMILEZY:
      return stage === '' ? 'https://web.smilezy.com' : `https://smilezy.${stage}dental-stack.com`

    case brandNamesConstants.ROUTETOSMILE:
      return stage === ''
        ? 'https://web.routetosmile.com'
        : `https://routetosmile.${stage}dental-stack.com`

    case brandNamesConstants.CRAFTALIGN:
      return stage === ''
        ? 'https://web.craftalign.com'
        : `https://craftalign.${stage}dental-stack.com`

    case brandNamesConstants.SYNAPSE:
      return stage === ''
        ? 'https://web.synapsehealthtech.in'
        : 'https://synapsehealthtech.stage.dental-stack.com'

    case brandNamesConstants.CLEARCASTLE:
      return stage === ''
        ? 'https://doctors.clearcastle.in'
        : 'https://clearcastle.stage.dental-stack.com'

    case brandNamesConstants.SMILEXCEL:
      return stage === ''
        ? 'https://doctors.smilexcel.com'
        : `https://smilexcel.${stage}dental-stack.com`

    case brandNamesConstants.DENTALSTACK:
    default:
      return stage === '' ? 'https://web.dental-stack.com' : `https://web.${stage}dental-stack.com`
  }
}

/**
 * Navigates to a different portal with profile and organization context
 * Preserves authentication state for seamless portal switching
 */
export const navigateToPortal = (organizationName: string) => {
  const portalUrl = getPortalUrlByOrganization(organizationName)
  return portalUrl
}
