import {IStlFileMetadata} from '../types/treatmentPlan.types'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import dayjs from 'dayjs'
import {useNavigate, useParams} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'

const Title = ({children}: {children: React.ReactNode}) => {
  return <p className='font-medium'>{children}</p>
}

export default ({
  stlFileMetaData,
  isCustomer,
  orderId,
  treatmentPlanName,
}: {
  stlFileMetaData?: IStlFileMetadata
  isCustomer: boolean
  orderId: string | null
  treatmentPlanName: string
}) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {isCustomer: customer, isDesignLabUser, isVendor, isEnterprisePlanUser} = useAllUserPlan()

  const getTitle = (index: number) => {
    switch (index) {
      case 0:
        if (isCustomer) {
          return 'Request STL files'
        }
        return 'STL files requested'
      case 1:
        if (isCustomer) {
          return 'STL files received'
        }
        return 'Upload STL files'
      case 2:
        if (isCustomer) {
          return 'Approve & close order'
        }
        return 'STL files approved'
      default:
        return ''
    }
  }

  const getContent = (index: number) => {
    switch (index) {
      case 0:
        if (isCustomer) {
          if (stlFileMetaData?.requested_at) {
            return (
              <span className='text-textColor'>
                {`Requested on ${dayjs(stlFileMetaData.requested_at).format('DD-MMM-YYYY')}`}
              </span>
            )
          }
          return 'Request STL files'
        }
        if (stlFileMetaData?.requested_at) {
          return (
            <span className='text-textColor'>
              {`Requested on ${dayjs(stlFileMetaData.requested_at).format('DD-MMM-YYYY')}`}
            </span>
          )
        }
        return 'Pending'

      case 1:
        if (
          stlFileMetaData?.status === 'STL_FILES_UPLOADED' ||
          stlFileMetaData?.status === 'APPROVED'
        ) {
          return (
            <button
              className='flex gap-2 text-[#735bf2] items-center font-semibold'
              type='button'
              onClick={(e) => {
                if (!orderId) return
                e.stopPropagation()
                const queryParams = new URLSearchParams({
                  isStlFileView: 'true',
                }).toString()
                if (customer || isDesignLabUser || isEnterprisePlanUser || isVendor) {
                  navigate(
                    `/leads-profile/${patientId}/files/Orders/Order ${orderId}/${treatmentPlanName}?${queryParams}`
                  )
                } else {
                  navigate(
                    `/leads-profile/${patientId}/files/Orders/Order ${orderId}/${treatmentPlanName}`
                  )
                }
              }}
            >
              View
              <CaretRightIcon color={'#735bf2'} width='7' height='10' />
            </button>
          )
        }
        return 'Pending'
      case 2:
        if (stlFileMetaData?.status === 'APPROVED') {
          return `Approved on ${dayjs(stlFileMetaData?.approved_on).format('DD-MMM-YYYY')}`
        }
        return 'Pending'
      default:
        return ''
    }
  }

  return [
    {
      title: <Title>{getTitle(0)}</Title>,
      id: 0,
      description: getContent(0),
    },
    {
      title: <Title>{getTitle(1)}</Title>,

      id: 1,
      description: getContent(1),
    },
    {
      title: <Title>{getTitle(2)}</Title>,
      id: 2,
      description: getContent(2),
    },
  ]
}
