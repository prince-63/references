import cn from '@utils/cn'
import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'

interface AddNewPatientModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const options = [
  {
    label: 'New Case',
    value: 'NEW_CASE',
    subTitle: 'Start a fresh treatment case for a new or existing patient.',
  },
]

const AddNewPatientModal = ({open, setOpen}: AddNewPatientModalProps) => {
  const navigate = useNavigate()

  const defaultOption = options[0].value
  const [selectedOption, setSelectedOption] = useState(defaultOption)

  const handleSubmit = async () => {
    if (selectedOption === 'NEW_CASE') {
      navigate(`/add-patient`)
    } else {
      navigate(`/add_patient/existing_case`, {
        state: {
          isExistingCase: true,
        },
      })
    }
  }

  return (
    <Modal
      destroyOnClose
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={open}
      title={
        <>
          <p className='font-semibold text-2xl'>Add patient</p>
          <p
            className='font-normal text-base leading-6 text-textColor
'
          >
            Choose to add a new or existing case.
          </p>
        </>
      }
      width={600}
      centered
      footer={
        <div className='flex justify-between gap-2'>
          <button
            className='w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
            type='button'
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <AntdButton
            key='confirm'
            text='Confirm'
            htmlType='submit'
            className='h-10 w-full bg-primaryColor text-center'
            onClick={handleSubmit}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        {options.map((option) => {
          const isSelected = option.value === selectedOption
          return (
            <FilterOptionSelectDropdown
              key={option.value}
              value={option.value}
              label={option.label}
              subTitle={option.subTitle}
              onChange={(option) => setSelectedOption(option.value)}
              className={cn(
                'px-4 py-3 border border-mediumGray rounded-lg',
                isSelected && 'border-primaryColor'
              )}
              checked={isSelected}
              labelClassName='truncate font-medium text-lg text-black'
            />
          )
        })}
      </div>
    </Modal>
  )
}

export default AddNewPatientModal
