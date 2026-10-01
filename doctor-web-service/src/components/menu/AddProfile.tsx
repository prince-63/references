import InfoIcon from 'assets/icons/InfoIcon'
import ModalCard from 'components/modalCard/ModalCard'
import {AuthContext} from 'context/AuthContext'
import React, {useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'

const AddProfile = ({
  openAddProfile,
  setOpenAddProfile,
}: {
  openAddProfile: boolean
  setOpenAddProfile: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const {logout} = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <ModalCard
      title='Add new profile'
      subTitle='Add another profile with the same or different email.'
      okText='Use same email'
      cancelText='Use different email'
      width='566px'
      drawerHeight='300px'
      open={openAddProfile}
      showFooter={true}
      onClick={() => {
        setOpenAddProfile(false)
        navigate('/roles')
      }}
      onClose={() => {
        setOpenAddProfile(false)
        logout()
        navigate('/registration')
      }}
      onCloseFromCrossButton={() => {
        setOpenAddProfile(false)
      }}
      showCrossButton={true}
      classNameFooter='flex flex-col-reverse md:mx-6 md:mb-6'
      classNameTitle='md:mx-6 md:mt-6'
      subTitleClassName='md:mx-6 text-sm'
    >
      <div className='flex gap-2 items-center m-6'>
        <InfoIcon width='20' height='20' color={getColorPalette().primaryColor} />
        <div className='!text-sm text-primaryColor mt-[2px]'>
          To switch between your other profiles you should have the same email.
        </div>
      </div>
    </ModalCard>
  )
}

export default AddProfile
