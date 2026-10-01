import React, {useContext, useEffect, useState} from 'react'
import {Formik} from 'formik'
import {UploadFile, message} from 'antd'
import {useSelector} from 'react-redux'

import {CaseRecordsForm} from 'screens/CaseRecords/components'
import Button from 'components/atom/Buttons/Button'
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

interface CaseFilesStepProps {
  onNext: () => void
  patientIdProp?: number
}

const CaseFilesStep: React.FC<CaseFilesStepProps> = ({onNext, patientIdProp}) => {
  const {createNewCaseRecord} = useCreateCaseRecordAction()
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  // 🔹 Read patient_id from URL (if any)
  let patientIdFromUrl: number | undefined
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search)
    const raw = searchParams.get('patient_id')
    patientIdFromUrl = raw ? safeParseInt(raw) : undefined
  }

  // 🔹 Final patientId priority: prop → url
  const patientId: number | undefined = patientIdProp ?? patientIdFromUrl

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>([])
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {allCaseRecords, loadingGetAll} = useSelector((state: RootState) => state.caseRecord)

  // 🔹 Fetch all case records for this patient on mount
  useEffect(() => {
    // reset any stale case record state when patient changes
    dispatchAction(resetCaseRecordState())
    setUploadedFiles([])
    setUploadedScanFiles([])
    setUploadedXrayFiles([])

    if (patientId) {
      dispatchAction(getAllCaseRecord({patient_id: patientId}))
    }
    return () => {
      dispatchAction(resetCaseRecordState())
    }
  }, [dispatchAction, patientId])

  // 🔹 Dropdown options
  const caseRecordOptions =
    allCaseRecords?.map((record) => ({
      value: record.case_record_id,
      label: `Case Record #${record.case_record_id}`,
    })) || []

  const hasExistingCaseRecords = caseRecordOptions.length > 0

  const extractNewFileIds = (files: UploadFile[]) =>
    files
      // existing files usually have string uid; new uploads are number-like
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
    if (isUploading || isSaving) return

    if (!patientId) {
      message.error('Missing patient information. Please reload and try again.')
      return
    }

    const hasAnyFile =
      uploadedFiles.length > 0 || uploadedScanFiles.length > 0 || uploadedXrayFiles.length > 0

    // If no files and no selected case record, just go ahead
    if (!hasAnyFile && !caseRecordId) {
      dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
        .unwrap()
        .then((res: any) => {
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
              customer_mapped_id: res.customer_mapped_id.trim(),
              age: res.age,
              gender: res.gender,
              practice_location_id: null,
              country: res.country,
              state: res.state,
              city: res.city,
              practice_profile_id: profileId,
              practice_invite_code: null,
              current_step: 4,
              patient_id: patientIdProp,
            },
          }
          dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
            .unwrap()
            .then(() => {
              onNext()
            })
        })

      return
    }

    setIsSaving(true)
    try {
      const requestBody: APIPostData = {
        chief_complaint: '',
        pre_treatment_file_ids: extractNewFileIds(uploadedFiles),
        scan_file_ids: extractNewFileIds(uploadedScanFiles),
        xray_file_ids: extractNewFileIds(uploadedXrayFiles),
        patient_id: patientId,
        profile_id: safeParseInt(profileId),
        doctor_id: safeParseInt(userId),
        case_record_id: caseRecordId ?? null,
      }

      await createNewCaseRecord(requestBody)
      dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
        .unwrap()
        .then((res: any) => {
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
              customer_mapped_id: res.customer_mapped_id.trim(),
              age: res.age,
              gender: res.gender,
              practice_location_id: null,
              country: res.country,
              state: res.state,
              city: res.city,
              practice_profile_id: profileId,
              practice_invite_code: null,
              current_step: 4,
              patient_id: patientIdProp,
            },
          }
          dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
            .unwrap()
            .then(() => {
              onNext()
            })
        })
    } catch (error) {
      console.error('Failed to create/update case record', error)
      message.error('Failed to save case files. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='p-4 md:p-6'>
      <h2 className='text-2xl font-semibold mb-2'>Case Files</h2>
      <p className='mt-2 mb-4 text-gray-600 max-w-xl'>
        Select existing case files or upload all relevant files to maintain complete case
        documentation.
      </p>

      <Formik
        initialValues={{case_record: null as number | null}}
        onSubmit={() => {
          // We trigger saveCaseRecordAndContinue manually from the button
        }}
      >
        {({values, setFieldValue}) => (
          <>
            {/* 🔹 Dropdown ALWAYS visible (disabled when no records yet) */}
            <div className='max-w-md mb-6'>
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
            </div>

            {/* 🔹 Case record form (auto-populates when a record is selected) */}
            <CaseRecordsForm
              patientId={patientId ?? undefined}
              isEditMode={true}
              hideSectionHeader
              hideChiefComplaint
              caseRecordId={hasValue(values.case_record) ? values.case_record : undefined}
              onUploadingChange={setIsUploading}
              setExternalExistingPreTreatmentFileIds={setUploadedFiles}
              setExternalExistingScanFileIds={setUploadedScanFiles}
              setExternalExistingXrayFileIds={setUploadedXrayFiles}
            />

            <div className='flex justify-end mt-8 pt-4 border-t border-gray-200'>
              <Button
                text={getButtonText()}
                onClick={() => saveCaseRecordAndContinue(values.case_record)}
                isDisabled={isUploading || isSaving}
                className='!w-auto px-8 !bg-primaryColor !text-white'
              />
            </div>
          </>
        )}
      </Formik>
    </div>
  )
}

export default CaseFilesStep
