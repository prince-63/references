import ModalLayout from 'components/modal/ModalLayout'
import {useContext, useEffect, useMemo, useState} from 'react'
import {SVG_CREATE_FOLDER} from 'utils/SvgConstants'
import ModalHeader from './ModalHeader'
import InputText from 'components/atom/Inputs/InputText'
import {useFormik} from 'formik'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {Breadcrumb, Empty} from 'antd'

import useDispatchAction from '@hooks/useDispatchAction'

import {
  getFiles,
  getFilesForMoveModal,
  moveFiles,
  setOpenMoveFilesModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {RowDataForFolders} from '../types/files.types'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import hasValue from 'utils/hasValue'
import useMappedFiles from '../hooks/useMappedFiles'
import RenderCell from './RenderCell'
import {DISABLED_IMAGE_FOLDER, IMAGE_FOLDER, IMAGE_TREATMENT_START_FUTURE} from 'utils/ImageConst'
import userTypes from '@constants/userTypes'
import TickIcon from 'assets/icons/TickIcon'
import {useMediaQuery} from 'react-responsive'
import {IndeterminateCheckbox} from 'screens/Patients/PatientProfile/components/IndeterminateCheckbox'
import clsx from 'clsx'
import PDFWebview from './PDFWebview'

const MoveFilesModal = ({
  selectedFilesOrFolders,
  onFinish,
}: {
  selectedFilesOrFolders: (RowDataForFolders | null)[] | null
  onFinish: () => void
}) => {
  const {dispatchAction} = useDispatchAction()

  const {userId} = useContext(AuthContext)
  const params = useParams()
  const path = params['*']

  const [currentPath, setCurrentPath] = useState('')

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // PDF handler functions - Add these
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  useEffect(() => {
    if (!userId || !params.patientId) return
    dispatchAction(
      getFilesForMoveModal({
        path: `/${currentPath}`,
        doctor_id: userId,
        patient_id: params.patientId,
      })
    )
  }, [userId, currentPath, params.patientId])
  const {moveModalFiles: files, loadingMoveFiles: loadingFiles} = useSelector(
    (state: RootState) => state.leadsProfileFiles
  )
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const rowFiles = useMappedFiles({files, isMoveFilesModal: true})

  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})

  const columns = useMemo<ColumnDef<RowDataForFolders>[]>(
    () => [
      {
        id: 'select',
        cell: ({row}) => {
          const isDisabledToMoveSelectedFolder = row?.original.children_files?.some((file) =>
            selectedFilesOrFolders?.some((item) => item?.full_path === file.full_path)
          )
          return (
            <div className='px-1'>
              <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: () => {
                    if (isDisabledToMoveSelectedFolder) return
                    moveModalFilesTable.toggleAllRowsSelected(false)
                    row.toggleSelected(true)
                  },
                  type: 'radio',
                  className: clsx('px-10 py-10', isDisabledToMoveSelectedFolder && 'opacity-50'),
                }}
              />
            </div>
          )
        },
        size: 1,
      },
      {
        id: 'name',
        cell: ({row}) => {
          const isDisabledToMoveSelectedFolder = row?.original.children_files?.some((file) =>
            selectedFilesOrFolders?.some((item) => item?.full_path === file.full_path)
          )
          const isDisabled =
            isDisabledToMoveSelectedFolder &&
            !row.original.children_files?.some((file) => file.folder)
          return (
            <RenderCell>
              <div
                className='flex items-center cursor-default justify-between'
                onClick={() => {
                  if (!isTabletAndBelow || isDisabled) return
                  if (row.original?.extension === 'pdf' || row.original.extension === 'mp4') {
                    handleOpenPDF(row.original.url ?? '')
                    return
                  }

                  if (row.original.folder) {
                    moveModalFilesTable.toggleAllRowsSelected(false)
                    setCurrentPath(`${currentPath}/${row.original.name}`)
                  }
                }}
              >
                <div className='flex gap-2 items-center '>
                  <img
                    className='w-12 h-12 relative'
                    src={isDisabled ? DISABLED_IMAGE_FOLDER : IMAGE_FOLDER}
                    alt=''
                  />
                  <p className={`${isDisabled && 'text-grayDisabled '}`}>{row.original.name}</p>
                </div>
                <When isTrue={row.getIsSelected()}>
                  <div className='hidden md:block'>
                    <TickIcon color='#666666' />
                  </div>
                </When>
              </div>
            </RenderCell>
          )
        },
        size: 300,
      },
    ],
    [rowFiles]
  )
  const [filteredRowFiles, setFilteredRowFiles] = useState(rowFiles)

  const moveModalFilesTable = useReactTable({
    columns,
    data: filteredRowFiles,
    state: {rowSelection, sorting},
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        select: isTabletAndBelow,
      },
    },
  })
  const formik = useFormik({
    initialValues: {
      folderName: '',
    },
    onSubmit: async () => {
      if (!userId || !params.patientId) return
      const destinationPath =
        moveModalFilesTable.getSelectedRowModel().rows[0].original.full_path.split('/files')[1] ||
        ''
      await dispatchAction(
        moveFiles({
          new_parent_path: `${destinationPath}`,
          file_ids: selectedFilesOrFolders!.map((file) => file!.fileId),
          requester_user_type: userTypes.DOCTOR,
          requester_user_id: parseInt(userId),
        })
      )
      await dispatchAction(
        getFiles({
          doctor_id: userId,
          patient_id: params.patientId,
          path: `/${path}`,
        })
      )
      dispatchAction(setOpenMoveFilesModal(false))
      onFinish()
    },
  })
  useEffect(() => {
    if (formik.values.folderName.length >= 2) {
      setFilteredRowFiles(
        rowFiles.filter((file) =>
          file.name.toLowerCase().includes(formik.values.folderName.toLowerCase())
        )
      )
    } else {
      setFilteredRowFiles(rowFiles)
    }
  }, [rowFiles, formik.values.folderName])
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event)
  }
  const pathParts = currentPath?.split('/').filter((part) => part)
  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <ModalLayout isResponsive={true} className=' md:w-[628px] min-w-[33vw] overflow-y-auto '>
          <div className='flex flex-col gap-4 justify-between'>
            <ModalHeader
              {...{
                svg: SVG_CREATE_FOLDER,
                onClose: () => {
                  dispatchAction(setOpenMoveFilesModal(false))
                },
              }}
            />
            <p className='font-semibold text-2xl text-black'>Move to folder</p>
            <form className='flex flex-col gap-2 ' onSubmit={formik.handleSubmit}>
              <div className='flex items-center gap-3'>
                <p>Current location: </p>
                <RenderCell>
                  <div className='flex items-center justify-between gap-2 cursor-default rounded-[4px] border border-mediumGray px-1.5'>
                    <img className='w-8 h-w-8 relative' src={IMAGE_FOLDER} alt='' />
                    {selectedFilesOrFolders &&
                      selectedFilesOrFolders[0]?.full_path.split('/').slice(-2, -1)[0]}
                  </div>
                </RenderCell>
              </div>
              <InputText
                {...{
                  placeholder: `Search folder`,
                  label: `Search folder`,
                  name: 'folderName',
                  formik,
                  onChange: handleSearchChange,
                  maxLength: 30,
                }}
              />
              <div className='text-sm text-textColor '>
                <p>Select folder</p>
                <p>
                  {' '}
                  {isTabletAndBelow
                    ? 'Single click to enter the folder, select the radio button to select the folder'
                    : 'Double-click to enter the folder, single click to select'}
                </p>
              </div>

              <Breadcrumb
                className='cursor-pointer'
                separator='>'
                itemRender={(route, params, routes) => {
                  const isLastItem = routes.indexOf(route) === routes.length - 1
                  return isLastItem ? (
                    <span className='text-black font-semibold'>{route.title}</span>
                  ) : (
                    <a className='text-textColor font-semibold' onClick={route.onClick}>
                      {route.title}
                    </a>
                  )
                }}
                items={[
                  {
                    title: 'Patient files',
                    onClick: () => setCurrentPath(''),
                  },
                  ...pathParts?.map((part, index) => ({
                    title: part,
                    onClick: () => {
                      const newPath = pathParts.slice(0, index + 1).join('/')
                      setCurrentPath(newPath)
                    },
                  })),
                ]}
              />
              <When isTrue={loadingFiles}>
                <div className='flex flex-col justify-center items-center gap-5 h-[40vh]'>
                  <Spinner loading />
                </div>
              </When>
              <When isTrue={!loadingFiles}>
                <When isTrue={!hasValue(rowFiles)}>
                  <div className='flex flex-col justify-center items-center gap-7 py-4'>
                    <img
                      src={IMAGE_TREATMENT_START_FUTURE}
                      alt=''
                      width={'150px'}
                      height={'100px'}
                    />
                    <p className='text-lg text-textColor text-center'>
                      You haven't added any folders here.
                    </p>
                  </div>
                </When>

                <When isTrue={hasValue(rowFiles)}>
                  <When isTrue={!hasValue(filteredRowFiles)}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </When>
                  <div className='max-h-[calc(100vh-27rem)] md:max-h-[calc(100vh-30rem)] overflow-y-auto'>
                    <table className='table-auto w-full mb-2  mt-2'>
                      <tbody>
                        {moveModalFilesTable.getRowModel().rows.map((row) => {
                          const isSelected = row.getIsSelected()

                          const getBackgroundColorClass = () => {
                            if (isSelected) return 'bg-[#F5F4FE]'
                            else return 'hover:bg-primarySupport'
                          }
                          const isLastRow =
                            row.index === moveModalFilesTable.getRowModel().rows.length - 1
                          const isDisabledToMoveSelectedFolder = row?.original.children_files?.some(
                            (file) =>
                              selectedFilesOrFolders?.some(
                                (item) => item?.full_path === file.full_path
                              )
                          )
                          const isDisabled =
                            isDisabledToMoveSelectedFolder &&
                            !row.original.children_files?.some((file) => file.folder)
                          const className = `${
                            isLastRow ? '' : 'border-b border-mediumGray'
                          } text-black text-base group ${getBackgroundColorClass()} ${
                            isDisabled && 'opacity-75'
                          }`
                          return (
                            <tr key={row.id} className={className}>
                              {row.getVisibleCells().map((cell) => {
                                return (
                                  <td key={cell.id} className=' md:px-4 '>
                                    <div
                                      className={` py-2`}
                                      onClick={() => {
                                        if (isDisabledToMoveSelectedFolder || isTabletAndBelow)
                                          return
                                        moveModalFilesTable.toggleAllRowsSelected(false)
                                        row.toggleSelected(true)
                                      }}
                                      onDoubleClick={() => {
                                        if (row.original?.extension === 'pdf')
                                          handleOpenPDF(row.original.url ?? '')
                                        if (row.original.folder) {
                                          moveModalFilesTable.toggleAllRowsSelected(false)
                                          setCurrentPath(`${currentPath}/${row.original.name}`)
                                        }
                                      }}
                                    >
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </When>
              </When>
              <AntdButton
                className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
                isLoading={formik.isSubmitting}
                text='Move to folder'
                onClick={() => {
                  formik.handleSubmit()
                }}
                disabled={
                  formik.isSubmitting ||
                  !(moveModalFilesTable.getSelectedRowModel().rows.length > 0)
                }
              />
            </form>
          </div>
        </ModalLayout>
      )}
    </>
  )
}

export default MoveFilesModal
