import {Popover} from 'antd'
import {useState} from 'react'
import {setStatusFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RxCaretDown, RxCaretUp} from 'react-icons/rx'
import filterPatientList from '@constants/filterPatientList'

const AppInviteStatus = ({
  onStatusFilter,
}: {
  onStatusFilter: (filter: keyof typeof filterPatientList | 'ALL') => void
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const filterPatientListLabels: Record<keyof typeof filterPatientList | 'ALL', string> = {
    ALL: 'All',
    NOT_CONNECTED: 'NOT CONNECTED',
    PENDING: 'PENDING',
    CONNECTED: 'CONNECTED',
  }

  const {dispatchAction} = useDispatchAction()

  const handleSelect = (value: keyof typeof filterPatientList | 'ALL') => {
    dispatchAction(setStatusFilter(value))
    onStatusFilter(value)
    setPopoverOpen(false)
  }

  return (
    <Popover
      content={
        <div className='flex flex-col gap-3 text-right'>
          {(['ALL', ...Object.values(filterPatientList)] as const).map((item) => (
            <div
              key={item}
              className='flex items-center gap-2 hover:bg-primarySupport w-96 cursor-pointer'
              onClick={() => handleSelect(item)}
            >
              <span className='text-black font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                {filterPatientListLabels[item]}
              </span>
            </div>
          ))}
        </div>
      }
      placement='bottomLeft'
      trigger={['click']}
      className='transition ease-in-out duration-200'
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
    >
      <AntdButton
        className='h-10 bg-white hover:!bg-primarySupport hover:!text-textColor text-textColor text-base'
        type='default'
        text='App Invite Status'
        iconPosition='end'
        icon={popoverOpen ? <RxCaretUp size={24} /> : <RxCaretDown size={24} />}
      />
    </Popover>
  )
}

export default AppInviteStatus
