import React, {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import PatientCard from './components/PatientCard'
import OrderDetailsCard from './components/OrderDetailsCard'
import ProductionDetailsTable from './components/ProductionDetailsTable'
import FooterDetails from './components/FooterDetails'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import clsx from 'clsx'
import moment from 'moment'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {getMyTaskList} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import STLFilesView from '../ProductionSetup/components/STLFilesView'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import useAllUserPlan from '@hooks/useAllUserPlan'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    className={['bg-white rounded-2xl shadow-sm ring-1 ring-black/5', 'p-5 md:p-6', className].join(
      ' '
    )}
    {...rest}
  >
    {children}
  </div>
)

export const SectionTitle: React.FC<{title: string; className?: string}> = ({
  title,
  className = '',
}) => (
  <h3 className={['text-base font-semibold tracking-wide mb-3', className].join(' ')}>{title}</h3>
)

const ProductionSetupReview: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {isPractice} = useAllUserPlan()
  const {treatmentPlan, getTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {cardDetails, plansList} = useSelector((state: RootState) => state.kanban)
  const {loadingOrder} = useSelector((state: RootState) => state.orders)
  const {treatmentId} = useParams()
  const allFiles = useSelector((state: RootState) => state.leadFiles)
  const selectedPlan = useMemo(() => {
    const list = (plansList as any)?.plans_list ?? []
    return list.find((p: any) => String(p.plan_id ?? p.id) === String(treatmentId))
  }, [plansList, treatmentId])

  useEffect(() => {
    if (patientId != null) {
      getLeadsDetails()
    }
  }, [patientId])

  useEffect(() => {
    if (userId != null) {
      dispatchAction(
        getOrderDetails({
          order_id: String(treatmentPlan?.order_id),
          doctor_id: safeParseInt(userId),
        })
      )
    }
  }, [userId])

  useEffect(() => {
    if (treatmentId != null) {
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(treatmentId),
        })
      )
    }
  }, [treatmentId])

  useEffect(() => {
    if (treatmentId != null) {
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(treatmentId),
        })
      )
        .unwrap()
        .then((res: ITreatmentPlan) => {
          dispatchAction(
            allFile({
              doctor_id: String(userId),
              patient_id: String(patientId),
              path: `/Orders/STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
            })
          )
        })
    }

    dispatchAction(
      getMyTaskList({
        doctor_id: Number(userId),
        patient_id: Number(patientId),
        filter: null,
        order: 'ASC',
        my_task_type: 'PRODUCTION_CHECK_LIST',
      })
    )
  }, [treatmentId])

  const getLeadsDetails = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatchAction(getLeadsProfileDetails(postData) as any)
  }

  return (
    <Spin indicator={<Spinner loading />} spinning={getTreatmentPlanLoading || loadingOrder}>
      <div className='min-h-screen  pb-[70px] md:pb-0'>
        <div className='mx-auto'>
          <p className='text-textColor mb-4 md:mb-6'>
            Verify all details from previous steps before submission.
          </p>

          <div className='grid grid-cols-1 gap-5'>
            <div
              className={clsx(
                'grid grid-cols-1 gap-5',
                cardDetails?.order_id != null ? 'md:grid-cols-2' : 'md:grid-cols-1'
              )}
            >
              <PatientCard />
              {cardDetails?.order_id != null && <OrderDetailsCard />}
            </div>

            <Card>
              <SectionTitle title='Finalized Plan Details' />
              <div className='text-sm text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <div className='text-slate-500'>Plan</div>
                  <div className='font-medium'>
                    {selectedPlan?.treatment_plan_tag_name ||
                      selectedPlan?.title ||
                      'Treatment Plan'}{' '}
                    {selectedPlan?.version ? ` ${selectedPlan.version}` : ''}
                  </div>
                </div>
                <div>
                  <div className='text-slate-500'>Created On</div>
                  <div className='font-medium'>
                    {selectedPlan?.created_date || selectedPlan?.created || selectedPlan?.created_at
                      ? moment(
                          selectedPlan?.created_date ||
                            selectedPlan?.created ||
                            selectedPlan?.created_at
                        ).format('DD-MMM-YYYY')
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-slate-500'>Total Aligners</div>
                  <div className='font-medium'>{selectedPlan?.total_stages ?? '-'}</div>
                </div>
                <When isTrue={selectedPlan?.upper_aligner_series != '0-0'}>
                  <div>
                    <div className='text-slate-500'>Upper Aligner Series</div>
                    <div className='font-medium'>{selectedPlan?.upper_aligner_series ?? '-'}</div>
                  </div>
                </When>
                <When isTrue={selectedPlan?.lower_aligner_series != '0-0'}>
                  <div>
                    <div className='text-slate-500'>Lower Aligner Series</div>
                    <div className='font-medium'>{selectedPlan?.lower_aligner_series ?? '-'}</div>
                  </div>
                </When>
              </div>
            </Card>

            <ProductionDetailsTable />
            {(hasValue(allFiles?.Files) || hasValue(treatmentPlan?.stl_file_metadata?.link)) &&
              !isPractice && (
                <Card>
                  <SectionTitle title='Files' />
                  <STLFilesView
                    {...{
                      treatmentPlan: treatmentPlan,
                      stlFileMetaData: allFiles?.Files,
                    }}
                  />
                </Card>
              )}

            <FooterDetails />
          </div>
        </div>
      </div>
    </Spin>
  )
}

export default ProductionSetupReview
