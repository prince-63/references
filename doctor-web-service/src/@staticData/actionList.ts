import actionTypes from '@constants/actionTypes'

export default [
  {value: actionTypes.VIEW_ALIGNER_CHANGES, label: 'View Aligner Changes'},
  {value: actionTypes.PAUSE_TREATMENT, label: 'Pause Treatment'},
  {value: actionTypes.RESUME_TREATMENT, label: 'Resume Treatment'},
  {value: actionTypes.VIEW_WEAR_STATS, label: 'View Wear Stats'},
  {value: actionTypes.FORCE_CHANGE_ALIGNER, label: 'Force Change Aligner'},
  {
    value: actionTypes.FORCE_CHANGE_ALIGNER_WARNING_MODAL,
    label: 'Force Aligner Change Warning Modal',
  },
  {
    value: actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL,
    label: 'Force Change Aligner Confirm Modal',
  },
  {value: actionTypes.VIEW_LOGS, label: 'View Logs'},
  {value: actionTypes.COMPLETE_TREATMENT, label: 'Complete Treatment'},
  {value: actionTypes.UPDATE_START_DATE, label: 'Update Start Date'},
  {value: actionTypes.CONFIRM_RESUME, label: 'Confirm Resume'},
  {value: actionTypes.EXTEND_WEAR_DAYS, label: 'Extend Wear Days'},
]
