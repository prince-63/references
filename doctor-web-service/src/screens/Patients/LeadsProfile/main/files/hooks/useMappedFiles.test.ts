jest.mock('react', () => ({useMemo: (fn: any) => fn()}))
jest.mock('@hooks/useAllUserPlan', () => () => ({isStarterPlanUser: false, isPractice: false}))
jest.mock('utils/hasValue', () => jest.fn((val) => !!val && val.length > 0))

describe('useMappedFiles', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loadHook = () => require('./useMappedFiles').default

  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@hooks/useAllUserPlan', () => () => ({
      isStarterPlanUser: false,
      isPractice: false,
    }))
  })

  const makeFile = (overrides: Partial<any> = {}) => ({
    name: 'A',
    created_by_user_type: 'ORG',
    created_at: '2024-01-02',
    size: 0,
    folder: false,
    type: 'file',
    extension: 'pdf',
    full_path: '/a',
    children_files: [],
    file_id: '1',
    default_folder: false,
    files_from_treatment_plan: false,
    ...overrides,
  })

  it('returns empty array when no files', () => {
    const hook = loadHook()
    const result = hook({files: []})
    expect(result).toEqual([])
  })

  it('filters out Orders for starter plan users', () => {
    jest.resetModules()
    jest.doMock('@hooks/useAllUserPlan', () => () => ({isStarterPlanUser: true, isPractice: false}))
    const hook = loadHook()

    const files = [makeFile({name: 'Orders', folder: true}), makeFile({name: 'Docs', folder: true})]
    const result = hook({files})

    expect(result.map((f: any) => f.name)).toEqual(['Docs'])
  })

  it('filters purchase order files for practices', () => {
    jest.resetModules()
    jest.doMock('@hooks/useAllUserPlan', () => () => ({isStarterPlanUser: false, isPractice: true}))
    const hook = loadHook()

    const files = [
      makeFile({name: 'OrderFiles', is_purchase_order_files: true}),
      makeFile({name: 'Other'}),
    ]
    const result = hook({files})

    expect(result.map((f: any) => f.name)).toEqual(['Other'])
  })

  it('sorts folders before files and by created date', () => {
    const hook = loadHook()
    const files = [
      makeFile({name: 'File', created_at: '2023-01-01', folder: false}),
      makeFile({name: 'Folder', created_at: '2025-01-01', folder: true}),
    ]

    const result = hook({files})

    expect(result[0].name).toBe('Folder')
    expect(result[1].name).toBe('File')
  })

  it('only returns folders in move files modal', () => {
    const files = [makeFile({folder: false}), makeFile({folder: true, name: 'Folder'})]
    const hook = loadHook()

    const result = hook({files, isMoveFilesModal: true})

    expect(result.map((f: any) => f.name)).toEqual(['Folder'])
  })

  it('keeps mapping values and defaults missing fields', () => {
    const hook = loadHook()
    const files = [
      makeFile({
        name: 'Doc',
        url: 'http://example.com',
        children_files: undefined,
        size: undefined,
      }),
    ]

    const [mapped] = hook({files})

    expect(mapped.name).toBe('Doc')
    expect(mapped.url).toBe('http://example.com')
    expect(mapped.children_files).toEqual([])
    expect(mapped.size).toBe(0)
  })

  it('sorts by created date when folders are equal', () => {
    const hook = loadHook()
    const files = [
      makeFile({name: 'Recent', created_at: '2025-12-31', folder: true}),
      makeFile({name: 'Old', created_at: '2024-01-01', folder: true}),
    ]

    const result = hook({files})

    expect(result.map((f: any) => f.name)).toEqual(['Recent', 'Old'])
  })
})
