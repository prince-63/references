import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {Formik, FormikHelpers} from 'formik'
import * as Yup from 'yup'
import Page from 'components/page/Page'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import VSPFooter from './VSPFooter'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import {VspPrescriptionForm} from './VspPrescriptionForm'
import {AuthContext} from 'context/AuthContext'
import {useVspOrder} from '../hooks/useVspOrder'
import {getVspOrderById, updateVspOrder} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {
  createVspPrescription,
  getVspPrescriptionsByPatient,
  updateVspPrescription,
  VspPrescriptionResponse,
} from 'redux/Slices/AppSlice/VSP/prescriptions.slice'
import {usePatientsPrescriptions} from '../hooks/usePatientsPrescriptions'
import {useSearchParams} from 'react-router-dom'
import When from 'components/when/When'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import dayjs from 'dayjs'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface PrescriptionFormValues {
  surgery_type: string
  prescription_mode: string
  treatment_plan: string
  tentative_surgery_date: string
  earliest_treatment_plan_date: string
  others_description: string
  _prescription_selector: string | number | null
}

const validationSchema = Yup.object().shape({
  surgery_type: Yup.string().required('Surgery type is required'),
  prescription_mode: Yup.string().required('Prescription mode is required'),
  treatment_plan: Yup.string(),
  tentative_surgery_date: Yup.string().required('Tentative surgery date is required'),
  earliest_treatment_plan_date: Yup.string().required('Earliest treatment plan date is required'),
  others_description: Yup.string().when('surgery_type', {
    is: 'others',
    then: (schema) => schema.required('Please provide description'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const ADD_NEW_PRESCRIPTION_VALUE = '__ADD_NEW_PRESCRIPTION__'

const getSurgeryTypeLabel = (prescription: VspPrescriptionResponse): string => {
  if (prescription.is_single_jaw) return 'Single Jaw'
  if (prescription.is_bi_jaw) return 'Bi-Jaw'
  if (prescription.is_undecided) return 'Undecided'
  if (prescription.is_genioplasty) return 'Genioplasty'
  if (prescription.is_others) return 'Others'
  return '—'
}

const getSurgeryTypeValue = (prescription: VspPrescriptionResponse): string => {
  if (prescription.is_single_jaw) return 'single_jaw'
  if (prescription.is_bi_jaw) return 'bi_jaw'
  if (prescription.is_undecided) return 'undecided'
  if (prescription.is_genioplasty) return 'genioplasty'
  if (prescription.is_others) return 'others'
  return ''
}

const getLatestPrescription = (
  prescriptions: VspPrescriptionResponse[] | null | undefined
): VspPrescriptionResponse | null => {
  if (!prescriptions || prescriptions.length === 0) return null

  return [...prescriptions].sort((a, b) => {
    const dateA = a.created_at && dayjs(a.created_at).isValid() ? dayjs(a.created_at).valueOf() : 0
    const dateB = b.created_at && dayjs(b.created_at).isValid() ? dayjs(b.created_at).valueOf() : 0
    return dateB - dateA
  })[0]
}

export const VspPrescriptionSelector: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)
  const {vspOrderDetails} = useVspOrder()
  const {createVspPrescriptionLoading, updateVspPrescriptionLoading} = useSelector(
    (state: RootState) => state.vspPrescription
  )
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient_id')
  const {hasPrescriptions, patientsPrescriptions, loadingPrescriptions} = usePatientsPrescriptions(
    patientId!
  )
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {planningProductSelected} = useSelector((state: RootState) => state.productionSetup)
  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )
  const assignedPractice = patientDetailsResponse?.patient_details?.assigned_practice

  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null)

  useEffect(() => {
    if (loadingPrescriptions) return

    const count = patientsPrescriptions?.length ?? 0
    if (count === 0) {
      setSelectedPrescriptionId(null)
      return
    }

    if (count === 1) {
      setSelectedPrescriptionId(patientsPrescriptions?.[0]?.id ?? null)
      return
    }

    const latestPrescription = getLatestPrescription(patientsPrescriptions)
    setSelectedPrescriptionId(latestPrescription?.id ?? null)
  }, [loadingPrescriptions, patientsPrescriptions])

  const selectedPatientPrescription = useMemo(
    () => patientsPrescriptions?.find((rx) => rx.id === selectedPrescriptionId) ?? null,
    [patientsPrescriptions, selectedPrescriptionId]
  )
  const selectedOrderPrescription = useMemo(
    () =>
      vspOrderDetails?.prescriptions?.find(
        (prescription) => safeParseInt(prescription.id) === safeParseInt(selectedPrescriptionId)
      ) ?? null,
    [selectedPrescriptionId, vspOrderDetails?.prescriptions]
  )
  const selectedPrescription = selectedOrderPrescription ?? selectedPatientPrescription

  const isCreatingNew = selectedPrescriptionId === null || selectedPrescription === null

  const prescriptionOptions = useMemo(
    () => [
      {value: ADD_NEW_PRESCRIPTION_VALUE, label: '+ Create New Prescription'},
      ...(patientsPrescriptions ?? []).map((rx, index) => ({
        value: rx.id,
        label: `Prescription #${index + 1} — ${getSurgeryTypeLabel(rx)}${
          rx.created_at && dayjs(rx.created_at).isValid()
            ? ` (${dayjs(rx.created_at).format('DD-MMM-YYYY, hh:mm A')})`
            : ''
        }`,
      })),
    ],
    [patientsPrescriptions]
  )

  const selectedPrescriptionOption = useMemo(() => {
    if (selectedPrescriptionId === null) {
      return prescriptionOptions.find((item) => item.value === ADD_NEW_PRESCRIPTION_VALUE) || null
    }

    return (
      prescriptionOptions.find(
        (item) => safeParseInt(item.value) === safeParseInt(selectedPrescriptionId)
      ) || null
    )
  }, [prescriptionOptions, selectedPrescriptionId])

  const getInitialValues = (): PrescriptionFormValues => {
    if (selectedPrescription) {
      return {
        surgery_type: getSurgeryTypeValue(selectedPrescription),
        prescription_mode: selectedPrescription.prescription_mode || 'CREATE_NEW',
        treatment_plan: selectedPrescription.treatment_plan || '',
        tentative_surgery_date: selectedPrescription.tentative_surgery_date || '',
        earliest_treatment_plan_date: selectedPrescription.earliest_treatment_plan_by_date || '',
        others_description: selectedPrescription.others_description ?? '',
        _prescription_selector: selectedPrescription.id,
      }
    }
    return {
      surgery_type: 'single_jaw',
      prescription_mode: 'CREATE_NEW',
      treatment_plan: '',
      tentative_surgery_date: '',
      earliest_treatment_plan_date: '',
      others_description: '',
      _prescription_selector: ADD_NEW_PRESCRIPTION_VALUE,
    }
  }

  const handleSubmit = async (
    values: PrescriptionFormValues,
    {setSubmitting}: FormikHelpers<PrescriptionFormValues>
  ) => {
    try {
      if (!patientId || !userId || !profileId) {
        console.error('Missing required user/patient information')
        setSubmitting(false)
        return
      }

      const prescriptionRequest = {
        prescription_mode: values.prescription_mode,
        is_single_jaw: values.surgery_type === 'single_jaw',
        is_bi_jaw: values.surgery_type === 'bi_jaw',
        is_undecided: values.surgery_type === 'undecided',
        is_genioplasty: values.surgery_type === 'genioplasty',
        is_others: values.surgery_type === 'others',
        treatment_plan: values.treatment_plan,
        tentative_surgery_date: values.tentative_surgery_date,
        earliest_treatment_plan_by_date: values.earliest_treatment_plan_date,
        others_description: values.others_description,
        order_id: vspOrderDetails?.order_id,
        patient_id: safeParseInt(patientId),
        ...(selectedPrescription ? {prescription_id: selectedPrescription.id} : {}),
      }

      const prescriptionResult = await dispatchAction(
        selectedPrescription
          ? updateVspPrescription(prescriptionRequest)
          : createVspPrescription(prescriptionRequest)
      ).unwrap()

      const prescriptionId = safeParseInt((prescriptionResult as any)?.id)
      if (vspOrderDetails?.order_id) {
        const receiverProfileId = isEnterprisePlanUser
          ? safeParseInt(planningProductSelected?.profile_id) || safeParseInt(profileId)
          : safeParseInt(planningProductSelected?.profile_id)

        const senderProfileId = isEnterprisePlanUser
          ? safeParseInt(assignedPractice?.practice_profile_id) || safeParseInt(profileId)
          : safeParseInt(profileId)

        await dispatchAction(
          updateVspOrder({
            order_id: vspOrderDetails.order_id,
            prescription_id: prescriptionId,
            patient_id: safeParseInt(patientId),
            receiver_profile_id: receiverProfileId > 0 ? receiverProfileId : undefined,
            sender_profile_id: senderProfileId > 0 ? senderProfileId : undefined,
          })
        ).unwrap()
        await dispatchAction(
          getVspOrderById({
            order_id: vspOrderDetails.order_id,
          })
        ).unwrap()
      }

      await dispatchAction(
        getVspPrescriptionsByPatient({
          patient_id: safeParseInt(patientId),
        })
      ).unwrap()
      await dispatchAction(nextStep())
      setSubmitting(false)
    } catch (error) {
      console.error('Error saving prescription:', error)
      setSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col w-full'>
      <Formik<PrescriptionFormValues>
        key={selectedPrescriptionId ?? 'new'}
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({submitForm, isSubmitting}) => (
          <Page
            loading={loadingPrescriptions}
            title={<p className='text-2xl font-bold text-gray-900 py-2'>Surgical Prescription</p>}
            headerClassName='flex md:flex-row items-center'
            exitConfirmPredicate={false}
            containerClassName='w-full'
          >
            <When isTrue={hasPrescriptions}>
              <div className='mb-6'>
                <FormikSelectList
                  name='_prescription_selector'
                  items={prescriptionOptions}
                  label='Select Prescription'
                  placeholder={loadingPrescriptions ? 'Loading...' : 'Select a prescription'}
                  disabled={loadingPrescriptions}
                  allowClear
                  value={selectedPrescriptionOption?.value ?? undefined}
                  onChangeMapperFunc={(value) => value}
                  onChangeSuccess={(selected) => {
                    if (!selected || selected.value === ADD_NEW_PRESCRIPTION_VALUE) {
                      setSelectedPrescriptionId(null)
                    } else {
                      setSelectedPrescriptionId(safeParseInt(selected.value) || null)
                    }
                  }}
                />
              </div>
            </When>

            <p className='text-sm text-gray-500 -mt-2 mb-4'>
              {isCreatingNew
                ? 'Detail the clinical parameters for the 3D surgical plan.'
                : 'Edit the selected prescription details below.'}
            </p>

            <VspPrescriptionForm />

            <VSPFooter
              onNext={() => submitForm()}
              nextButtonText='Save & Continue'
              loadingNext={
                isSubmitting || createVspPrescriptionLoading || updateVspPrescriptionLoading
              }
            />
          </Page>
        )}
      </Formik>
    </div>
  )
}
