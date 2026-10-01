import timelineFilterTypes from '../../../../../../@staticData/timelineFilter'
import timelineFilterOptionConstant from '../../../../../../@constants/timelineFilterOption.constant'

export type TimelineStatus = (typeof timelineFilterTypes)[number]['value']
export type TimelineFilterOptionsRecord = Record<keyof typeof timelineFilterOptionConstant, any[]>
