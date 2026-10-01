import useDispatchAction from '@hooks/useDispatchAction'
import DropdownRightArrow from 'assets/icons/DropdownRightArrow'
import InfoIcon from 'assets/icons/InfoIcon'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {zipOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import {SVG_CROSS} from 'utils/SvgConstants'

const ZipHelpBanner = () => {
  const [visible, setVisible] = useState(true)
  const {dispatchAction} = useDispatchAction()
  const {order} = useSelector((state: RootState) => state.orders)
  const {userId} = useContext(AuthContext)
  if (!visible) return null

  const updateZipDisplayBanner = async () => {
    await dispatchAction(
      zipOrder({
        order_id: order?.order_id,
        doctor_id: safeParseInt(userId),
      })
    )
      .unwrap()
      .then(() => {
        setVisible(false)
      })
  }

  return (
    <div className='relative border border-secondaryColor rounded-xl p-4 bg-secondarySupport text-sm flex flex-col md:flex-row justify-between gap-3 md:items-start'>
      <div className='flex items-start gap-2'>
        <InfoIcon color={getColorPalette().secondaryColor} height='20' width='20' />
        <div className='flex flex-col gap-1'>
          <p className='font-semibold text-black'>Not sure how to zip your files?</p>
          <div className='flex flex-col md:flex-row gap-2 md:gap-4 text-secondaryColor font-medium'>
            <a
              href='https://support.microsoft.com/en-us/windows/zip-and-unzip-files-8d28fa72-f2f9-712f-67df-f80cf89fd4e5'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline flex items-center gap-1 -ml-6 md:ml-0'
            >
              <span>How to create a ZIP on Windows</span>
              <DropdownRightArrow color={getColorPalette().secondaryColor} />
            </a>

            <a
              href='https://support.apple.com/guide/mac-help/compress-uncompress-files-folders-mchlp2528/mac'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline flex items-center gap-1 -ml-6 md:ml-0'
            >
              <span>How to create a ZIP on Mac</span>
              <DropdownRightArrow color={getColorPalette().secondaryColor} />
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={() => updateZipDisplayBanner()}
        className='text-textColor hover:text-black text-sm font-medium inline-flex items-center gap-1 self-start md:self-center'
      >
        <CommonSVG svg={SVG_CROSS} className='h-4 w-4' />
        <span className='md:inline'>Dismiss</span>
      </button>
    </div>
  )
}
export default ZipHelpBanner
