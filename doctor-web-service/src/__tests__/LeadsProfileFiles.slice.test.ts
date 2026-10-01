import HttpMethod from '@constants/httpMethods.constants'
import reducer, {
  createFolder,
  deleteFiles,
  downloadFile,
  getFiles,
  getFilesForMoveModal,
  moveFiles,
  renameFileOrFolder,
  resetOrderId,
  resetPatientId,
  setIsRename,
  setIsStlFilePreviewVisible,
  setOpenCreateFolderModal,
  setOpenDeleteModal,
  setOpenMoveFilesModal,
  setOpenUploadFilesModal,
  setOrderId,
  setPatientId,
  setStlPreviewUrl,
  uploadFiles,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import apiHelper from '@utils/apiHelper'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {
  URL_CREATE_FOLDER,
  URL_DELETE_FILES,
  URL_DOWNLOAD_FILES,
  URL_GET_FILES,
  URL_MOVE_FILES,
  URL_RENAME_FILE_OR_FOLDER,
  URL_UPLOAD_FILES,
} from 'redux/Endpoints/apiEndpoints'

jest.mock('@utils/apiHelper', () => jest.fn())
jest.mock('components/modal/Alert/SuccessToast', () => jest.fn())

const mockedApiHelper = apiHelper as jest.MockedFunction<typeof apiHelper>
const mockedSuccessToast = SuccessToast as jest.Mock
const baseThunkArgs = {dispatch: jest.fn(), getState: jest.fn(), extra: undefined as undefined}

const initial = reducer(undefined, {type: '@@init'})

describe('LeadsProfileFiles slice reducers', () => {
  it('toggles modal and preview flags', () => {
    let state = reducer(initial, setOpenCreateFolderModal(true))
    state = reducer(state, setOpenUploadFilesModal(true))
    state = reducer(state, setOpenDeleteModal(true))
    state = reducer(state, setOpenMoveFilesModal(true))
    state = reducer(state, setIsRename(true))
    state = reducer(state, setIsStlFilePreviewVisible(true))
    state = reducer(state, setStlPreviewUrl('url'))
    state = reducer(state, setOrderId({orderFileId: 5}))
    state = reducer(state, setPatientId({patientFileId: 9}))

    expect(state).toMatchObject({
      openCreateFolderModal: true,
      openUploadFilesModal: true,
      openDeleteModal: true,
      openMoveFilesModal: true,
      isRename: true,
      isStlPreviewVisible: true,
      stlPreviewUrl: 'url',
      orderFileId: 5,
      patientFileId: 9,
    })

    state = reducer(state, resetOrderId())
    state = reducer(state, resetPatientId())
    expect(state.orderFileId).toBeNull()
    expect(state.patientFileId).toBeNull()
  })
})

describe('thunk flows', () => {
  beforeEach(() => {
    mockedApiHelper.mockReset()
    mockedSuccessToast.mockReset()
  })

  it('fetches files and populates state', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {files: [{id: 1}]}} as any)
    const result = await getFiles({path: '/', doctor_id: '2', patient_id: '3'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_FILES}?path=/&requester_user_id=2&requester_user_type=DOCTOR&owner_user_id=3&owner_user_type=PATIENT`,
      HttpMethod.GET
    )
    expect(result.payload).toEqual([{id: 1}])

    const pendingState = reducer(
      initial,
      getFiles.pending('req', {path: '/', doctor_id: '2', patient_id: '3'} as any)
    )
    expect(pendingState.loadingFiles).toBe(true)
    const fulfilledState = reducer(initial, getFiles.fulfilled([{id: 1}] as any, 'req', {} as any))
    expect(fulfilledState.files).toEqual([{id: 1}])
  })

  it('returns move modal files and sets loading flags', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {files: ['x']}} as any)
    await getFilesForMoveModal({path: '/folder', doctor_id: '2', patient_id: '3'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      `${URL_GET_FILES}?path=/folder&requester_user_id=2&requester_user_type=DOCTOR&owner_user_id=3&owner_user_type=PATIENT`,
      HttpMethod.GET
    )
    const pending = reducer(initial, getFilesForMoveModal.pending('id', {} as any))
    expect(pending.loadingMoveFiles).toBe(true)
  })

  it('creates and uploads files using apiHelper', async () => {
    mockedApiHelper.mockResolvedValue({data: {ok: true}} as any)
    await createFolder({
      parent_path: '/',
      folder_name: 'new',
      uploader: {user_id: 1, user_type: 'DOCTOR'},
      owners: [{user_id: 2, user_type: 'PATIENT'}],
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_CREATE_FOLDER,
      HttpMethod.POST,
      expect.objectContaining({folder_name: 'new'})
    )

    mockedApiHelper.mockResolvedValueOnce({data: {ok: true}} as any)
    await uploadFiles({
      uploader: {user_id: 1, user_type: 'DOCTOR'},
      owners: [{user_id: 2, user_type: 'PATIENT'}],
      parent_path: '/root',
      files: [new File(['abc'], 'a.txt')],
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)

    const payload = mockedApiHelper.mock.calls[1][2] as FormData
    expect(payload instanceof FormData).toBe(true)
    expect(payload.get('request')).toEqual(
      JSON.stringify({
        uploader: {user_id: 1, user_type: 'DOCTOR'},
        owners: [{user_id: 2, user_type: 'PATIENT'}],
        parent_path: '/root',
      })
    )
    expect(mockedApiHelper).toHaveBeenLastCalledWith(
      URL_UPLOAD_FILES,
      HttpMethod.POST,
      expect.any(FormData),
      true,
      {skipServerErrorRedirect: true}
    )
  })

  it('moves files and shows success toast', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: {moved: true}} as any)
    await moveFiles({
      requester_user_id: 1,
      requester_user_type: 'DOCTOR',
      file_ids: [1, 2],
      new_parent_path: '/dest',
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)

    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_MOVE_FILES,
      HttpMethod.POST,
      expect.objectContaining({file_ids: [1, 2], new_parent_path: '/dest'})
    )
    expect(mockedSuccessToast).toHaveBeenCalledWith('Your file/files has been moved to /dest')
  })

  it('preserves upload error status for retry handling', async () => {
    mockedApiHelper.mockRejectedValueOnce({
      response: {status: 500, data: {status: {message: 'server error'}}},
    })

    const result = await uploadFiles({
      uploader: {user_id: 1, user_type: 'DOCTOR'},
      owners: [{user_id: 2, user_type: 'PATIENT'}],
      parent_path: '/root',
      files: [new File(['abc'], 'a.txt')],
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)

    expect(result.payload).toEqual(
      expect.objectContaining({
        response: {status: 500},
      })
    )
  })

  it('handles delete and rename calls', async () => {
    mockedApiHelper.mockResolvedValue({data: {}} as any)
    await deleteFiles({
      deleter: {user_id: 1, user_type: 'DOCTOR'},
      owner: {user_id: 2, user_type: 'PATIENT'},
      files_to_delete_by_id: [9],
    })(baseThunkArgs.dispatch, baseThunkArgs.getState, baseThunkArgs.extra)
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_DELETE_FILES,
      HttpMethod.POST,
      expect.any(Object)
    )

    mockedApiHelper.mockResolvedValueOnce({data: {renamed: true}} as any)
    await renameFileOrFolder({file_id: 1, new_name: 'x'})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenLastCalledWith(
      URL_RENAME_FILE_OR_FOLDER,
      HttpMethod.POST,
      expect.objectContaining({new_name: 'x'})
    )
  })

  it('downloads file with responseType arraybuffer', async () => {
    mockedApiHelper.mockResolvedValueOnce({data: new ArrayBuffer(8)} as any)
    await downloadFile({requester_user_id: 1, requester_user_type: 'DOCTOR', file_id: 10})(
      baseThunkArgs.dispatch,
      baseThunkArgs.getState,
      baseThunkArgs.extra
    )
    expect(mockedApiHelper).toHaveBeenCalledWith(
      URL_DOWNLOAD_FILES,
      HttpMethod.POST,
      {requester_user_id: 1, requester_user_type: 'DOCTOR', file_id: 10},
      true,
      {responseType: 'arraybuffer'}
    )
  })
})
