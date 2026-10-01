import ModalLayout from 'components/modal/ModalLayout'
import React, {useContext} from 'react'
import ModalHeader from './ModalHeader'
import {SVG_DELETE_ICON_FILES} from 'utils/SvgConstants'
import AntdButton from 'components/atom/Buttons/AntdButton'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  deleteFiles,
  getFiles,
  setOpenDeleteModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {RowDataForFolders} from '../types/files.types'
import getFileOrFolderTitle from '../utils/getFileOrFolderTitle'
import {useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {useMediaQuery} from 'react-responsive'
import {identifyUser} from 'utils/ConstFunctions'

const DeleteModal = ({
  selectedFilesOrFolders,
  onFinish,
}: {
  selectedFilesOrFolders: (RowDataForFolders | null)[] | null
  onFinish: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {deletingFiles} = useSelector((state: RootState) => state.leadsProfileFiles)
  const fileOrFolder = getFileOrFolderTitle(selectedFilesOrFolders)
  const params = useParams()

  const path = params['*']
  const {userId} = useContext(AuthContext)
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  return (
    <ModalLayout>
      <div className='flex flex-col gap-4'>
        <div className='flex justify-center items-center md:block'>
          <ModalHeader
            {...{
              svg: SVG_DELETE_ICON_FILES,
              showCloseIcon: !isTabletAndBelow,
              onClose: () => {
                dispatchAction(setOpenDeleteModal(false))
              },
              className: 'bg-redSupport',
            }}
          />
        </div>
        <p className='font-bold text-2xl text-black text-center md:text-start'>
          Are you sure you want to delete selected {fileOrFolder}?
        </p>
        <p className='font-normal text-base text-textColor text-center md:text-start'>
          Deleting this will permanently remove it from your files. Confirm your decision to proceed
        </p>
        <div className='flex gap-2 justify-between delete-file'>
          <button
            className='border border-red rounded-md w-full text-red'
            type='button'
            disabled={deletingFiles}
            onClick={() => {
              dispatchAction(setOpenDeleteModal(false))
            }}
          >
            Cancel
          </button>

          <AntdButton
            className='bg-red hover:bg-red text-white h-12 font-semibold text-base w-full'
            isLoading={deletingFiles}
            text={`Delete   ${fileOrFolder}`}
            onClick={async () => {
              if (!userId || !params.patientId) return
              const payloadForDeleteFiles = {
                deleter: {
                  user_id: parseInt(userId),
                  user_type: userTypes.DOCTOR,
                },
                owner: {
                  user_id: parseInt(params.patientId),
                  user_type: userTypes.PATIENT,
                },
                files_to_delete_by_id: selectedFilesOrFolders
                  ?.map((file) => file?.fileId)
                  .filter((fileId) => fileId !== undefined) as number[],
              }

              if (payloadForDeleteFiles.files_to_delete_by_id.length === 1) {
                identifyUser()
              } else {
                identifyUser()
              }

              await dispatchAction(deleteFiles(payloadForDeleteFiles))
              dispatchAction(setOpenDeleteModal(false))
              await dispatchAction(
                getFiles({
                  doctor_id: userId,
                  patient_id: params.patientId,
                  path: `/${path}`,
                })
              )
              onFinish()
            }}
            disabled={deletingFiles}
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default DeleteModal
