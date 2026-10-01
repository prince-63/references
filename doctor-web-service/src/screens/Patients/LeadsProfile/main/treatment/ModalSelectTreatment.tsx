import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {useContext, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import treatmentSelectionList, {ITreatement} from '@constants/treatmentSelectionList'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {
  getBracesTreatmentPlan,
  setTreatmentPlan,
  setTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import IconRadioGreenCheck from 'assets/icons/IconRadioGreenCheck'
import {AllTreatmentPlanListItem} from './types/treatmentPlan.types'
interface props {
  setIsModalSelectTreatmentOpen: (isModalSelectTreatmentOpen: boolean) => void
}
const ModalSelectTreatment = (props: props) => {
  const {setIsModalSelectTreatmentOpen} = props
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState<string>(treatmentTypeMain.ALIGNERS)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {allTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const [treatmentSelectionLists, setTreatmentSelectionLists] =
    useState<ITreatement[]>(treatmentSelectionList)

  const bracesTreatmentAdded =
    allTreatmentPlanList &&
    allTreatmentPlanList.some((item: AllTreatmentPlanListItem) => item.treatment_type === 'BRACES')

  const callAddTreatment = async () => {
    setIsModalSelectTreatmentOpen(false)
    if (selectedOption === treatmentTypeMain.ALIGNERS) {
      dispatchAction(setTreatmentPlan({}))
      navigate(`/leads-profile/${patientId}/treatment/new/setupTreatmentPlan`)
    } else {
      if (dataLeadsOverview.braces_journey_tracking_response.enabled) {
        dispatchAction(
          getBracesTreatmentPlan({
            doctorId: safeParseInt(userId),
            bracesJourneyId: dataLeadsOverview.braces_journey_tracking_response.braces_journey_id,
          })
        )
        navigate(
          `/leads-profile/${patientId}/treatment/braces/${dataLeadsOverview.braces_journey_tracking_response.braces_journey_id}/viewTreatmentPlanBraces?bracesJourneyId=${dataLeadsOverview.braces_journey_tracking_response.braces_journey_id}&new=false&isUpdate=true&bracesTreatmentStage=ACTIVE`
        )
      } else {
        const queryParams = new URLSearchParams({
          new: 'true',
        }).toString()

        dispatchAction(setTreatmentPlanBraces({}))
        navigate(
          `/leads-profile/${patientId}/treatment/braces/new/setupTreatmentPlanBraces?${queryParams}`
        )
      }
    }
  }

  const handleTreatement = (option: ITreatement) => {
    setSelectedOption(option.value)
  }

  useEffect(() => {
    if (bracesTreatmentAdded) {
      const updatedList = treatmentSelectionList.map((option) => {
        if (option.value === treatmentTypeMain.BRACES) {
          return {...option, disabled: true}
        } else {
          return {...option}
        }
      })
      setTreatmentSelectionLists(updatedList)
    }
  }, [bracesTreatmentAdded])

  return (
    <ModalLayout isResponsive={true} className='md:w-[628px] md:px-8 px-3 '>
      <div className='text-[24px] font-semibold mt-4'>Select the type of treatment plan</div>

      <div className='md:gap-4 gap-3 mt-4 flex flex-col '>
        {treatmentSelectionLists.map((option) => (
          <button
            key={option.value}
            type='button'
            className={clsx(
              'flex gap-2 items-center p-4 rounded-2xl font-medium text-xs cursor-pointer',
              selectedOption === option.value
                ? 'bg-primarySupport text-primaryColor border border-primaryColor'
                : 'bg-white text-textColor border border-mediumGray',
              option.disabled && 'opacity-50'
            )}
            onClick={() => {
              if (!option.disabled) {
                handleTreatement(option)
              }
            }}
          >
            <div className='w-full flex justify-between items-center '>
              <div className='flex gap-2 items-center '>
                <CommonSVG
                  width={option.iconWidth}
                  height={option.iconHeight}
                  color='transparent'
                  svg={selectedOption === option.value ? option.icon : option.iconDisabled}
                />
                <div className='mb-2'>
                  <div className='text-black text-[16px] font-semibold leading-none text-start'>
                    {option.title}
                  </div>

                  <div className=' text-textColor font-normal text-[14px] mt-2  leading-tight text-start'>
                    {option.subTitle}
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                {selectedOption === option.value ? (
                  <IconRadioGreenCheck />
                ) : (
                  <div className='w-6 h-6 rounded-full border border-mediumGray'></div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className='mt-7 flex flex-row md:gap-4 gap-2'>
        <AntdButton
          text={'Cancel'}
          className='h-12 !border-primaryColor w-full hover:!border-primaryColor text-primaryColor bg-primarySupport text-[16px]  font-semibold'
          onClick={() => setIsModalSelectTreatmentOpen(false)}
        />
        <AntdButton
          text={'Continue'}
          className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor  text-[16px]  font-semibold'
          onClick={() => callAddTreatment()}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalSelectTreatment
