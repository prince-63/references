import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {SVG_PLUS_PRIMARY} from 'utils/SvgConstants'
import When from 'components/when/When'
import actionList from '@staticData/actionList'
import useFilter from '@hooks/useFilter'
import {ActionItem} from '../../leadsProfile.types'
import {useNavigate, useParams} from 'react-router-dom'
import AlignerTrackingTable from 'screens/Patients/PatientProfile/Tabs/AlignerTrackingTable'
import {getAlignerUpdates} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import ModelUpdateStartDate from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModelUpdateStartDate'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
import ModalForceAlignerWarning from './actionModals/components/ModalForceAlignerWarning'
import hasValue from 'utils/hasValue'
import ModalSuccess from 'components/modal/Alert/ModalSuccess'

const AlignersTracking = () => {
  const {dispatchAction} = useDispatchAction()
  const {loading: loadingTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
  )
  const {userId} = useContext(AuthContext)
  const [success, setSuccess] = useState<boolean>(false)
  const [successTitle, setSuccessTitle] = useState<string>(
    'Aligner details have been successfully updated!'
  )
  const {patientId, alignerJourneyId} = useParams()
  const {dataLeadsOverview, loadingLeadsOverview} = useSelector(
    (state: RootState) => state.leadsProfile
  )

  const {filter: activeAction, handleFilterChange} = useFilter(actionList, false)
  useEffect(() => {
    if (!patientId || !alignerJourneyId) return

    const fetchData = async () => {
      try {
        const payload = {
          doctorId: safeParseInt(userId),
        }
        await Promise.all([
          dispatchAction(
            postApiDataTreatmentPlan({
              data: {
                patient_id: patientId,
                alignerJourneyId: alignerJourneyId,
              },
            })
          ),
          dispatchAction(getApiDataProductionList({payload})),
          dispatchAction(
            getAlignerUpdates({
              aligner_journey_id: parseInt(alignerJourneyId as string),
            })
          ),
        ])
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  const navigate = useNavigate()

  const handleActionOnClick = (option: ActionItem) => {
    handleFilterChange(option, true)
  }

  const handleOnClose = (option: ActionItem) => {
    handleFilterChange(option, true)
  }

  return (
    <Page
      title='Aligner movement table'
      showBorder
      showBackButton={false}
      loading={loadingLeadsOverview || loadingTreatmentPlan}
      headerClassName='flex-row'
    >
      <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_WARNING_MODAL}>
        <ModalForceAlignerWarning
          {...{
            handleOnClose,
            handleActionOnClick,
          }}
        />
      </When>

      <When isTrue={activeAction.UPDATE_START_DATE}>
        <ModelUpdateStartDate
          {...{
            handleOnClose,
            setSuccess,
            setSuccessTitle,
          }}
        />
      </When>

      {!loadingLeadsOverview && !loadingTreatmentPlan && hasValue(dataLeadsOverview) && (
        <When isTrue={dataLeadsOverview.treatment_plan?.aligner_treatment_status !== 'DEACTIVATED'}>
          <AlignerTrackingTable
            {...{
              isManualTracking: dataLeadsOverview?.tracking?.type === 'MANUAL',
              handleActionOnClick,
              setSuccess,
            }}
          />
        </When>
      )}
      {success && <ModalSuccess setIsSuccessModelOpen={setSuccess} title={successTitle} />}
      {!loadingLeadsOverview && hasValue(dataLeadsOverview) && (
        <When isTrue={dataLeadsOverview.treatment_plan?.aligner_treatment_status === 'DEACTIVATED'}>
          <CommonEmptyState
            image={IMAGE_EMPTY_STATE}
            imageStyle='mt-[60px]'
            title='No active treatment plan'
            titleStyle='text-[20px] font-bold mt-4'
            subTitle='To view your aligner tracking table, you need to have one active treatment plan. You can add new treatment plan if you wish to'
            subTitleStyle='w-[363px] text-[16px] text-textColor mt-2 text-center'
            buttonIcon={SVG_PLUS_PRIMARY}
            buttonText='Add a treatment'
            buttonStyle='w-[248px] h-[46px] border border-primaryColor bg-primarySupport text-primaryColor rounded-[8px] mt-6  font-semibold'
            onClick={() => {
              navigate(`/profile/${patientId}/Plans-list`)
            }}
            buttonIconWidth='15'
            buttonIconHeight='15'
          />
        </When>
      )}
    </Page>
  )
}

export default AlignersTracking
