export interface RowDataForFolders {
  name: string
  createdBy: string
  createdOn: string
  size: number
  folder: boolean
  url?: string
  type?: string
  extension?: string
  full_path: string
  children_files?: ChildrenFile[]
  fileId: number
  default_folder: boolean
  files_from_treatment_plan?: boolean
}

export interface Root {
  files: File[]
}

export interface Files {
  file_id: number
  name: string
  url?: string
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: any
  deleted_by_user_type: any
  folder: boolean
  type?: string
  extension?: string
  child_file_count: number
  child_folder_count: number
  children_files: ChildrenFile[]
  created_at: string
  size: number
  default_folder: boolean
  files_from_treatment_plan?: boolean
  is_purchase_order_files?: boolean
  is_gdrive_platform?: boolean
  thumbnail_url?: string
  drive_file_id?: string
}

export interface AllFiles {
  file_id: number
  name: string
  url?: string
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: any
  deleted_by_user_type: any
  folder: boolean
  type?: string
  extension?: string
  child_file_count: number
  child_folder_count: number
  children_files: ChildrenFile[]
  created_at: string
  size: number
  default_folder: boolean
  files_from_treatment_plan?: boolean
}

export interface ChildrenFile {
  name: string
  url?: string
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: any
  deleted_by_user_type: any
  folder: boolean
  type?: string
  extension?: string
  child_file_count: number
  child_folder_count: number
  children_files: any[]
  created_at: string
}
