import useDispatchAction from '@hooks/useDispatchAction'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import AntdButton from 'components/atom/Buttons/AntdButton'
import Page from 'components/page/Page'
import ViewInformationSection from 'components/section/ViewInformationSection'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {
  postCreateTreatmentPlanBraces,
  postUpdateTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {
  formatPluralizedString,
  getFirstLetterCapitalOfWord,
  identifyUser,
  safeParseInt,
} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import JustifiedBetweenDetails from '../viewTreatmentPlan/components/JustifiedBetweenDetails'
import Tag from 'components/tags/Tag'
import bracesTreatmentPlanStatusConstants from '@constants/bracesTreatmentPlanStatus.constants'
import InfoCard from '../../alignersTracking/components/InfoCard'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {ITreatmentPlanBracesUpdate} from '../types/treatmentPlan.types'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import moment from 'moment'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

const ViewTreatmentPlanBraces = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)

  const {treatmentPlanBraces, getTreatmentPlanBracesLoading, postCreateTreatmentPlanBracesLoading} =
    useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  const isUpdate = searchParams.get('isUpdate') === 'true'
  const bracesJourneyId = searchParams.get('bracesJourneyId')
  const bracesTreatmentStage = searchParams.get('bracesTreatmentStage')

  const handleOnClick = (treatmentPlanStatus: string, isUpdate?: boolean) => {
    const treatmentPlanBracesToSave = {
      doctor_id: treatmentPlanBraces.doctor_id,
      patient_id: treatmentPlanBraces.patient_id,
      product_type_name: treatmentPlanBraces.product_type_name,
      tentative_treatment_duration_in_months:
        treatmentPlanBraces.tentative_treatment_duration_in_months,
      bracket_type: treatmentPlanBraces.bracket_type,
      bracket_select_type: treatmentPlanBraces.bracket_select_type,
      bracket_select_sub_type: treatmentPlanBraces.bracket_sub_type,
      bracket_sub_type: treatmentPlanBraces.bracket_sub_type,
      bracket_brand: treatmentPlanBraces.bracket_brand,
      input_bracket_brand: '',
      teeth_extraction: treatmentPlanBraces.teeth_extraction,
      remarks: treatmentPlanBraces.remarks,
      treatment_stage: treatmentPlanBraces.treatment_stage,
      treatment_status: treatmentPlanBraces.treatment_stage,
      braces_treatment_stage: treatmentPlanStatus,
      treatment_name: treatmentPlanBraces.treatment_name,
      upper_jaw_anchor_type_value: treatmentPlanBraces.upper_jaw_anchor_type_value,
      lower_jaw_anchor_type_value: treatmentPlanBraces.lower_jaw_anchor_type_value,
      extraction_remarks: treatmentPlanBraces.extraction_remarks,
      treatment_start_date: treatmentPlanBraces.treatment_start_date,
    }

    const treatmentPlanBracesToUpdate: ITreatmentPlanBracesUpdate = {
      braces_journey_id: safeParseInt(bracesJourneyId),
      ...treatmentPlanBracesToSave,
    }

    dispatchAction(
      isUpdate
        ? postUpdateTreatmentPlanBraces(treatmentPlanBracesToUpdate)
        : postCreateTreatmentPlanBraces(treatmentPlanBracesToSave)
    )
      .unwrap()
      .then((res: any) => {
        if (res) {
          dispatchAction(
            getLeadsProfileDetails({
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            })
          )
          if (isUpdate) {
            SuccessToast('Braces treatment updated successfully')
            navigate(`/leads-profile/${patientId}/treatment`)
          } else {
            SuccessToast('Braces treatment created successfully')
            navigate(`/leads-profile/${patientId}`)
          }
        }
      })
  }

  return (
    <Page
      title={
        isNew || bracesTreatmentStage === bracesTreatmentPlanStatusConstants.DRAFT
          ? 'Review treatment plan details'
          : 'View treatment plan details'
      }
      showBorder={false}
      showBackButton
      loading={false}
      backNavigationRoute={
        bracesJourneyId === 'null'
          ? `/leads-profile/${patientId}/treatment/braces/new/setupTreatmentPlanBraces?new=true`
          : `/leads-profile/${patientId}/treatment`
      }
    >
      {!getTreatmentPlanBracesLoading && hasValue(treatmentPlanBraces) && (
        <div>
          <When
            isTrue={
              treatmentPlanBraces.braces_treatment_stage ===
              bracesTreatmentPlanStatusConstants.INACTIVE
            }
          >
            <div className='mb-3'>
              <InfoCard
                {...{
                  content: <p>This treatment was deactivated</p>,
                  title: 'Treatment deactivated!',
                  className: 'bg-redSupport',
                  titleClassName: 'text-red font-semibold',
                  showButton: false,
                  infoIconColor: '#F45045',
                }}
              />
            </div>
          </When>
          <BorderedCard>
            <div className='flex flex-col gap-5'>
              <ViewInformationSection title='Basic details'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Treatment type'
                      value={getFirstLetterCapitalOfWord(treatmentPlanBraces.treatment_stage)}
                    />
                    <JustifiedBetweenDetails
                      label='Treatment duration'
                      value={formatPluralizedString(
                        safeParseInt(treatmentPlanBraces.tentative_treatment_duration_in_months),
                        ' month'
                      )}
                    />
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Treatment start date'
                      value={
                        hasValue(treatmentPlanBraces.treatment_start_date)
                          ? moment(treatmentPlanBraces.treatment_start_date).format('DD MMM YYYY')
                          : '-'
                      }
                    />
                  </div>
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Tooth to be extracted'>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='flex gap-4 flex-wrap'>
                      <When isTrue={hasValue(treatmentPlanBraces.teeth_extraction)}>
                        {treatmentPlanBraces.teeth_extraction?.map((tooth: string) => (
                          <Tag
                            value={tooth}
                            key={tooth}
                            className='text-base bg-secondarySupport text-secondaryColor w-12'
                          />
                        ))}
                      </When>
                      <When isTrue={!hasValue(treatmentPlanBraces.teeth_extraction)}>--</When>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <div className='text-stone-500 text-base font-medium leading-normal'>
                      Remarks
                    </div>
                    <p
                      className={`${
                        hasValue(treatmentPlanBraces?.extraction_remarks)
                          ? 'text-black'
                          : 'text-textColor'
                      }  text-base break-all font-medium`}
                    >
                      {treatmentPlanBraces?.extraction_remarks
                        ? treatmentPlanBraces?.extraction_remarks
                            .split('\n')
                            .map((line: string, index: number) => (
                              <div key={index}>
                                {line}
                                <br />
                              </div>
                            ))
                        : 'No remarks added'}
                    </p>
                  </div>
                </div>
              </ViewInformationSection>

              <ViewInformationSection title='Bracket details'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Bracket type'
                      value={treatmentPlanBraces.bracket_type}
                    />
                    <JustifiedBetweenDetails
                      label='Sub-type'
                      value={treatmentPlanBraces.bracket_select_sub_type}
                    />
                  </div>
                  <div className='flex flex-col gap-2 w-full'>
                    <JustifiedBetweenDetails
                      label='Type'
                      value={treatmentPlanBraces.bracket_select_type}
                    />
                    <JustifiedBetweenDetails
                      label='Company name'
                      value={treatmentPlanBraces.bracket_brand}
                    />
                  </div>
                </div>
              </ViewInformationSection>
              <ViewInformationSection title='Anchorage type'>
                <div className='flex flex-col md:flex-row md:gap-10 gap-4'>
                  <JustifiedBetweenDetails
                    label='Upper'
                    value={treatmentPlanBraces.upper_jaw_anchor_type_value}
                  />
                  <JustifiedBetweenDetails
                    label='Lower'
                    value={treatmentPlanBraces.lower_jaw_anchor_type_value}
                  />
                </div>
              </ViewInformationSection>
              <ViewInformationSection title='Remarks'>
                <p
                  className={`${
                    hasValue(treatmentPlanBraces?.remarks) ? 'text-black' : 'text-textColor'
                  }  text-base break-all font-medium`}
                >
                  {treatmentPlanBraces?.remarks
                    ? treatmentPlanBraces?.remarks
                        .split('\n')
                        .map((line: string, index: number) => (
                          <div key={index}>
                            {line}
                            <br />
                          </div>
                        ))
                    : 'No remarks added'}
                </p>
              </ViewInformationSection>
            </div>
          </BorderedCard>

          <div className='font-semibold text-base flex flex-col-reverse md:flex-row gap-3 mt-3 justify-end'>
            <When isTrue={bracesJourneyId === 'null' && isNew}>
              <button
                className='text-grayDisabled'
                onClick={() => {
                  navigate(`/leads-profile/${patientId}/treatment`)
                }}
              >
                Cancel
              </button>
              <AntdButton
                onClick={() => {
                  identifyUser()
                  handleOnClick(treatmentPlanStatusConstants.DRAFT, false)
                }}
                className={`rounded-lg h-12 cursor-pointer bg-primarySupport border border-primaryColor text-primaryColor font-semibold`}
                text={'Save as draft'}
              />
              <AntdButton
                onClick={() => handleOnClick(treatmentPlanStatusConstants.ACTIVE, false)}
                className={`${'bg-primaryColor text-white'} h-12 font-semibold text-base`}
                isLoading={postCreateTreatmentPlanBracesLoading}
                text={`Finalize and create plan`}
              />
            </When>
            <When
              isTrue={
                bracesJourneyId != 'null' &&
                !isNew &&
                bracesTreatmentStage === bracesTreatmentPlanStatusConstants.DRAFT
              }
            >
              <AntdButton
                onClick={() => {
                  identifyUser()
                  handleOnClick(treatmentPlanStatusConstants.ACTIVE, true)
                }}
                className={`${'bg-primaryColor text-white'} h-12 font-semibold text-base`}
                isLoading={postCreateTreatmentPlanBracesLoading}
                text={`Update Plan`}
              />
            </When>
            <When
              isTrue={
                bracesJourneyId != 'null' &&
                !isNew &&
                isUpdate &&
                bracesTreatmentStage === bracesTreatmentPlanStatusConstants.ACTIVE
              }
            >
              <AntdButton
                onClick={() => {
                  identifyUser()
                  const queryParams = new URLSearchParams({
                    bracesJourneyId: String(bracesJourneyId),
                    new: 'false',
                  }).toString()
                  navigate(
                    `/leads-profile/${patientId}/treatment/braces/old/setupTreatmentPlanBraces?${queryParams}`
                  )
                }}
                className={`rounded-lg h-12 cursor-pointer bg-primaryColor border border-primaryColor text-white font-semibold`}
                text={'Edit treatment plan'}
              />
            </When>
          </div>
        </div>
      )}
    </Page>
  )
}

export default ViewTreatmentPlanBraces
