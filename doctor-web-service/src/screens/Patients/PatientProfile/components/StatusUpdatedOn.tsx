import React from 'react'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import {SVG_ARROW_RIGHT_GRAY} from '../../../../utils/SvgConstants'
import {IStatus} from '../types/Aligners.types'
import moment from 'moment'
import {getProperStatusChange} from 'utils/ConstFunctions'

const StatusUpdatedOn = ({status}: {status: IStatus}) => {
  return (
    <div className='flex flex-col  justify-start text-textColor'>
      <p className='font-semibold text-sm text-black'>
        {moment(status.logged_at).format('DD MMM')} '{moment(status.logged_at).format('YY')}
      </p>
      <div className='flex items-center gap-1 font-medium text-xs'>
        <p>{getProperStatusChange(status.old_production_sub_status)}</p>
        <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='14' height='10' />
        <p>{getProperStatusChange(status.new_production_sub_status)}</p>
      </div>
    </div>
  )
}

export default StatusUpdatedOn
