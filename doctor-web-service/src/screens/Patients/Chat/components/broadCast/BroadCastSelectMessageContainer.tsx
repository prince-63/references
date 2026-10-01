import {useEffect, useState} from 'react'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import MessageContainer from './MessageContainer'
import {FormikProps} from 'formik'
import useFilter from '@hooks/useFilter'
import messageTemplateList from '@staticData/messageTemplateList'
import {toUpper} from 'ramda'
import {FilterOption, FormValues} from './broadCastTypes'
import DropdownIcon from 'assets/icons/DropdownIcon'
import {MAX_CHAR_COUNT, REQUIRED_CUSTOM_ERROR_MESSAGE} from './BroadCastSelectMessageDrawer'
import CircledAlertIcon from 'assets/icons/CircledAlertIcon'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'
import When from 'components/when/When'

const BroadCastSelectMessageContainer = ({
  formik,
  hideQuickSelect,
}: {
  formik: FormikProps<FormValues>
  hideQuickSelect?: boolean
}) => {
  type MessageFilterOption = (typeof messageTemplateList)[number]

  const {filter, handleFilterChange} = useFilter<MessageFilterOption>(messageTemplateList, false)

  const handleSelectMessage = (option: FilterOption) => {
    formik.setFieldValue('customMessage', option.label)
    handleFilterChange(option.value)
  }
  useEffect(() => {
    let matched = false
    messageTemplateList.forEach((option) => {
      if (toUpper(option.label) === toUpper(formik.values.customMessage)) {
        handleFilterChange(option.value)
        matched = true
      }
    })
    if (!matched) {
      handleFilterChange('')
    }
  }, [formik.values.customMessage])
  const [showAll, setShowAll] = useState(false)

  const handleToggleShowAll = () => {
    setShowAll(!showAll)
  }
  const charCount = formik.values.customMessage.replace(/[\s\n]/g, '').length

  const displayedMessages = showAll ? messageTemplateList : messageTemplateList.slice(0, 3)
  return (
    <div className='flex flex-col gap-4'>
      <When isTrue={!hideQuickSelect}>
        <div className='flex flex-col gap-2'>
          {formik.errors.customMessage === REQUIRED_CUSTOM_ERROR_MESSAGE && (
            <div className='flex gap-2 text-sm font-medium text-red'>
              <CircledAlertIcon />
              {formik.errors.customMessage}
            </div>
          )}
          <p className='text-textColor font-medium text-base'>Quick select</p>
          {displayedMessages.map((option, index) => (
            <MessageContainer
              key={index}
              {...{
                title: option.value,
                content: option.label,
                handleFilterChange: handleSelectMessage,
                filter,
              }}
            />
          ))}
        </div>
        <button
          onClick={handleToggleShowAll}
          className='p-2  text-primaryColor rounded w-fit flex items-center gap-2 font-semibold'
        >
          <p>{showAll ? 'View less' : 'View all'} </p>
          <DropdownIcon
            className={` transition-transform ${showAll ? 'rotate-180' : ''}`}
            color={getColorPalette().primaryColor}
          />
        </button>
        <div className='w-full border border-mediumGray '></div>
      </When>
      <div className='flex flex-col gap-1'>
        <div className='flex justify-between font-medium'>
          <p className='text-textColor text-base'>Custom message (click to edit)</p>

          <p className={clsx('text-sm', charCount >= MAX_CHAR_COUNT && 'text-red')}>
            {charCount} / {MAX_CHAR_COUNT} characters
          </p>
        </div>
        <InputTextArea
          {...{
            placeholder: 'Write your message',
            rows: 8,
            className: 'border border-mediumGray rounded-lg p-2 card-wrapper ',
            name: 'customMessage',
            formik,
            // maxLength: MAX_CHAR_COUNT,
            showError: formik.errors.customMessage !== REQUIRED_CUSTOM_ERROR_MESSAGE,
          }}
        />
      </div>
    </div>
  )
}

export default BroadCastSelectMessageContainer
