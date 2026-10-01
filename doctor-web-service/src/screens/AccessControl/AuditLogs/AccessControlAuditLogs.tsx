import {useContext, useEffect, useState} from 'react'
import TableContainerForAuditLogs from './TableContainerForAuditLogs'
import {safeParseInt} from 'utils/ConstFunctions'
import {getAuditLogsList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'

import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'

const AccessControlAuditLogs = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [pageNumber, setCurrentPageNumber] = useState(1)

  useEffect(() => {
    getAuditLogs({})
  }, [])

  const getAuditLogs = ({page = pageNumber - 1}: {page?: number}) => {
    const payload = {
      doctor_id: safeParseInt(userId),
      page_number: page,
    }
    dispatchAction(getAuditLogsList(payload))
  }

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (userId) {
      setCurrentPageNumber(page)
      getAuditLogs({page: page})
    }
  }

  return (
    <div className='flex flex-col gap-3 my-3'>
      <div>
        <div className='text-lg font-semibold w-fit'> Audit Logs</div>
        <div className='text-sm font-normal text-textColor'>Track system activity and changes.</div>
      </div>

      <TableContainerForAuditLogs pageNumber={pageNumber} handleOnSearch={handleOnSearch} />
    </div>
  )
}

export default AccessControlAuditLogs
