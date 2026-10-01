export type LabChatSenderRole = 'lab' | 'practice'

export interface LabChatAttachment {
  name?: string
  url?: string
  is_gdrive_platform?: boolean
  drive_file_id?: string
  type?: 'image' | 'pdf' | 'voice' | 'video' | 'file'
}

export interface LabChatAlignerCheckIn {
  alignerNumber?: number
  notes?: string
  files: LabChatAttachment[]
}

export interface LabChatProgress {
  alignerNumber: number
  totalAligners: number
  progressPercentage: number
}

export type LabChatMessageType = 'text' | 'image' | 'pdf' | 'voice' | 'video' | 'aligner_check_in'

export interface LabChatMessage {
  id: string
  senderRole: LabChatSenderRole
  isOwnMessage?: boolean
  senderName: string
  content: string
  timestamp: string
  createdAt?: string | null
  type: LabChatMessageType
  attachmentName?: string
  attachmentUrl?: string
  attachments?: LabChatAttachment[]
  alignerCheckIn?: LabChatAlignerCheckIn
}

export interface LabChatThread {
  id: string
  patientName: string
  patient_added_by_name?: string
  customer_name?: string
  patientId: string
  patientInitials: string
  treatmentProgress: string
  practiceName: string
  labName: string
  lastUpdated: string
  unreadCount: number
  lastMessagePreview: string
  messages: LabChatMessage[]
  customer_mapped_id?: string
}

export interface ComposeMessagePayload {
  content: string
  type: LabChatMessageType
  attachmentName?: string
  attachmentUrl?: string
  attachments?: LabChatAttachment[]
  files?: File[]
}
