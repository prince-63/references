import {useContext, useEffect, useState} from 'react'
import Overview from './Overview'
import PatientProfileOverview from 'screens/Patients/NewPatientProfile/PatientProfileOverview'
import {useNavigate, useParams} from 'react-router-dom'
import When from 'components/when/When'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {
  getApiLeadsOverview,
  setSelectedTabMenu,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import OverviewBraces from './OverviewBraces'
import RadioGroupHeaderMenu from 'components/RadioGroup/RadioGroupHeaderMenu'
import productTypes from '@constants/productTypes'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {getOverviewDataType} from '../../leadsProfile.types'
import Page from 'components/page/Page'
import useAllUserPlan from '@hooks/useAllUserPlan'

const LeadsOrPatientOverview = () => {
  const {userId, profileId} = useContext(AuthContext)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {
    dataLeadsOverview: dataLeadsData,
    loadingLeadsOverview,
    selectedTabMenu,
  } = useSelector((state: RootState) => state.leadsProfile)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {isDesignLabUser, isCustomer, isVendor, isEnterprisePlanUser} = useAllUserPlan()
  const isThirdParty =
    isCustomer ||
    (!isEnterprisePlanUser && isDesignLabUser) ||
    isVendor ||
    (isEnterprisePlanUser &&
      patientAssignedTo !== 'UNASSIGNED' &&
      data?.patient_details?.assigned_practice?.is_customer_patient)

  const [isBothTreatmentAvailable, setIsBothTreatmentAvailable] = useState(false)
  const TabMenuList = [
    {
      label: 'Aligners',
      value: productTypes.ALIGNERS,
    },
    {
      label: 'Braces',
      value: productTypes.BRACES,
    },
  ]

  const getOverviewState = () => {
    const postData: ApiGetData = {
      data: {
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      },
    }
    dispatchAction(getApiLeadsOverview(postData))
      .unwrap()
      .then((res: getOverviewDataType) => {
        if (
          res?.treatment_plan?.journey_id != null &&
          res?.braces_journey_tracking_response?.is_treatment_started
        ) {
          setIsBothTreatmentAvailable(true)
          dispatchAction(setSelectedTabMenu(productTypes.ALIGNERS))
          return
        } else {
          if (res?.braces_journey_tracking_response?.is_treatment_started) {
            dispatchAction(setSelectedTabMenu(productTypes.BRACES))
            return
          } else {
            setIsBothTreatmentAvailable(false)
            dispatchAction(setSelectedTabMenu(productTypes.ALIGNERS))
            return
          }
        }
      })
  }

  const tracking_enabled = dataLeadsData?.tracking?.enabled
  const alignerJourneyId = dataLeadsData?.treatment_plan?.journey_id

  useEffect(() => {
    getOverviewState()
  }, [])

  const navigate = useNavigate()
  useEffect(() => {
    if (isThirdParty) {
      navigate(`/profile/${patientId}/orders`)
    }
  }, [])

  const onHandleChangeTabMenu = (option: any) => {
    dispatchAction(setSelectedTabMenu(option))
  }

  return (
    <>
      <Page loading={loadingLeadsOverview}>
        <When isTrue={isBothTreatmentAvailable}>
          <div className='my-3'>
            <RadioGroupHeaderMenu
              options={TabMenuList}
              onOptionChange={(option) => onHandleChangeTabMenu(option)}
              selectedOption={selectedTabMenu}
              label=''
            />
          </div>
        </When>

        <When isTrue={selectedTabMenu === productTypes.ALIGNERS}>
          {!tracking_enabled ? (
            <Overview />
          ) : (
            <PatientProfileOverview
              loading={loadingLeadsOverview}
              alignerJourneyId={alignerJourneyId || null}
              patientId={safeParseInt(patientId)}
              treatmentStatus={dataLeadsData?.treatment_plan?.aligner_treatment_status}
            />
          )}
        </When>

        <When isTrue={selectedTabMenu === productTypes.BRACES}>
          <OverviewBraces />
        </When>
      </Page>
    </>
  )
}

export default LeadsOrPatientOverview
