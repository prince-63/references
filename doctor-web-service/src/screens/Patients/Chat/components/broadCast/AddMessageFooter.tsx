import {Table} from '@tanstack/react-table'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RowDataForBroadcastListPatients} from './broadCastTypes'

const AddMessageFooter = ({
  table,
  setError,
  toggleAddMessageDrawer,
  toggleSelectPatientDrawer,
}: {
  table: Table<RowDataForBroadcastListPatients>
  setError: React.Dispatch<React.SetStateAction<boolean>>
  toggleAddMessageDrawer: (value: boolean) => void
  toggleSelectPatientDrawer: (value: boolean) => void
}) => {
  return (
    <div className='flex justify-end py-2 '>
      <AntdButton
        className='bg-primaryColor text-white h-12 font-semibold text-base w-full md:w-fit'
        isLoading={false}
        text='Add message'
        onClick={() => {
          if (table.getSelectedRowModel().rows.length === 0) {
            setError(true)
          } else {
            toggleSelectPatientDrawer(false)
            toggleAddMessageDrawer(true)
          }
        }}
      />
    </div>
  )
}

export default AddMessageFooter
