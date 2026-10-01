import {Popover} from 'antd'
import {useState} from 'react'
import {setGlobalFilter} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RxCaretDown, RxCaretUp} from 'react-icons/rx'
import orderListPatientForOrg from '@staticData/orderListPatientForOrg'
import {GlobalStatusType} from 'screens/Patients/PatientList/components/CountBox'

const TreatmentStage = ({
  onGlobalFilter,
}: {
  onGlobalFilter: (globalFilter: GlobalStatusType) => void
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const {dispatchAction} = useDispatchAction()

  const handleSelect = (value: GlobalStatusType) => {
    dispatchAction(setGlobalFilter(value))
    onGlobalFilter(value)
    setPopoverOpen(false)
  }

  return (
    <Popover
      content={
        <div className='flex  flex-col gap-3 text-right'>
          {orderListPatientForOrg.map((item) => (
            <div
              key={item.value}
              className='flex items-center gap-2 hover:bg-primarySupport w-96 cursor-pointer'
              onClick={() => handleSelect(item.value)}
            >
              <span className='text-black font-figtree text-sm font-medium leading-5 tracking-[0.14px]'>
                {item.label}
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
        text='Treatment Stage'
        iconPosition='end'
        icon={popoverOpen ? <RxCaretUp size={24} /> : <RxCaretDown size={24} />}
      />
    </Popover>
  )
}

export default TreatmentStage
