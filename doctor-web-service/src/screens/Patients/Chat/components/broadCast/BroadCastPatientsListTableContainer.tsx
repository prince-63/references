import {flexRender, Table} from '@tanstack/react-table'
import FilterIcon from 'assets/icons/FilterIcon'
import InputSearch from 'components/atom/Inputs/InputSearch'
import React from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_NO_PATIENTS_FOUND} from 'utils/ImageConst'
import {Popover} from 'antd'
import FilterDropdownList from './FilterDropdownList'
import {RowDataForBroadcastListPatients} from './broadCastTypes'
import CircledAlertIcon from 'assets/icons/CircledAlertIcon'
import broadCastListPatientsFilterOptionType from '@constants/broadCastListPatientsFilterOptionType'

const BroadCastPatientsListTableContainer = ({
  table,
  searchName,
  setSearchName,
  isShowPhotos,
  setIsShowPhotos,
  selectedImage,
  error,
  getResultsByFilter,
}: {
  table: Table<RowDataForBroadcastListPatients>
  searchName: string
  setSearchName: React.Dispatch<React.SetStateAction<string>>
  isShowPhotos: boolean
  setIsShowPhotos: React.Dispatch<React.SetStateAction<boolean>>
  selectedImage: RowDataForBroadcastListPatients
  error: boolean
  getResultsByFilter: (value: keyof typeof broadCastListPatientsFilterOptionType) => void
}) => {
  const {loadingBroadCastPatientsList} = useSelector((state: RootState) => state.apiChatList)

  return (
    <div className=''>
      <div className='flex gap-2 mb-2 md:mb-0'>
        <InputSearch
          name='patientSearch'
          placeholder='Search Patient'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchName(e.target.value)
          }}
          value={searchName}
          maxLength={30}
          wrapperClassName='rounded-lg'
        />
        <Popover
          content={<FilterDropdownList {...{table, getResultsByFilter}} />}
          trigger={['click']}
          overlayInnerStyle={{padding: '4px', fontFamily: 'figtree'}}
          style={{fontFamily: 'figtree'}}
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <button className='rounded-lg  flex justify-center items-center border border-mediumGray px-2'>
            <FilterIcon />
          </button>
        </Popover>
      </div>
      {error && (
        <div className='flex gap-2 mt-2 text-sm font-medium text-red'>
          <CircledAlertIcon />
          Please select at least 1 patient to continue
        </div>
      )}
      <div className='w-full flex flex-col overflow-auto card-wrapper'>
        <When isTrue={isShowPhotos}>
          <ImageViewer
            setIsShowPhotos={setIsShowPhotos}
            selectedImagesList={[
              {
                src: selectedImage.patient_profile_photo,
                alt: selectedImage.patient_name,
                title: selectedImage.patient_name,
                width: '100%',
                height: '100%',
              },
            ]}
          />
        </When>
        <When isTrue={loadingBroadCastPatientsList}>
          <div className='flex flex-col justify-center items-center gap-5 h-[calc(100vh-20rem)]'>
            <Spinner loading />
          </div>
        </When>

        <When isTrue={!loadingBroadCastPatientsList}>
          <When isTrue={table.getPrePaginationRowModel().rows.length === 0}>
            <CommonEmptyState
              image={IMAGE_NO_PATIENTS_FOUND}
              subTitle='No patients found'
              boxStyle='gap-4 h-[calc(100vh-21rem)] text-center flex flex-col justify-center items-center'
              imageStyle='w-[160px] h-[160px]'
            />
          </When>
          <When isTrue={table.getPrePaginationRowModel().rows.length > 0}>
            <table className='table-auto w-full md:mt-3'>
              <thead>
                {table.getHeaderGroups().map((headerGroup, index: number) => (
                  <tr key={index} className=''>
                    {headerGroup.headers.map((header, index: number) => {
                      return (
                        <th
                          className={`text-start text-black text-sm font-medium `}
                          key={index}
                          colSpan={header.colSpan}
                        >
                          <div>
                            <div className='flex gap-2'>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const className = `text-base `
                  return (
                    <tr key={row.id} className={className}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id} className=''>
                            <div className='py-3'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </When>
        </When>
      </div>
    </div>
  )
}

export default BroadCastPatientsListTableContainer
