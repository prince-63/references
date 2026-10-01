import React, {useState} from 'react'
import broadCastListPatientsFilterOptions from '@staticData/broadCastListPatientsFilterOptions'
import clsx from 'clsx'
import broadCastListPatientsFilterOptionType from '@constants/broadCastListPatientsFilterOptionType'
import {Table} from '@tanstack/react-table'
import {RowDataForBroadcastListPatients} from './broadCastTypes'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const FilterDropdownList = ({
  table,
  getResultsByFilter,
}: {
  table: Table<RowDataForBroadcastListPatients>
  getResultsByFilter: (value: keyof typeof broadCastListPatientsFilterOptionType) => void
}) => {
  const [selectedOption, setSelectedOption] = useState<
    keyof typeof broadCastListPatientsFilterOptionType
  >(broadCastListPatientsFilterOptions[0].value)
  const {loadingBroadCastPatientsList} = useSelector((state: RootState) => state.apiChatList)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.toggleAllRowsSelected(false)
    setSelectedOption(event.target.value as keyof typeof broadCastListPatientsFilterOptionType)
    getResultsByFilter(event.target.value as keyof typeof broadCastListPatientsFilterOptionType)
  }

  return (
    <div className='flex flex-col '>
      {broadCastListPatientsFilterOptions.map((option, index) => {
        return (
          <div
            key={index}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-[4px]',
              selectedOption === option.value && 'bg-primarySupport'
            )}
          >
            <input
              type='radio'
              id={option.value}
              name='filterOption'
              className='form-radio h-5 w-5 accent-primaryColor cursor-pointer'
              value={option.value}
              checked={selectedOption === option.value}
              onChange={handleChange}
              disabled={loadingBroadCastPatientsList}
            />
            <label
              htmlFor={option.value}
              className='text-textColor text-sm font-medium cursor-pointer w-full '
            >
              {option.label}
            </label>
          </div>
        )
      })}
    </div>
  )
}

export default FilterDropdownList
