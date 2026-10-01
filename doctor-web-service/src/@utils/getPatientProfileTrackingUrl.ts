type QueryValue = string | number | boolean | null | undefined

type QueryParams = Record<string, QueryValue>

const TRACKING_ROUTE_SEGMENT = 'aligner-tracking'

const getPatientProfileTrackingUrl = (
  patientId: string | number,
  isStarterPlanUser: boolean,
  queryParams?: QueryParams
) => {
  const basePath = `/profile/${patientId}/${TRACKING_ROUTE_SEGMENT}`

  if (!queryParams) {
    return basePath
  }

  const searchParams = new URLSearchParams()

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()

  return queryString ? `${basePath}?${queryString}` : basePath
}

export default getPatientProfileTrackingUrl
