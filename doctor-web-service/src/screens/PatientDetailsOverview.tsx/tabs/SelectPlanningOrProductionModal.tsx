import {Modal} from 'antd'
import RadioGroup from 'components/RadioGroup/RadioGroup'
import React, {useState} from 'react'

const SelectPlanningOrProductionModal = ({
  open,
  setOpenModal,
}: {
  open: boolean
  setOpenModal: (open: boolean) => void
}) => {
  const [selectedOption, setSelectedOption] = useState('PLANNING')
  const handleContinue = (option: string) => {
    setSelectedOption(option)
    setOpenModal(false)
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpenModal(false)}
      footer={[]}
      zIndex={2000}
      closeIcon={false}
    >
      <div className='p-3'>
        <div>
          <p className='font-semibold text-2xl '>Send a case</p>
          <p className=' text-textColor text-base font-normal'>
            Select which type of case you want to outsource.
          </p>
        </div>
        <RadioGroup
          options={[
            {label: 'Planning', value: 'PLANNING'},
            {label: 'Production', value: 'PRODUCTION'},
          ]}
          onOptionChange={(value) => setSelectedOption(value)}
          selectedOption={selectedOption}
        />
        <div>
          <button
            className='w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg'
            type='button'
            onClick={() => setOpenModal(false)}
          >
            Cancel
          </button>
          <button
            className='w-full text-white bg-primaryColor py-3 px-6 rounded-lg'
            type='button'
            onClick={() => handleContinue(selectedOption)}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SelectPlanningOrProductionModal
