import Pricify from '@chargebee/atomicpricing'
import {useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'

export default function PricingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const doctorData = location.state?.doctorData
  useEffect(() => {
    if (!hasValue(doctorData)) {
      navigate('/')
    }
    Pricify.init()
    Pricify.setVisitor({
      email: doctorData?.email?.toLocaleLowerCase(),
      firstName: doctorData?.first_name,
      lastName: doctorData?.last_name,
      phone: doctorData?.mobile,
    })
  }, [])

  return (
    <div className='flex '>
      <button
        type='button'
        onClick={() => {
          navigate(-1)
        }}
        className='rounded-full bg-lightGray w-12 h-12 flex items-center justify-center mt-10 ml-2'
      >
        <img src={leftArrow} alt='' width={20} />
      </button>
      <div
        id='pricify-hosted-pricing-page'
        data-pricify-site={process.env.REACT_APP_DATA_PRICIFY_SITE}
        data-pricify-pricingpage={process.env.REACT_APP_DATA_PRICIFY_PRICINGPAGE}
        data-pricify-viewport-defaultheight='777px'
        data-pricify-viewport-height='60rem'
        className='w-full h-full flex-1'
        data-pricify-autoselectlocalcurrency='true'
        data-pricify-showcurrencydropdown='false'
      ></div>
    </div>
  )
}
