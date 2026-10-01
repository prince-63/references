import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import DownArrowIcon from 'assets/icons/DownArrowIcon'
import When from 'components/when/When'
import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import {IndeterminateCheckbox} from 'screens/Patients/PatientProfile/components/IndeterminateCheckbox'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  downloadFile,
  getFiles,
  setIsStlFilePreviewVisible,
  setOpenMoveFilesModal,
  setStlPreviewUrl,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {fileFormatDateTime} from 'utils/DateFunctions'
import {IMAGE_FOLDER, IMAGE_TREATMENT_START_FUTURE} from 'utils/ImageConst'
import {Image} from 'assets/images/Images/Image'
import ellipse from 'assets/icons/ellipse.svg'
import {identifyUser, openDocument, safeParseInt} from 'utils/ConstFunctions'
import {Popover, Tooltip} from 'antd'
import RenderTableHeader from './RenderTableHeader'
import RenderCell from './RenderCell'
import {RowDataForFolders} from '../types/files.types'
import useMappedFiles from '../hooks/useMappedFiles'
import Spinner from 'components/spinner/Spinner'
import {bytesToMB} from '@utils/bytesToMB'
import hasValue from 'utils/hasValue'
import BulkActionsForFiles from './BulkActionsForFiles'
import CreateFolder from './CreateFolder'

import QuickActionsForFiles from './QuickActionsForFiles'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import DeleteModal from './DeleteModal'
import userTypes from '@constants/userTypes'
import pdfPng from 'assets/images/Pdf.png'
import MoveFilesModal from './MoveFilesModal'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import mp4Png from 'assets/images/mp4.png'
import SubscriptionInfoCardWrapper from 'components/subscription/SubscriptionInfoCardWrapper'
import subscriptionModulesConstants from '@constants/subscriptionModules.constants'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useMediaQuery} from 'react-responsive'
import StlIcon from 'assets/icons/StlIcon'
import getBrandConfig from 'utils/getBrandConfig'
import JSZip from 'jszip'
import {downloadBlob} from 'utils/download'
import InfoToast from 'components/modal/Alert/InfoToast'
import PlyIcon from 'assets/icons/PlyIcon'
import ObjIcon from 'assets/icons/ObjIcon'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_ZIP_FILE} from 'utils/SvgConstants'
import CustomFileDrawer from 'components/drawer/CustomFileDrawer'
import PDFWebview from './PDFWebview'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView: any
  }

const TableContainerForFiles = () => {
  const navigation = useNavigate()
  const params = useParams()
  const location = useLocation()
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data?.patient_details
  const patientName = patientData?.first_name + ' ' + (patientData?.last_name ?? '')
  const [selectedImage, setSelectedImage] = useState<RowDataForFolders>({
    name: '',
    url: '',
    createdBy: '',
    createdOn: '',
    size: 0,
    extension: '',
    folder: false,
    full_path: '',
    fileId: 0,
    default_folder: false,
  })

  const path = params['*']
  const {userId} = useContext(AuthContext)

  const [isDownloading, setIsDownloading] = useState(false)

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedRow, setSelectedRow] = useState<RowDataForFolders | null>(null)
  const {dispatchAction} = useDispatchAction()
  const getCreatedBy = (createdBy: string) => {
    switch (createdBy) {
      case userTypes.DOCTOR:
        return 'You'
      case userTypes.PATIENT:
        return patientName
      default:
        return `${getBrandConfig().name}`
    }
  }

  const {
    files,
    loadingFiles,
    openCreateFolderModal,
    openUploadFilesModal,
    openDeleteModal,
    openMoveFilesModal,
  } = useSelector((state: RootState) => state.leadsProfileFiles)

  const rowFiles = useMappedFiles({files})

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // Function to open PDF viewer
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  // Function to close PDF viewer
  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  const handleDownload = async (selectedFile?: RowDataForFolders) => {
    const files =
      table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
        ? table.getSelectedRowModel().rows.map((row) => row.original)
        : [selectedFile]

    // Sending data from web to mobile application
    window?.ReactNativeWebView?.postMessage(JSON.stringify({file_details: files}))

    if (files.length == 1) {
      identifyUser()
    } else {
      identifyUser()
    }

    setIsDownloading(true)
    const zip = new JSZip()

    for (const file of files) {
      if (!userId || !file?.fileId) return
      const response = await dispatchAction(
        downloadFile({
          requester_user_id: parseInt(userId),
          requester_user_type: userTypes.DOCTOR,
          file_id: safeParseInt(file?.fileId),
        })
      ).unwrap()
      const blob = new Blob([response], {
        type: file?.type || 'application/octet-stream',
      })

      zip.file(file?.name || `file-${file?.fileId}.dat`, blob)
    }
    const zipBlob = await zip.generateAsync({type: 'blob'})
    downloadBlob(zipBlob, `files.zip`)

    setIsDownloading(false)
  }
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})

  const columns = useMemo<ColumnDef<RowDataForFolders>[]>(
    () => [
      {
        id: 'select',
        header: ({table}) =>
          !isTabletAndBelow && (
            <div className='px-1'>
              <IndeterminateCheckbox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getSelectedRowModel().rows.length > 0,
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
            </div>
          ),
        cell: ({row}) => (
          <div className='px-1'>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
        size: 1,
      },
      {
        id: 'name',
        header: ({}) => !isTabletAndBelow && <RenderTableHeader {...{header: 'Name'}} />,
        cell: ({row}) => {
          return (
            <RenderCell>
              <div
                className='flex items-center gap-2 cursor-default'
                onClick={() => {
                  if (!isTabletAndBelow) return
                  if (row.original.extension === 'stl' && row.original.url) {
                    dispatchAction(setStlPreviewUrl(row.original.url))
                    dispatchAction(setIsStlFilePreviewVisible(true))
                    return
                  }
                  // Fixed: Use handleOpenPDF instead of openDocument for PDFs
                  if (row.original?.extension === 'pdf') {
                    handleOpenPDF(row.original.url ?? '', row.original.name)
                    return
                  }
                  if (row.original.extension === 'mp4') {
                    openDocument(row.original.url ?? '')
                    return
                  }
                  if (row.original?.extension !== 'pdf' && !row.original.folder) {
                    setSelectedImage(row.original)
                    setIsShowPhotos(true)
                  }
                  if (row.original.folder) {
                    navigation(`${location.pathname}/${row.original.name}`)
                  }
                }}
              >
                <When isTrue={row.original.folder}>
                  <img className='w-12 h-12 relative' src={IMAGE_FOLDER} alt='' />
                </When>
                <When
                  isTrue={
                    !row.original.folder &&
                    row.original.extension !== 'pdf' &&
                    row.original.extension !== 'mp4' &&
                    row.original.extension !== 'stl' &&
                    row.original.extension !== 'obj' &&
                    row.original.extension !== 'ply' &&
                    row.original.extension !== 'zip'
                  }
                >
                  <Image
                    className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer bg-transparent'
                    src={row.original.url ?? ''}
                    size={20}
                    alt=''
                    showLoading={true}
                    onClick={(e: React.MouseEvent<HTMLImageElement>) => {
                      e.stopPropagation()
                      setSelectedImage(row.original)
                      setIsShowPhotos(true)
                    }}
                  />
                </When>
                <When isTrue={!row.original.folder && row.original.extension === 'pdf'}>
                  <Image
                    className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                    onClick={() => handleOpenPDF(row.original.url ?? '', row.original.name)}
                    size={20}
                    src={pdfPng}
                  />
                </When>
                <When isTrue={!row.original.folder && row.original.extension === 'zip'}>
                  <CommonSVG svg={SVG_ZIP_FILE} width='48' height='48' />
                </When>
                <When isTrue={row.original.extension === 'mp4'}>
                  <Image
                    className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                    onClick={() => openDocument(row.original.url ?? '')}
                    size={20}
                    src={mp4Png}
                  />
                </When>
                <When
                  isTrue={
                    row.original.extension === 'stl' ||
                    row.original.extension === 'obj' ||
                    row.original.extension === 'ply'
                  }
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      if (row.original.url && row.original.name.endsWith('.stl')) {
                        dispatchAction(setStlPreviewUrl(row.original.url))
                        dispatchAction(setIsStlFilePreviewVisible(true))
                      } else {
                        InfoToast('No preview available. Please download to view file')
                      }
                    }}
                    className='cursor-pointer'
                  >
                    {row.original.extension === 'stl' && <StlIcon />}
                    {row.original.extension === 'ply' && <PlyIcon />}
                    {row.original.extension === 'obj' && <ObjIcon />}
                  </div>
                </When>
                <div className='flex flex-col'>
                  <p className='hidden md:block break-all'>
                    <Tooltip
                      title={row.original.name}
                      overlayClassName='fixed'
                      overlayInnerStyle={{
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontFamily: 'figtree',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                      arrow={false}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
                      placement='topLeft'
                    >
                      {row.original.name.length > 50
                        ? `${row.original.name.slice(0, 50)}...`
                        : row.original.name}
                    </Tooltip>
                  </p>
                  <p className='font-medium text-black text-base md:hidden break-all'>
                    {row.original.name.length > 25
                      ? `${row.original.name.slice(0, 25)}...`
                      : row.original.name}
                  </p>
                  <p className='md:hidden font-medium text-sm'>
                    {bytesToMB(row.original.size)} MB,{fileFormatDateTime(row.original.createdOn)}
                  </p>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 300,
      },
      {
        id: 'createdBy',
        header: ({}) => <RenderTableHeader {...{header: 'Created by'}} />,
        cell: ({row}) => {
          return (
            <RenderCell>
              {row.original.default_folder
                ? `${getBrandConfig().name}`
                : getCreatedBy(row?.original?.createdBy)}
            </RenderCell>
          )
        },
        size: 50,
      },
      {
        id: 'createdOn',
        header: ({}) => <RenderTableHeader {...{header: 'Created on'}} />,
        cell: ({row}) => {
          return <RenderCell>{fileFormatDateTime(row?.original?.createdOn)}</RenderCell>
        },
      },
      {
        id: 'size',
        header: ({}) => !isTabletAndBelow && <RenderTableHeader {...{header: 'Size'}} />,
        size: isTabletAndBelow ? 50 : 150,
        cell: ({row}) => {
          const [openPopover, setOpenPopover] = useState(false)
          return (
            <RenderCell>
              <When isTrue={!isTabletAndBelow}>
                <div className='md:flex justify-between hidden'>
                  {bytesToMB(row?.original?.size)} MB
                  <When isTrue={table.getSelectedRowModel().rows.length === 0}>
                    <Popover
                      content={
                        <QuickActionsForFiles
                          disabled={
                            (row.original.folder && row.original.default_folder) ||
                            row.original.files_from_treatment_plan
                          }
                          handleDownload={handleDownload}
                          selectedRow={row.original}
                          moveDisabled={row.original.folder}
                          setOpen={setOpenPopover}
                        />
                      }
                      getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
                      placement='bottomLeft'
                      trigger={['click']}
                      open={openPopover}
                      onOpenChange={(open) => {
                        setOpenPopover(open)
                        if (open) {
                          setSelectedRow(row.original)
                        }
                      }}
                      className='transition ease-in-out duration-200'
                    >
                      <img
                        src={ellipse}
                        alt=''
                        className='cursor-pointer'
                        onClick={(e) => e.stopPropagation()} // Stop event propagation here
                      />
                    </Popover>
                  </When>
                </div>
              </When>
              <When isTrue={isTabletAndBelow}>
                <div className='md:hidden cursor-pointer flex justify-end mr-2 '>
                  <When isTrue={table.getSelectedRowModel().rows.length === 0}>
                    <Popover
                      content={
                        <QuickActionsForFiles
                          disabled={row.original.folder && row.original.default_folder}
                          handleDownload={handleDownload}
                          selectedRow={row.original}
                          moveDisabled={row.original.folder}
                          setOpen={setOpenPopover}
                        />
                      }
                      open={openPopover}
                      placement='bottomLeft'
                      trigger={['click']}
                      onOpenChange={(open) => {
                        setOpenPopover(open)
                        if (open) {
                          setSelectedRow(row.original)
                        }
                      }}
                      className='transition ease-in-out duration-200'
                    >
                      <img
                        src={ellipse}
                        alt=''
                        className='rotate-90'
                        onClick={(e) => e.stopPropagation()} // Stop event propagation here
                      />
                    </Popover>
                  </When>
                </div>
              </When>
            </RenderCell>
          )
        },
      },
    ],
    [rowFiles, pdfViewer, handleOpenPDF] // Added dependencies
  )
  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()

  const table = useReactTable({
    columns,
    data: rowFiles,
    state: {rowSelection, sorting},
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        createdBy: !isTabletAndBelow,
        createdOn: !isTabletAndBelow,
      },
    },
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
  })
  useEffect(() => {
    table.toggleAllRowsSelected(false)
    if (!userId || !params.patientId) return console.error(' User Id not found')
    dispatchAction(
      getFiles({
        path: `/${path}`,
        doctor_id: userId,
        patient_id: params.patientId,
      })
    )
  }, [userId, path])
  const getImagesList = () => {
    const isImage = (row: RowDataForFolders) =>
      row.extension !== undefined &&
      row.url !== undefined &&
      !['pdf', 'mp4', 'stl'].includes(row.extension) &&
      !row.folder &&
      row.url !== selectedImage.url

    const formatImage = (image: RowDataForFolders) => ({
      src: image.url!,
      alt: image.name,
      title: image.name,
      width: '100%',
      height: '100%',
    })

    return [selectedImage, ...rowFiles.filter(isImage)].map(formatImage)
  }

  return (
    <div className='w-full flex flex-col  h-[calc(100vh-21rem)] md:h-[calc(100vh-9rem)] overflow-auto card-wrapper'>
      {/* PDF Viewer - Render at the top level when open */}
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {/* Only show the rest of the content when PDF viewer is closed */}
      {!pdfViewer.isOpen && (
        <>
          <When isTrue={isShowPhotos}>
            <ImageViewer setIsShowPhotos={setIsShowPhotos} selectedImagesList={getImagesList()} />
          </When>
          <When isTrue={loadingFiles}>
            <div className='flex flex-col justify-center items-center gap-5 h-[calc(100vh-20rem)]'>
              <Spinner loading />
            </div>
          </When>

          <When isTrue={!loadingFiles}>
            <SubscriptionInfoCardWrapper
              {...{
                type: subscriptionModulesConstants.storage,
                subscriptionData,
                loadingSubscriptionData,
              }}
            />

            <When isTrue={!hasValue(rowFiles)}>
              <CommonEmptyState
                image={IMAGE_TREATMENT_START_FUTURE}
                subTitle="You haven't added any files here. You can add and share with your patients."
                boxStyle='gap-7 h-[25rem] text-center'
              />
            </When>
            <When isTrue={hasValue(rowFiles)}>
              <table className='table-auto w-full mb-8 md:mt-2'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup, index: number) => (
                    <tr key={index} className='md:border-b bottom-2 border-textColor'>
                      {headerGroup.headers.map((header, index: number) => {
                        return (
                          <th
                            className={`text-start text-black text-sm font-medium md:py-2 px-4`}
                            key={index}
                            colSpan={header.colSpan}
                            style={{width: `${header.column.getSize()}px`}}
                          >
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none'
                                  : '',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              <div className='flex gap-2'>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: <DownArrowIcon className='transform rotate-180' />,
                                  desc: <DownArrowIcon />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    const isSelected = row.getIsSelected()

                    const getBackgroundColorClass = () => {
                      if (isSelected) return 'bg-[#E9F3FA]'
                      else return 'hover:bg-primarySupport'
                    }

                    const className = `border-b border-mediumGray text-black text-base group ${getBackgroundColorClass()}`
                    return (
                      <tr
                        key={row.id}
                        className={className}
                        onDoubleClick={(e) => {
                          e.stopPropagation()

                          if (row.original.extension === 'stl') {
                            dispatchAction(setStlPreviewUrl(row.original.url))
                            dispatchAction(setIsStlFilePreviewVisible(true))
                            return
                          }

                          if (row.original?.extension === 'pdf') {
                            handleOpenPDF(row.original.url ?? '', row.original.name)
                            return
                          }

                          if (row.original.extension === 'mp4') {
                            openDocument(row.original.url ?? '')
                            return
                          }

                          if (row.original?.extension !== 'pdf' && !row.original.folder) {
                            setSelectedImage(row.original)
                            setIsShowPhotos(true)
                          }

                          if (row.original.folder) {
                            navigation(`${location.pathname}/${row.original.name}`)
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className='md:px-4'>
                            <div className='py-4'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <When isTrue={table.getSelectedRowModel().rows.length > 0}>
                <div className='absolute bottom-0 right-0 left-0'>
                  <BulkActionsForFiles
                    noOfItemsSelected={table.getSelectedRowModel().rows.length}
                    onClickDownload={handleDownload}
                    isDownloading={isDownloading}
                    onClickActionMenu={() => {
                      dispatchAction(setOpenMoveFilesModal(true))
                    }}
                    deletedDisabled={table
                      .getSelectedRowModel()
                      .rows.some(
                        (row) =>
                          row.original.default_folder || row.original.files_from_treatment_plan
                      )}
                    moveDisabled={table
                      .getSelectedRowModel()
                      .rows.some((row) => row.original.folder)}
                  />
                </div>
              </When>
            </When>
          </When>
          <When isTrue={openCreateFolderModal}>
            <CreateFolder
              {...{
                selectedFileOrFolder: selectedRow,
                onFinish: () => {
                  table.toggleAllRowsSelected(false)
                },
              }}
            />
          </When>
          <When isTrue={openUploadFilesModal}>
            <CustomFileDrawer />
          </When>
          <When isTrue={openDeleteModal}>
            <DeleteModal
              {...{
                selectedFilesOrFolders:
                  table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
                    ? table.getSelectedRowModel().rows.map((row) => row.original)
                    : [selectedRow].filter(Boolean),
                onFinish: () => {
                  table.toggleAllRowsSelected(false)
                },
              }}
            />
          </When>
          <When isTrue={openMoveFilesModal}>
            <MoveFilesModal
              {...{
                selectedFilesOrFolders:
                  table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
                    ? table.getSelectedRowModel().rows.map((row) => row.original)
                    : [selectedRow].filter(Boolean),
                onFinish: async () => {
                  table.toggleAllRowsSelected(false)
                },
              }}
            />
          </When>
        </>
      )}
    </div>
  )
}

export default TableContainerForFiles
