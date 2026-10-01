import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {Formik} from 'formik'
import {UploadFile, message, Spin} from 'antd'
import {useSelector} from 'react-redux'
import {CaseRecordsForm} from 'screens/CaseRecords/components'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import {useCreateCaseRecordAction} from 'screens/CaseRecords/hook'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {APIPostData} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {RootState} from 'redux/store'
import {
  getAllCaseRecord,
  resetCaseRecordState,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import hasValue from 'utils/hasValue'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import userTypes from '@constants/userTypes'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import When from 'components/when/When'
import Footer from '../components/Footer'
import {nextStep} from 'redux/Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import {useSearchParams} from 'react-router-dom'

export const CaseFilesSelector = () => {
  const {createNewCaseRecord} = useCreateCaseRecordAction()
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient_id')

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>([])
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const isSavingRef = useRef(false)

  const {allCaseRecords, loadingGetAll} = useSelector((state: RootState) => state.caseRecord)

  useEffect(() => {
    // Reset previous patient's data before fetching new records
    dispatchAction(resetCaseRecordState())
    setUploadedFiles([])
    setUploadedScanFiles([])
    setUploadedXrayFiles([])

    if (patientId) {
      dispatchAction(getAllCaseRecord({patient_id: safeParseInt(patientId)}))
    }

    return () => {
      dispatchAction(resetCaseRecordState())
    }
  }, [patientId])

  const caseRecordOptions = useMemo(
    () =>
      !!allCaseRecords && allCaseRecords?.length > 0
        ? allCaseRecords?.map((record) => ({
            value: record.case_record_id,
            label: `Case Record #${record.case_record_id}`,
          }))
        : [],
    [allCaseRecords]
  )

  const hasExistingCaseRecords = useMemo(() => caseRecordOptions.length > 0, [caseRecordOptions])

  const extractNewFileIds = (files: UploadFile[]) =>
    files
      .filter((file) => typeof file.uid !== 'string')
      .map((file) => {
        if (typeof file.uid === 'number') return file.uid
        return safeParseInt(file.uid)
      })
      .filter((id) => !!id && !Number.isNaN(id))

  const getButtonText = () => {
    if (isUploading) return 'Uploading...'
    if (isSaving) return 'Saving...'
    return 'Save & Continue'
  }

  const saveCaseRecordAndContinue = async (caseRecordId?: number | null) => {
    if (isUploading || isSavingRef.current) return

    if (!patientId) {
      message.error('Missing patient information. Please reload and try again.')
      return
    }

    const hasAnyFile =
      uploadedFiles.length > 0 || uploadedScanFiles.length > 0 || uploadedXrayFiles.length > 0

    const shouldShowSaveError = hasAnyFile || !!caseRecordId
    isSavingRef.current = true
    setIsSaving(true)
    try {
      if (!hasAnyFile && !caseRecordId) {
        const res: any = await dispatchAction(
          getPatientDetails({patientId: safeParseInt(patientId)})
        ).unwrap()
        const postData = {
          data: {
            first_name: res.first_name,
            last_name: res.last_name,
            email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
            mobile: res.mobile !== '' ? res.mobile : null,
            country_code: res.country_code,
            practice_location_name: res.practice_location !== '' ? res.practice_location : null,
            inviter_id: userId,
            inviter_user_type: userTypes.DOCTOR,
            customer_mapped_id: res.customer_mapped_id?.trim(),
            age: res.age,
            gender: res.gender,
            practice_location_id: res?.practice_location_id ?? null,
            country: res.country,
            state: res.state,
            city: res.city,
            practice_profile_id: profileId,
            practice_invite_code: null,
            current_step: 4,
            patient_id: patientId,
          },
        }
        await dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any)).unwrap()
        dispatchAction(nextStep())
        return
      }

      const requestBody: APIPostData = {
        chief_complaint: '',
        pre_treatment_file_ids: extractNewFileIds(uploadedFiles),
        scan_file_ids: extractNewFileIds(uploadedScanFiles),
        xray_file_ids: extractNewFileIds(uploadedXrayFiles),
        patient_id: safeParseInt(patientId),
        profile_id: safeParseInt(profileId),
        doctor_id: safeParseInt(userId),
        case_record_id: caseRecordId ?? null,
      }

      await createNewCaseRecord(requestBody)
      const res: any = await dispatchAction(
        getPatientDetails({patientId: safeParseInt(patientId)})
      ).unwrap()
      const postData = {
        data: {
          first_name: res.first_name,
          last_name: res.last_name,
          email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
          mobile: res.mobile !== '' ? res.mobile : null,
          country_code: res.country_code,
          practice_location: res.practice_location !== '' ? res.practice_location : null,
          inviter_id: userId,
          inviter_user_type: userTypes.DOCTOR,
          customer_mapped_id: res.customer_mapped_id?.trim(),
          age: res.age,
          gender: res.gender,
          practice_location_id: null,
          country: res.country,
          state: res.state,
          city: res.city,
          practice_profile_id: profileId,
          practice_invite_code: null,
          current_step: 4,
          patient_id: patientId,
        },
      }
      await dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any)).unwrap()
      dispatchAction(nextStep())
    } catch (error) {
      console.error('Failed to create/update case record', error)
      if (shouldShowSaveError) {
        message.error('Failed to save case files. Please try again.')
      }
    } finally {
      setIsSaving(false)
      isSavingRef.current = false
    }
  }

  if (loadingGetAll) {
    return <Spin spinning={loadingGetAll} className='w-full' />
  }

  return (
    <>
      <When isTrue={caseRecordOptions.length > 0}>
        <Formik
          enableReinitialize
          initialValues={{
            case_record: hasExistingCaseRecords
              ? (caseRecordOptions[caseRecordOptions.length - 1]?.value ?? null)
              : null,
          }}
          onSubmit={() => {
            // handled manually via saveCaseRecordAndContinue
          }}
        >
          {({values, setFieldValue}) => (
            <>
              <div className='flex flex-col w-full mb-6 '>
                <FormikSelectList
                  name='case_record'
                  items={caseRecordOptions}
                  label='Select existing case record'
                  placeholder={
                    loadingGetAll
                      ? 'Loading...'
                      : hasExistingCaseRecords
                        ? 'Select a case record'
                        : 'No existing case records'
                  }
                  disabled={loadingGetAll || !hasExistingCaseRecords}
                  onChange={(value) => setFieldValue('case_record', value)}
                  allowClear
                />

                {(!hasExistingCaseRecords || hasValue(values.case_record)) && (
                  <CaseRecordsForm
                    patientId={safeParseInt(patientId) ?? undefined}
                    isEditMode={true}
                    hideSectionHeader
                    hideChiefComplaint
                    caseRecordId={values.case_record ?? undefined}
                    onUploadingChange={setIsUploading}
                    setExternalExistingPreTreatmentFileIds={setUploadedFiles}
                    setExternalExistingScanFileIds={setUploadedScanFiles}
                    setExternalExistingXrayFileIds={setUploadedXrayFiles}
                  />
                )}

                <Footer
                  nextButtonText={getButtonText()}
                  disableNext={isUploading || isSaving}
                  loadingNext={isSaving}
                  onNext={() => {
                    saveCaseRecordAndContinue(values.case_record)
                  }}
                />
              </div>
            </>
          )}
        </Formik>
      </When>

      <When isTrue={caseRecordOptions.length === 0}>
        <div className='p-4 md:p-6'>
          <h2 className='text-2xl font-semibold mb-2'>Case Files</h2>
          <p className='mt-2 mb-4 text-gray-600 max-w-xl'>
            Select existing case files or upload all relevant files to maintain complete case
            documentation.
          </p>

          <CaseRecordsForm
            patientId={safeParseInt(patientId) ?? undefined}
            isEditMode={true}
            hideSectionHeader
            hideChiefComplaint
            onUploadingChange={setIsUploading}
            setExternalExistingPreTreatmentFileIds={setUploadedFiles}
            setExternalExistingScanFileIds={setUploadedScanFiles}
            setExternalExistingXrayFileIds={setUploadedXrayFiles}
          />

          <Footer
            nextButtonText={getButtonText()}
            disableNext={isUploading || isSaving}
            loadingNext={isSaving}
            onNext={() => {
              saveCaseRecordAndContinue(null)
            }}
          />
        </div>
      </When>
    </>
  )
}

export default CaseFilesSelector
