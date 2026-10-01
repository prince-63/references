import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import When from 'components/when/When'
import {useNavigate, useParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {IMAGE_FOLDER} from 'utils/ImageConst'
import dayjs from 'dayjs'
import {ITreatmentPlan} from '../types/treatmentPlan.types'
import useAllUserPlan from '@hooks/useAllUserPlan'

const UploadedFilesOrLinksSection = ({treatmentPlan}: {treatmentPlan: ITreatmentPlan}) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {isDesignLabUser, isVendor, isCustomer} = useAllUserPlan()
  const stlFileMetaData = treatmentPlan?.stl_file_metadata

  return (
    <div className='flex flex-col gap-3 text-textColor font-medium'>
      <p>Files</p>
      <When isTrue={hasValue(stlFileMetaData?.file_id)}>
        <div className='flex items-center gap-3 justify-between'>
          <div
            className='flex items-center gap-3 cursor-pointer'
            onClick={(e) => {
              if (!treatmentPlan?.order_id) return
              e.stopPropagation()
              const queryParams = new URLSearchParams({
                isStlFileView: 'true',
              }).toString()
              if (isVendor || isDesignLabUser || isCustomer) {
                navigate(
                  `/leads-profile/${patientId}/files/Orders/Order ${treatmentPlan?.order_id}/${treatmentPlan?.treatment_plan_name}?${queryParams}`
                )
              } else {
                navigate(
                  `/leads-profile/${patientId}/files/Orders/Order ${treatmentPlan?.order_id}/${treatmentPlan?.treatment_plan_name}`
                )
              }
            }}
          >
            <img className='w-12 h-12 relative' src={IMAGE_FOLDER} alt='' />
            <div className='flex flex-col'>
              <p className='text-base text-black '>STL files</p>
              <p className='text-sm font-normal'>
                Patient Files/Order {treatmentPlan?.order_id}/{treatmentPlan?.treatment_plan_name}
              </p>
            </div>
          </div>
          <p className='text-sm font-normal'>
            {dayjs(treatmentPlan.updated_at).format('DD-MMM-YYYY, h:mm A')}
          </p>
        </div>
      </When>
      <When isTrue={hasValue(stlFileMetaData?.link)}>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 bg-primarySupport rounded-lg'>
            <LinkSimpleIcon />
          </div>
          <div className='flex flex-col'>
            <p className='text-base text-black '>Link</p>
            {stlFileMetaData?.link?.map((link, index) => (
              <a
                key={index}
                href={link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-normal text-primaryColor underline mb-0.5'
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </When>
    </div>
  )
}

export default UploadedFilesOrLinksSection
