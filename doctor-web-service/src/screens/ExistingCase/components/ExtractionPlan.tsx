import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import {Formik} from 'formik'
import React from 'react'
import InPlanningTreatmentView from 'screens/Patients/LeadsProfile/main/overview/components/InPlanningTreatmentView'
import {dailyWearHoursList, wearDaysList} from 'utils/Constant'
import Footer from './Footer'
import {useDispatch, useSelector} from 'react-redux'
import {nextStep} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {ACTION_STATUS} from '@constants/alignerActions.constants'
import {useParams} from 'react-router-dom'

const ExtractionPlan = () => {
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {treatmentId} = useParams()

  return (
    <Page
      title='Treatment plan'
      exitConfirmPredicate={false}
      containerClassName='max-h-[62vh] overflow-y-auto'
    >
      <div className='flex flex-col gap-3 md:w-4/5 pb-28 sm:pb-28 md:pb-12 overflow-scroll'>
        <Formik
          initialValues={{
            days_to_wear_each_aligner: null,
            recommended_daily_wear_hours: null,
          }}
          onSubmit={async (values) => {
            const days_to_wear_each_aligner = values.days_to_wear_each_aligner
            const wear_hours = values.recommended_daily_wear_hours
            const payload = {
              details: {
                aligner_treatment_details: treatmentPlan?.aligner_details_meta_data,
                treatment_plan_id: treatmentPlan?.treatment_plan_id,
                treatment_sub_type: treatmentTypeMain.ALIGNERS,
                production_lab_details: treatmentPlan.production_lab_details,
                days_to_wear_each_aligner: days_to_wear_each_aligner!,
                recommended_hours_to_wear_aligners: wear_hours!,
                treatment_planning_software: treatmentPlan.treatment_planning_software,
                treatment_planning_link: treatmentPlan.treatment_planning_link,
                remarks: treatmentPlan.remarks,
                doctor_id: treatmentPlan.doctor_id,
                patient_id: treatmentPlan.patient_id,
                status: 'DRAFT' as const,
                video_display_to_patient: treatmentPlan.is_video_display_patient,
                link_display_patient: treatmentPlan.is_link_display_patient,
                approved_by_patient_at: null,
                treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
                approver_status: ACTION_STATUS.APPROVED,
                initiator_status: ACTION_STATUS.APPROVED,
                file_ids_to_clone: treatmentPlan.file_ids_to_clone,
                treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
              },
            }
            dispatchAction(createTreatmentPlan(payload))
              .unwrap()
              .then(() => {})
              .catch(() => {})
          }}
        >
          {(formik) => {
            return (
              <>
                <div className='flex flex-col md:flex-row  gap-3'>
                  <FormikSelectList
                    name='days_to_wear_each_aligner'
                    label='Days to wear each aligner'
                    items={wearDaysList}
                    defaultValue={treatmentPlan?.days_to_wear_each_aligner}
                    required
                  />

                  <FormikSelectList
                    name='recommended_daily_wear_hours'
                    label='Recommended daily wear hours'
                    required
                    defaultValue={treatmentPlan?.recommended_hours_to_wear_aligners}
                    items={dailyWearHoursList}
                  />
                </div>

                <InPlanningTreatmentView />

                <Footer
                  {...{
                    onNext: () => {
                      if (treatmentId) {
                        dispatch(nextStep())
                        return
                      }
                      formik.handleSubmit()
                      dispatch(nextStep())
                    },
                  }}
                />
              </>
            )
          }}
        </Formik>
      </div>
    </Page>
  )
}

export default ExtractionPlan
