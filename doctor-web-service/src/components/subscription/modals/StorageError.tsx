import {eventEmitter} from '@utils/eventEmitter'
import {Modal} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import {memo, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

const StorageError = () => {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const onGreet = () => {
      setShowModal(true)
    }

    eventEmitter.on('greet', onGreet)
    return () => {
      eventEmitter.off('greet', onGreet)
    }
  }, [])

  return (
    <Modal
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={[]}
      zIndex={2000}
      closeIcon={false}
    >
      <div className='p-3'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-redSupport'>
            <InfoIcon color='red' width='24' height='24' />
          </div>
          <div
            className='cursor-pointer'
            onClick={() => {
              setShowModal(false)
            }}
          >
            <CloseIcon width='24' height='24' />
          </div>
        </div>
        <div>
          <p className='font-semibold text-2xl '>You’ve reached your storage limit</p>
          <p className=' text-textColor text-base font-normal'>
            To add more storage, please contact us to top up your limit.
          </p>
        </div>
        <button
          className='w-full h-12 bg-red text-white font-semibold rounded-lg mt-6'
          onClick={() => {
            navigate('/settings/upgrade-renew-subscription')
            setShowModal(false)
          }}
        >
          Upgrade
        </button>
      </div>
    </Modal>
  )
}

export default memo(StorageError)
