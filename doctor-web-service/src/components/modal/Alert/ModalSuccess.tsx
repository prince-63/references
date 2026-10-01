import {useEffect} from 'react'
import {IMAGE_DEFAULT_PATIENT, IMAGE_INVITE_PATIENT_SENT_SUCCESS} from '../../../utils/ImageConst'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_CROSS, SVG_LOCATION_PRIMARY, SVG_PHONE_PRIMARY} from '../../../utils/SvgConstants'

interface propsSuccessModel {
  setIsSuccessModelOpen: (isSuccessModelOpen: boolean) => void
  title: string
  showPatient?: boolean
  patient?: any
}

const ModalSuccess: React.FC<propsSuccessModel> = (props) => {
  const {setIsSuccessModelOpen, title, showPatient, patient} = props
  useEffect(() => {
    setTimeout(() => {
      setIsSuccessModelOpen(false)
    }, 2000)
  }, [])

  return (
    <div className='fixed left-0 top-0 z-[1057] h-full w-full flex justify-center items-center bg-black bg-opacity-40'>
      <div className='w-[528px] bg-white rounded-lg pb-10 shadow-lg'>
        <button
          onClick={() => setIsSuccessModelOpen(false)}
          className='w-full flex justify-end p-5'
        >
          <CommonSVG svg={SVG_CROSS} height='28' width='28' />
        </button>
        <div className='flex justify-center mt-3'>
          <img className='w-[293.556px] h-[212.229px]' src={IMAGE_INVITE_PATIENT_SENT_SUCCESS} />
        </div>
        <div className="text-center mt-7 text-black text-xl font-semibold font-['Figtree']">
          {title}
        </div>

        {showPatient && (
          <div className='px-10  mt-6'>
            <div className='w-full border border-lightGray rounded-md flex gap-2 p-5'>
              <div className=' w-20 object-contain rounded-lg'>
                <img
                  className='w-24 object-cover rounded-lg bg-primarySupport'
                  src={
                    patient.patient_profile == null
                      ? IMAGE_DEFAULT_PATIENT
                      : patient.patient_profile
                  }
                />
              </div>
              <div>
                <h3 className='text-xl font-semibold'>{patient.patient_name}</h3>
                <p className="text-textColor text-sm font-normal font-['Figtree']">
                  {patient.email_id}
                </p>
                <div className='flex gap-4 font-xs mt-2'>
                  <div className='w-fit h-5 px-2 py-1 bg-primarySupport rounded justify-start items-center gap-1 inline-flex'>
                    <CommonSVG svg={SVG_LOCATION_PRIMARY} width='12' height='12' />
                    <div className='text-primaryColor text-xs font-medium'>{patient.city}</div>
                  </div>
                  <div className='w-fit h-5 px-2 py-1 bg-primarySupport rounded justify-start items-center gap-1 inline-flex'>
                    <CommonSVG svg={SVG_PHONE_PRIMARY} width='12' height='12' />
                    <div className='text-primaryColor text-xs font-medium'>
                      +91 {patient.mobile_no}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalSuccess
