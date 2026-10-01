import actionTypes from '@constants/actionTypes'
import AlignerChangeIcon from 'assets/icons/AlignerChangeIcon'
import CalendarIcon from 'assets/icons/CalendarIcon'
import ForceChangeIcon from 'assets/icons/ForceChangeIcon'
import PauseIcon from 'assets/icons/PauseIcon'
import ResumeIcon from 'assets/icons/ResumeIcon'
import RoundCheckIcon from 'assets/icons/RoundCheckIcon'
import ViewStatsIcon from 'assets/icons/VIewStatsIcon'
import ViewLogsIcon from 'assets/icons/ViewLogsIcon'

export default {
  [actionTypes.VIEW_ALIGNER_CHANGES]: {
    icon: AlignerChangeIcon,
    title: 'View Aligner Updates',
    text: 'Examine all aligner changes made by the patient and provide necessary feedback.',
  },

  [actionTypes.PAUSE_TREATMENT]: {
    icon: PauseIcon,
    title: 'Pause Treatment',
    text: 'Temporarily pause treatment to stop aligner changes and disable the timer. This differs from a refinement.',
    modalSubTitle: 'Temporarily stop the treatment. You can resume it anytime.',
  },
  [actionTypes.VIEW_WEAR_STATS]: {
    icon: ViewStatsIcon,
    title: 'View Aligner Wear Statistics',
    text: 'Access detailed aligner wear data and statistics for your patient.',
  },
  [actionTypes.FORCE_CHANGE_ALIGNER]: {
    icon: ForceChangeIcon,
    title: 'Force Aligner Change',
    text: 'Manually initiate an aligner change without requiring patient input.',
  },
  [actionTypes.VIEW_LOGS]: {
    icon: ViewLogsIcon,
    title: 'View Activity Logs',
    text: 'Access the complete log of all production and order-related actions.',
  },
  [actionTypes.COMPLETE_TREATMENT]: {
    icon: RoundCheckIcon,
    title: 'Complete Treatment',
    text: 'Mark the treatment as completed based on treatment progress. This action is irreversible.',
  },
  [actionTypes.UPDATE_START_DATE]: {
    icon: CalendarIcon,
    title: 'Update start date',
    text: 'You can update the start date before the first aligner ends.',
  },
  [actionTypes.RESUME_TREATMENT]: {
    icon: ResumeIcon,
    title: 'Resume Treatment?',
    text: ' Restart the treatment after a pause.',
    modalSubTitle:
      'Once resumed, the treatment will continue as usual. Patients will regain full access, including the wear timer and treatment updates.',
  },
}
