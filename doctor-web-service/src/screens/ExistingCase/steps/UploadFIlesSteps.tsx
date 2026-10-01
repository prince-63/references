import {useContext, useEffect, useState} from 'react'
import {Divider, UploadFile} from 'antd'
import {UploadPreTreatmentPhotos} from 'screens/CaseRecords/components/UploadPreTreatmentPhotos'
import {UploadScanFiles} from 'screens/CaseRecords/components/UploadScanFiles'
import {UploadXrays} from 'screens/CaseRecords/components/UploadXrays'
import restructureFileList from 'screens/Orders/Steps/helpers/restructureFileList'
import Footer from '../components/Footer'
import useDispatchAction from '@hooks/useDispatchAction'
import {nextStep} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {useParams} from 'react-router-dom'
import {getFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {AuthContext} from 'context/AuthContext'
import Page from 'components/page/Page'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'

const UploadFIlesSteps = () => {
  const {dispatchAction} = useDispatchAction()
  const [uploadedImages, setUploadedImages] = useState<UploadFile[]>(restructureFileList())
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>(restructureFileList())
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>(restructureFileList())
  const {patientId} = useParams<{patientId: string}>()
  const {userId} = useContext(AuthContext)
  const [loading, setLoading] = useState<boolean>(false)
  const {patientDetails} = useSelector((state: RootState) => state.orders)
  const patientData = hasValue(patientDetails) ? patientDetails?.patient_details : null

  const fetchFilesFromPath = async () => {
    if (patientId && userId) {
      setLoading(true)
      try {
        // fetch images
        const imagesRes = await dispatchAction(
          getFiles({
            doctor_id: userId,
            patient_id: patientId,
            path: '/Images/Pre treatment photos',
          })
        ).unwrap()

        setUploadedImages(restructureFileList(imagesRes))

        // fetch scans
        const scansRes = await dispatchAction(
          getFiles({
            doctor_id: userId,
            patient_id: patientId,
            path: '/3D Files/Scan files',
          })
        ).unwrap()

        setUploadedScanFiles(restructureFileList(scansRes))

        // fetch scans
        const xRayRes = await dispatchAction(
          getFiles({
            doctor_id: userId,
            patient_id: patientId,
            path: '/Documents',
          })
        ).unwrap()
        setUploadedXrayFiles(restructureFileList(xRayRes))

        setLoading(false)
      } catch (err) {
        console.error('Error fetching files', err)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchFilesFromPath()
  }, [patientId, userId])

  return (
    <Page
      title={'Files'}
      loading={loading}
      containerClassName={
        hasValue(patientData) && patientData?.is_practice_assigned
          ? 'mt-8 sm:mt-0 max-h-screen overflow-y-auto'
          : ''
      }
    >
      <div className='flex flex-col w-full'>
        <div className='flex flex-col gap-3 min-w-3/4 md:pb-16 pb-36 lg:pb-32'>
          <UploadPreTreatmentPhotos
            uploadedFiles={uploadedImages}
            setUploadedFiles={setUploadedImages}
            patient_id={safeParseInt(patientId)}
          />
          <Divider />
          <UploadScanFiles
            uploadedFiles={uploadedScanFiles}
            setUploadedFiles={setUploadedScanFiles}
            patient_id={safeParseInt(patientId)}
          />
          <Divider />
          <UploadXrays
            uploadedFiles={uploadedXrayFiles}
            setUploadedFiles={setUploadedXrayFiles}
            patient_id={safeParseInt(patientId)}
          />
        </div>
        <Footer
          {...{
            onNext: () => {
              dispatchAction(nextStep())
            },
          }}
        />
      </div>
    </Page>
  )
}

export default UploadFIlesSteps
