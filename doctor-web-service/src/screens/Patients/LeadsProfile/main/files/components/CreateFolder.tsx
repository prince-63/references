import ModalLayout from 'components/modal/ModalLayout'
import {useContext} from 'react'
import {SVG_CREATE_FOLDER, SVG_RENAME_ICON_PRIMARY} from 'utils/SvgConstants'
import InputText from 'components/atom/Inputs/InputText'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import AntdButton from 'components/atom/Buttons/AntdButton'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getFiles,
  setOpenCreateFolderModal,
  createFolder,
  renameFileOrFolder,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {RowDataForFolders} from '../types/files.types'
import getFileOrFolderTitle from '../utils/getFileOrFolderTitle'
import CrossIcon from 'assets/icons/CrossIcon'
import ModalHeader from './ModalHeader'
import {identifyUser} from 'utils/ConstFunctions'

const CreateFolder = ({
  selectedFileOrFolder,
  onFinish,
}: {
  selectedFileOrFolder: RowDataForFolders | null
  onFinish: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const params = useParams()
  const path = params['*']
  const {userId} = useContext(AuthContext)

  const {isRename} = useSelector((state: RootState) => state.leadsProfileFiles)
  const fileOrFolder = getFileOrFolderTitle(isRename ? [selectedFileOrFolder] : [])
  const formik = useFormik({
    initialValues: {
      folderName: isRename ? (selectedFileOrFolder!.name ?? '') : '',
    },
    validationSchema: Yup.object({
      folderName: Yup.string()
        .required('Required')
        .min(2, 'Must be at least 2 characters')
        .max(30, 'Please enter a valid name with less than 30 characters'),
    }),
    onSubmit: async (values) => {
      try {
        if (!userId || !params.patientId) return
        if (isRename) {
          await dispatchAction(
            renameFileOrFolder({
              file_id: selectedFileOrFolder!.fileId,
              new_name: values.folderName,
            })
          )
            .unwrap()
            .then(async () => {
              await dispatchAction(
                getFiles({
                  doctor_id: userId,
                  patient_id: params.patientId ?? '',
                  path: `/${path}`,
                })
              )
              dispatchAction(setOpenCreateFolderModal(false))
              onFinish()
            })
            .catch(() => {
              formik.setFieldError('folderName', 'A file or folder with this name already exists')
            })
        } else {
          await dispatchAction(
            createFolder({
              parent_path: `/${path}`,
              folder_name: values.folderName,
              uploader: {
                user_id: parseInt(userId),
                user_type: userTypes.DOCTOR,
              },
              owners: [
                {
                  user_id: parseInt(userId),
                  user_type: userTypes.DOCTOR,
                },
                {
                  user_id: parseInt(params.patientId),
                  user_type: userTypes.PATIENT,
                },
              ],
            })
          )
            .unwrap()
            .then(async () => {
              await dispatchAction(
                getFiles({
                  doctor_id: userId,
                  patient_id: params.patientId ?? '',
                  path: `/${path}`,
                })
              )
              dispatchAction(setOpenCreateFolderModal(false))
              onFinish()
            })
            .catch(() => {
              formik.setFieldError('folderName', 'A file or folder with this name already exists')
            })
        }
      } catch (error) {
        console.error(error)
      }
    },
  })

  return (
    <ModalLayout>
      <div className='flex flex-col gap-4'>
        <div className='hidden md:block'>
          <ModalHeader
            {...{
              svg: !isRename ? SVG_CREATE_FOLDER : SVG_RENAME_ICON_PRIMARY,
              onClose: () => {
                dispatchAction(setOpenCreateFolderModal(false))
              },
            }}
          />
        </div>
        <div className=' flex justify-between items-center'>
          <p className='font-semibold text-2xl text-black'>
            {!isRename ? 'Create a folder' : `Rename ${fileOrFolder}`}
          </p>
          <div
            className='cursor-pointer md:hidden'
            onClick={() => {
              dispatchAction(setOpenCreateFolderModal(false))
            }}
          >
            <CrossIcon width='18' height='18' color='black' />
          </div>
        </div>
        <form className='flex flex-col gap-2' onSubmit={formik.handleSubmit}>
          <InputText
            {...{
              placeholder: `Enter ${fileOrFolder} name`,
              label: `Enter ${fileOrFolder} name`,
              name: 'folderName',
              required: true,
              formik,
            }}
          />
          <AntdButton
            className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
            isLoading={formik.isSubmitting}
            text={`${isRename ? 'Rename' : 'Create'} ${fileOrFolder}`}
            onClick={() => {
              identifyUser()

              formik.handleSubmit()
            }}
            disabled={formik.isSubmitting || formik.getFieldProps('folderName').value.length < 2}
          />
        </form>
      </div>
    </ModalLayout>
  )
}

export default CreateFolder
