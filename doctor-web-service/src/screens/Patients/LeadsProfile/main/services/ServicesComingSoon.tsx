import {Image} from 'assets/images/Images/Image'
import Page from 'components/page/Page'
import React from 'react'
import getBrandConfig from 'utils/getBrandConfig'
import {IMAGE_COMING_SOON} from 'utils/ImageConst'

const ServicesComingSoon = () => {
  return (
    <Page title={`${getBrandConfig().name} Services`} showBorder={true}>
      <div className='w-full h-[30rem] flex  flex-col items-center justify-center'>
        <Image src={IMAGE_COMING_SOON} />
        <div className='text-xl font-semibold mt-2'>Our services are coming soon</div>
        <div className='font-[400] text-center text-textColor w-[24rem] text-wrap mt-2'>
          We are curating the best services to cater to your needs. We will notify you once it is
          up!
        </div>
      </div>
    </Page>
  )
}

export default ServicesComingSoon
