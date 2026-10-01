import BorderedCard from 'components/BorderedCard/BorderedCard'
import Label from 'components/heading/Label'
import Text from 'components/heading/Text'
import PageHeading from 'components/heading/PageHeading'
import {useLocation} from 'react-router-dom'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import When from 'components/when/When'

const ProfileTab = () => {
  const location = useLocation()
  const practiceObject: Invitation = location.state
  const first_name = practiceObject?.first_name
  const last_name = practiceObject?.last_name || ''
  const full_name = `${first_name} ${last_name}`
  const salutationRaw = practiceObject?.salutation || ''
  const salutation = salutationRaw.trim().endsWith('.')
    ? salutationRaw.trim()
    : `${salutationRaw.trim()}.`
  const mobile = practiceObject?.mobile_no || ''
  const country_code = practiceObject?.country_code || ''
  const email = practiceObject?.email || ''
  return (
    <BorderedCard cardClassName='border-none flex flex-col gap-4'>
      <div className='mb-4'>
        <PageHeading>Profile</PageHeading>
      </div>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1'>
          <Label>Name</Label>
          <Text>{`${salutation} ${full_name}`}</Text>
        </div>

        <When isTrue={!!mobile}>
          <div className='flex flex-col gap-1'>
            <Label>Mobile</Label>
            <Text>{mobile && `${country_code} ${mobile}`}</Text>
          </div>
        </When>

        <When isTrue={!!email}>
          <div className='flex flex-col gap-1'>
            <Label>Email</Label>
            <Text>{email}</Text>
          </div>
        </When>
      </div>
    </BorderedCard>
  )
}

export default ProfileTab
