export interface ActivityItem {
  type: 'COMMENT' | 'ACTIVITY'
  title: string
  description: string
  created_by: string
  profile_image_url: string | null
  timestamp: string
  files: any[]
  is_custom_activity: boolean | null
}

export interface SortInfo {
  direction: 'ASC' | 'DESC'
  property: string
  ignore_case: boolean
  null_handling: 'NATIVE' | string
  ascending: boolean
  descending: boolean
}

export interface Pageable {
  sort: SortInfo[]
  offset: number
  page_number: number
  page_size: number
  paged: boolean
  unpaged: boolean
}

export interface ActivityCommentLogsResponse {
  content?: ActivityItem[]
  pageable?: Pageable
  total_elements?: number
  total_pages?: number
  last?: boolean
  size?: number
  number?: number
  sort?: SortInfo[]
  number_of_elements?: number
}

export interface ActivityCommentLogsRequest {
  patient_id: number | string
  profile_id?: number | string
  page_number?: number
  page_size?: number
}

export interface ActivityCommentLogsState {
  loading: boolean
  loadingMore: boolean
  page: number
  hasMore: boolean
  data: ActivityCommentLogsResponse
  error: string | null
}
