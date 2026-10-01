const modulePaths = [
  '@constants/accessControl.route.constants',
  '@constants/actionTypes',
  '@constants/addedBy.constants',
  '@constants/alignerActions.constants',
  '@constants/alignerChangeDateStatus',
  '@constants/alignerIssues.constants',
  '@constants/alignerStatusType',
  '@constants/alignerUpdateType.constants',
  '@constants/appointmentTypes',
  '@constants/bottomBarFilterOption.constants',
  '@constants/brandNames.constants',
  '@constants/calendarEvents.constants',
  '@constants/caseTypes',
  '@constants/compilanceType',
  '@constants/countryCode',
  '@constants/creationStatus.constants',
  '@constants/customerFilter.constants',
  '@constants/dashboardType.constants',
  '@constants/defaultCountyCode',
  '@constants/deliveryPreferenceTypeSelect.constants',
]

describe('individual constant module imports', () => {
  it.each(modulePaths)('imports %s without errors', (modPath) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modPath)
    expect(mod).toBeTruthy()
  })
})
