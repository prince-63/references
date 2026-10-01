import CustomDrawer from 'components/drawer/CustomDrawer'
import {useContext, useEffect, useState} from 'react'
import BroadCastPatientsListTableContainer from './BroadCastPatientsListTableContainer'

import AddMessageFooter from './AddMessageFooter'
import {RowDataForBroadcastListPatients} from './broadCastTypes'
import {Table} from '@tanstack/react-table'
import useDispatchAction from '@hooks/useDispatchAction'
import {getBroadCastPatientsList} from 'redux/Slices/AppSlice/Chat/ChatListSlice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import broadCastListPatientsFilterOptionType from '@constants/broadCastListPatientsFilterOptionType'

const BroadCastPatientsListDrawer = ({
  showSelectPatientDrawer,
  toggleSelectPatientDrawer,
  toggleAddMessageDrawer,
  table,
  searchName,
  setSearchName,
  isShowPhotos,
  setIsShowPhotos,
  selectedImage,
}: {
  showSelectPatientDrawer: boolean
  toggleSelectPatientDrawer: (value: boolean) => void
  toggleAddMessageDrawer: (value: boolean) => void
  table: Table<RowDataForBroadcastListPatients>
  searchName: string
  setSearchName: React.Dispatch<React.SetStateAction<string>>
  isShowPhotos: boolean
  setIsShowPhotos: React.Dispatch<React.SetStateAction<boolean>>
  selectedImage: RowDataForBroadcastListPatients
}) => {
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (table.getSelectedRowModel().rows.length > 0) {
      setError(false)
    }
  }, [table.getSelectedRowModel().rows.length])
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const getResultsByFilter = (value: keyof typeof broadCastListPatientsFilterOptionType) => {
    dispatchAction(
      getBroadCastPatientsList({
        doctor_id: safeParseInt(userId),
        aligner_journey_filter: value,
      })
    )
  }

  useEffect(() => {
    if (showSelectPatientDrawer) {
      getResultsByFilter('ALL')
    }
  }, [showSelectPatientDrawer])
  return (
    <div>
      <CustomDrawer
        {...{
          onClose: () => {
            table.toggleAllRowsSelected(false)
            toggleSelectPatientDrawer(false)
            setSearchName('')
          },
          open: showSelectPatientDrawer,
          title: 'New broadcast message',
          subTitle: 'Select patients that you want to send broadcast message to',
          destroyOnClose: true,
          footer: (
            <AddMessageFooter
              {...{table, setError, toggleAddMessageDrawer, toggleSelectPatientDrawer}}
            />
          ),
        }}
      >
        <BroadCastPatientsListTableContainer
          {...{
            table,
            searchName,
            setSearchName,
            isShowPhotos,
            setIsShowPhotos,
            selectedImage,
            error,
            getResultsByFilter,
          }}
        />
      </CustomDrawer>
    </div>
  )
}

export default BroadCastPatientsListDrawer
