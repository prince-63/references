import reducer, {
  selectIsAddPatientsSkip,
  selectIsClinicDetailsSkip,
  selectIsDCINumAndDCNameSkip,
  selectIsSocialLoggedInLoader,
  setDCIRegisterNumber,
  setDentalCouncilNumber,
  setIsAddPatientsSkip,
  setIsClinicDetailsSkip,
  setIsDCINumAndDCNameSkip,
  setIsSocialLoggedInLoader,
} from '../redux/Slices/AppSlices/appStackStateSlice'

describe('appStackStateSlice reducers', () => {
  it('updates skip flags and identifiers', () => {
    const initial = reducer(undefined, {type: 'init'})

    const afterDCISkip = reducer(initial, setIsDCINumAndDCNameSkip({isDCINumAndDCNameSkip: true}))
    expect(afterDCISkip.isDCINumAndDCNameSkip).toBe(true)

    const afterClinic = reducer(afterDCISkip, setIsClinicDetailsSkip({isClinicDetailsSkip: true}))
    expect(afterClinic.isClinicDetailsSkip).toBe(true)

    const afterAddPatients = reducer(afterClinic, setIsAddPatientsSkip({isAddPatientsSkip: true}))
    expect(afterAddPatients.isAddPatientsSkip).toBe(true)

    const withNumbers = reducer(
      afterAddPatients,
      setDCIRegisterNumber({dciRegisterNumber: 'DCI-123'})
    )
    const withCouncil = reducer(
      withNumbers,
      setDentalCouncilNumber({dentalCouncilNumber: 'DNC-456'})
    )
    expect(withCouncil.dciRegisterNumber).toBe('DCI-123')
    expect(withCouncil.dentalCouncilNumber).toBe('DNC-456')

    const withLoader = reducer(
      withCouncil,
      setIsSocialLoggedInLoader({isSocialLoggedInLoader: true})
    )
    expect(withLoader.isSocialLoggedInLoader).toBe(true)
  })
})

describe('appStackStateSlice selectors', () => {
  const state = {
    appStackState: {
      isDCINumAndDCNameSkip: true,
      isClinicDetailsSkip: false,
      isAddPatientsSkip: true,
      isSocialLoggedInLoader: true,
    },
  }

  it('returns skip values', () => {
    expect(selectIsDCINumAndDCNameSkip(state)).toBe(true)
    expect(selectIsClinicDetailsSkip(state)).toBe(false)
    expect(selectIsAddPatientsSkip(state)).toBe(true)
  })

  it('returns loader flag', () => {
    expect(selectIsSocialLoggedInLoader(state)).toBe(true)
  })
})
