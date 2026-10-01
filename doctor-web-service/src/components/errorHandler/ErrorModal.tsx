import React, {useEffect, useState} from 'react'
import {Modal} from 'antd'
import Fallback from 'components/errorHandler/Fallback'

const ErrorModal = ({error}: {error: any}) => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error?.alertType === 'MODAL') {
      setShowModal(true)
    }
  }, [error])

  return (
    <Modal open={showModal} onCancel={() => setShowModal(false)} footer={[]}>
      <Fallback />
    </Modal>
  )
}

export default ErrorModal
