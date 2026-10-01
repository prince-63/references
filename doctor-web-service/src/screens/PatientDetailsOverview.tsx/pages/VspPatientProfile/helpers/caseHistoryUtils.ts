import dayjs from 'dayjs'
import {ParsedActivity} from './caseHistory.types'

/**
 * Parses the activity string to separate the main description from any NOTE content.
 * If the activity contains "NOTE Lab Note:" or "NOTE Your Note:", it splits them.
 *
 * @param activity - Raw activity string from the API
 * @returns ParsedActivity with description, note content, and note label
 */
export const parseActivityText = (activity: string): ParsedActivity => {
  const labNoteMatch = activity.match(/^([\s\S]*?)\s*NOTE\s+Lab Note:\s*([\s\S]*)$/)
  if (labNoteMatch) {
    return {
      description: labNoteMatch[1].trim(),
      note: labNoteMatch[2].trim(),
      noteLabel: 'Lab Note:',
    }
  }

  const yourNoteMatch = activity.match(/^([\s\S]*?)\s*NOTE\s+Your Note:\s*([\s\S]*)$/)
  if (yourNoteMatch) {
    return {
      description: yourNoteMatch[1].trim(),
      note: yourNoteMatch[2].trim(),
      noteLabel: 'Your Note:',
    }
  }

  return {
    description: activity,
    note: null,
    noteLabel: null,
  }
}

/**
 * Formats a timestamp string into a readable date + time format.
 * e.g., "2026-02-19T11:50:00.240271+05:30" → { date: "FEB 19", time: "11:50 AM" }
 */
export const formatActivityTimestamp = (timestamp: string): {date: string; time: string} => {
  const d = dayjs(timestamp)

  return {
    date: d.format('MMM D').toUpperCase(),
    time: d.format('h:mm A'),
  }
}

/**
 * Checks if the given activity type supports notes (expandable content).
 */
export const hasNoteSupport = (activityType: string): boolean => {
  return activityType === 'INFORMATION_REQUEST' || activityType === 'REVISION_FEEDBACK'
}
