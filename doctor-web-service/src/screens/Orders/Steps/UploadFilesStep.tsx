import Page from 'components/page/Page'
import Footer from '../components/Footer'
import useDispatchAction from '@hooks/useDispatchAction'
import userOrderDetails from '../hooks/userOrderDetails'
import restructureFileList from './helpers/restructureFileList'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useLocation, useParams} from 'react-router-dom'
import {useContext, useEffect, useState} from 'react'
import {UploadFile} from 'antd'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {downloadFile, uploadFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {CaseRecordFile} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {UploadPreTreatmentPhotos} from 'screens/CaseRecords/components/UploadPreTreatmentPhotos'
import {UploadScanFiles} from 'screens/CaseRecords/components/UploadScanFiles'
import {UploadXrays} from 'screens/CaseRecords/components/UploadXrays'
import {markFilesUploadComplete} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'

interface uploadFileResponse {
  upload_files: CaseRecordFile[]
  failed_to_upload: CaseRecordFile[]
}

const UploadFilesStep = () => {
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {userId} = useContext(AuthContext)
  const {caseRecordData, areAllFilesUploaded} = useSelector((state: RootState) => state.caseRecord)
  const {order, loadingOrder} = userOrderDetails(true)
  const {orderId} = useParams<{orderId: string}>()
  const files = order?.file_details
  const orderPreTreatmentFiles = files?.images ?? []
  const orderScanFiles = files?.scan_files ?? []
  const orderXrayFiles = files?.documents ?? []
  const {state} = useLocation()
  const isCloneOrder = state?.isClone ?? false // Default to false if undefined.
  const showLoadingText = !isCloneOrder
  const [isUploadingPreTreatment, setIsUploadingPreTreatment] = useState(false)
  const [isUploadingScanFiles, setIsUploadingScanFiles] = useState(false)
  const [isUploadingXrayFiles, setIsUploadingXrayFiles] = useState(false)
  const {downloadingFile, orderFileId, patientFileId} = useSelector(
    (state: RootState) => state.leadsProfileFiles
  )
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>(
    restructureFileList(orderPreTreatmentFiles)
  )
  const [uploadedFiles1, setUploadedFiles1] = useState<UploadFile[]>(
    restructureFileList(orderScanFiles)
  )
  const [uploadedFiles2, setUploadedFiles2] = useState<UploadFile[]>(
    restructureFileList(orderXrayFiles)
  )

  const fetchAndUploadFiles = async (
    caseRecordFiles: CaseRecordFile[],
    parentPath: string,
    setUploadedFilesCallback: (files: UploadFile[]) => void,
    setLoadingState: (val: boolean) => void
  ) => {
    // ── Guard clause ──────────────────────────────────────────────────────────
    if (!userId || !orderFileId || !patientFileId || caseRecordFiles.length === 0) {
      return
    }

    try {
      setLoadingState(true)

      const downloadedFiles: File[] = []

      // ── Download each file ───────────────────────────────────────────────────
      for (const file of caseRecordFiles) {
        try {
          const response = await dispatchAction(
            downloadFile({
              requester_user_id: parseInt(userId!),
              requester_user_type: userTypes.DOCTOR,
              file_id: safeParseInt(file?.file_id),
            })
          ).unwrap()

          const blob = new Blob([response], {type: file?.type})

          const fileObject = new File([blob], file?.name, {type: file?.type})

          downloadedFiles.push(fileObject)
        } catch (err) {
          ErrorToast('Cannot upload files from your case record')
        }
      }

      // ── Prepare upload payload ───────────────────────────────────────────────
      const payloadForUploadFiles = {
        uploader: {user_id: parseInt(userId!), user_type: userTypes.DOCTOR},
        owners: [
          {user_id: parseInt(userId!), user_type: userTypes.DOCTOR},
          {user_id: safeParseInt(patientFileId), user_type: userTypes.PATIENT},
        ],
        parent_path: parentPath,
        files: downloadedFiles,
      }

      // ── Upload files ─────────────────────────────────────────────────────────
      const uploadResponse: uploadFileResponse = await dispatchAction(
        uploadFiles(payloadForUploadFiles)
      ).unwrap()

      // ── Update state with new file list ──────────────────────────────────────
      setUploadedFilesCallback(restructureFileList(uploadResponse?.upload_files))
    } catch (e) {
    } finally {
      setLoadingState(false)
    }
  }

  // Main effect to handle initial file uploads from case record
  useEffect(() => {
    if (areAllFilesUploaded) {
      return
    }
    const alreadyUploaded =
      orderPreTreatmentFiles.length > 0 || orderScanFiles.length > 0 || orderXrayFiles.length > 0

    if (alreadyUploaded) {
      return
    }
    // Prevent duplicate uploads

    // Only proceed if we have case record data
    if (!caseRecordData) return

    // If order already has files, mark upload as done

    // Only proceed if we have case record data and haven't uploaded yet
    if (!alreadyUploaded && caseRecordData) {
      const uploadPromises = []

      // Upload pre-treatment files if they exist
      if (caseRecordData?.pre_treatment_files?.length > 0) {
        uploadPromises.push(
          fetchAndUploadFiles(
            caseRecordData.pre_treatment_files,
            `/Orders/Order ${orderFileId}/Images`,
            setUploadedFiles,
            setIsUploadingPreTreatment
          )
        )
      }

      // Upload scan files if they exist
      if (caseRecordData?.scan_files?.length > 0) {
        uploadPromises.push(
          fetchAndUploadFiles(
            caseRecordData.scan_files,
            `/Orders/Order ${orderFileId}/Scan files`,
            setUploadedFiles1,
            setIsUploadingScanFiles
          )
        )
      }

      // Upload x-ray files if they exist
      if (caseRecordData?.xray_files?.length > 0) {
        uploadPromises.push(
          fetchAndUploadFiles(
            caseRecordData.xray_files,
            `/Orders/Order ${orderFileId}/Documents`,
            setUploadedFiles2,
            setIsUploadingXrayFiles
          )
        )
      }

      // Mark as completed after all uploads are done

      Promise.allSettled(uploadPromises).then(() => {
        dispatch(markFilesUploadComplete())
      })
    }
  }, [])

  const isPageLoading =
    loadingOrder ||
    isUploadingPreTreatment ||
    isUploadingScanFiles ||
    isUploadingXrayFiles ||
    downloadingFile

  return (
    <Page
      title='Files'
      loading={isPageLoading}
      exitConfirmPredicate={false}
      loaderText={
        showLoadingText
          ? 'Loading files from the patient’s case records. This may take a few moments...'
          : null
      }
    >
      <div className='flex flex-col gap-3 min-w-3/4'>
        <UploadPreTreatmentPhotos
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          parentPath={`/Orders/Order ${orderId}/Images`}
          patient_id={order?.patient_details?.id}
        />
        <div className='border-b border-mediumGray w-full'></div>
        <UploadScanFiles
          uploadedFiles={uploadedFiles1}
          setUploadedFiles={setUploadedFiles1}
          parentPath={`/Orders/Order ${orderId}/Scan files`}
          patient_id={order?.patient_details?.id}
        />
        <div className='border-b border-mediumGray w-full'></div>
        <UploadXrays
          uploadedFiles={uploadedFiles2}
          setUploadedFiles={setUploadedFiles2}
          parentPath={`/Orders/Order ${orderId}/Documents`}
          patient_id={order?.patient_details?.id}
        />
      </div>
      <Footer
        {...{
          onNext: () => {
            dispatchAction(nextStep())
          },
        }}
      />
      {/* STL modal rendered at parent level to avoid duplicates */}
    </Page>
  )
}

export default UploadFilesStep
