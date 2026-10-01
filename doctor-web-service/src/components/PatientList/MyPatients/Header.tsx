import React, {useContext} from 'react'
import {AuthContext} from '../../../context/AuthContext'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_PLUS_WHITE} from '../../../utils/SvgConstants'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'
import leftArrow from '../../../assets/icons/iconArrowLeft.svg'
import {identifyUser} from 'utils/ConstFunctions'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

interface props {
  title: string
  subTitle: string
  showBackButton: boolean
  showButton: boolean
}
export const Header = (props: props) => {
  const {title, subTitle, showBackButton} = props
  const {demoModeStatus}: any = useContext(AuthContext)
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isAddable
  const callInvitePatientModal = () => {
    navigate('/add-patient')
    identifyUser()
  }

  return (
    <>
      <div className='w-full flex flex-wrap gap-4 justify-between items-center'>
        <div className=' flex md:gap-5 gap-3 md:items-center items-start'>
          <When isTrue={showBackButton}>
            <button
              type='button'
              onClick={() => {
                navigate(-1)
              }}
              className='relative rounded-full bg-lightGray flex items-center justify-center md:w-[47px] md:h-[47px] w-6 h-6'
            >
              <img src={leftArrow} alt='' className=' md:w-6 md:h-6 w-3 h-3' />
            </button>
          </When>
          <div>
            <div className='w-96 text-black text-xl font-semibold'>{title}</div>
            <div className='w-fit text-textColor text-base font-normal'>{subTitle}</div>
          </div>
        </div>

        <div className='md:w-fit w-full flex gap-2'>
          {/* <When isTrue={showButton}>
            <button
              className='md:w-fit w-full min-w-[223px] px-3.5 py-2.5 text-primaryColor text-sm font-semibold bg-primarySupport md:bg-white border md:border-primaryColor border-white  rounded-lg justify-center items-center gap-2 inline-flex'
              onClick={callAllPatients}
            >
              View completed treatments
            </button>
          </When> */}

          {patientManagementAccess && (
            <button
              className='md:w-fit w-full  min-w-[150px] px-3.5 py-2.5 bg-primaryColor rounded-lg justify-center items-center gap-2 inline-flex'
              disabled={demoModeStatus ? true : false}
              onClick={() => callInvitePatientModal()}
            >
              <CommonSVG svg={SVG_PLUS_WHITE} width='16' height='16' />
              <div className='text-white text-sm font-semibold'>Add a patient</div>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
