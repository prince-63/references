import useActiveProfile from '@hooks/useActiveProfile'
import LockIconSimple from 'assets/icons/LockIconSimple'
import PlusIcon from 'assets/icons/PlusIcon'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'

const PracticeListHeader = ({
  isAccessible,
  setLockPractice,
}: {
  isAccessible: boolean
  setLockPractice: (x: boolean) => void
}) => {
  const navigate = useNavigate()
  const {activeProfile} = useActiveProfile()
  const ownerProfileType = activeProfile?.profile_type === 'OWNER'
  return (
    <div className='mt-4 flex flex-wrap justify-between gap-4'>
      <div>
        <div className='text-2xl font-semibold'>Practices</div>
        <div className='text-textColor'>View all your doctors and clinic owners at one place.</div>
      </div>
      <When isTrue={ownerProfileType && isAccessible}>
        <button
          className='md:w-fit w-full bg-primaryColor px-4 py-3 text-white rounded-lg flex gap-1 items-center h-10 justify-center'
          onClick={() => {
            if (isAccessible) {
              navigate('/practices-add')
            } else {
              setLockPractice(true)
            }
          }}
        >
          <When isTrue={isAccessible}>
            <PlusIcon color='#fff' />
          </When>
          <When isTrue={!isAccessible && ownerProfileType}>
            <LockIconSimple color='#fff' width='20' height='20' />
          </When>

          <div>Add a practice</div>
        </button>
      </When>
      <When isTrue={ownerProfileType && !isAccessible}>
        <button
          className='md:w-fit w-full bg-primaryColor px-4 py-3 text-white rounded-lg flex gap-1 items-center h-10 justify-center'
          onClick={() => {
            if (isAccessible) {
              navigate('/practices-add')
            } else {
              setLockPractice(true)
            }
          }}
        >
          <When isTrue={!isAccessible}>
            <LockIconSimple color='#fff' width='20' height='20' />
          </When>

          <div>Add a practice</div>
        </button>
      </When>
    </div>
  )
}
export default PracticeListHeader
