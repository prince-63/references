import clsx from 'clsx'
import moment from 'moment'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import jawType from '@constants/jawType'
import {IAppointmentDetails} from '../types/summary.types'
import hasValue from 'utils/hasValue'

const AppointmentTrackingSummary = ({
  appointment_details,
}: {
  appointment_details: {appointments: IAppointmentDetails[]} | null
}) => {
  return (
    <div className='w-full overflow-x-scroll'>
      <table className='min-w-[870px] ' border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr className='bg-textColor font-semibold text-xs text-white h-10'>
            <th className='rounded-ss-xl border-b border-r border-mediumGray w-[160px]' colSpan={2}>
              APPOINTMENT DATE
            </th>
            <th className='border border-mediumGray  w-[360px]' colSpan={2}>
              UPPER JAW
            </th>
            <th
              className='rounded-se-xl border-b border-l border-mediumGray  w-[360px]'
              colSpan={2}
            >
              LOWER JAW
            </th>
          </tr>
          <tr className='bg-lightGray font-semibold text-xs text-black h-10'>
            <th className='border border-mediumGray' colSpan={2}></th>
            <th className='border border-mediumGray'>Stage</th>
            <th className='border border-mediumGray'>Materials & Accessories</th>
            <th className='border border-mediumGray'>Stage</th>
            <th className='border border-mediumGray'>Materials & Accessories</th>
          </tr>
        </thead>
        <tbody>
          {appointment_details?.appointments?.map(
            (appointment: IAppointmentDetails, index: number) => (
              <AppointmentRow key={index} appointment={appointment} />
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AppointmentTrackingSummary

const AppointmentRow = ({appointment}: {appointment: IAppointmentDetails}) => {
  return (
    <>
      <tr>
        <td className='p-4 border border-mediumGray text-xs w-[150px]' colSpan={2} rowSpan={2}>
          {appointment.current_appointment_date
            ? moment(appointment.current_appointment_date).format('DD MMM YYYY')
            : '-'}
        </td>
        <JawData jaw={appointment?.jaws[0]} />
        {appointment?.jaws[0].jaw_type === jawType.BOTH ? (
          <JawData jaw={appointment?.jaws[0]} />
        ) : (
          <JawData jaw={appointment?.jaws[1]} />
        )}
      </tr>
      <tr>
        <td className='p-4 border border-mediumGray text-xs w-[360px]' colSpan={2}>
          <span className='text-black font-semibold text-xs'>Note: </span>
          {appointment?.jaws[0]?.note || 'No note'}
        </td>
        <td className='p-4 border border-mediumGray text-xs  w-[360px]' colSpan={2}>
          <span className='text-black font-semibold text-xs'>Note: </span>
          {appointment?.jaws[1]?.note || appointment?.jaws[0]?.note || 'No note'}
        </td>
      </tr>
    </>
  )
}

const JawData = ({jaw}: {jaw: any}) => {
  return (
    <>
      <td className='p-4 border border-mediumGray text-xs  w-[180px]'>
        {jaw?.treatment_stage_type ? (
          <Tag
            value={jaw?.treatment_stage_type}
            className={clsx('text-xs w-fit bg-primarySupport text-primaryColor')}
          />
        ) : (
          '-'
        )}
      </td>
      <td className='p-4 border border-mediumGray text-xs  w-[180px] '>
        <When isTrue={jaw !== null}>
          <div>
            {jaw?.shape && `${jaw?.shape} - `}
            {jaw?.material_name && `${jaw.material_name} - `}
            {jaw?.material_size}
          </div>

          {hasValue(jaw?.space_enclosure_tools) && (
            <div>
              {jaw?.space_enclosure_tools?.length > 0 ? jaw?.space_enclosure_tools.join(', ') : ''}
            </div>
          )}
          {!hasValue(jaw?.shape) &&
            !hasValue(jaw?.material_name) &&
            !hasValue(jaw?.material_size) &&
            !hasValue(jaw?.space_enclosure_tools) &&
            '-'}
        </When>
      </td>
    </>
  )
}
