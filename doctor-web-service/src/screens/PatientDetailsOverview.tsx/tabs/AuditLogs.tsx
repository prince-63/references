import CalenderIcon from 'assets/icons/CalenderIcon'
import IconActivity from 'assets/icons/IconActivityLogs'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import React, {useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getAuditLogs} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import {SVG_PERSON_GRAY} from 'utils/SvgConstants'

const ActivityLogs = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const dispatch = useDispatch()
  const {getAuditLogsList, loadingCardConfiguration} = useSelector(
    (state: RootState) => state.workFlow
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const getIndividualTaskList = useSelector(
    (state: RootState) => state.workFlow.getIndividualTaskList
  )
  const isShowCreatedByDetails = !getIndividualTaskList?.is_cloned_order && serviceConfig?.PLANNING

  // Normalize to an array no matter what shape the slice has
  const auditList: any[] = useMemo(() => {
    if (Array.isArray(getAuditLogsList)) return getAuditLogsList
    if (!getAuditLogsList) return []
    // common backend shapes
    return (
      getAuditLogsList.content ??
      getAuditLogsList.items ??
      getAuditLogsList.results ??
      getAuditLogsList.data ??
      []
    )
  }, [getAuditLogsList])

  useEffect(() => {
    const patientId = data?.patient_details?.id
    if (!patientId) return
    dispatch(getAuditLogs({patient_id: patientId}) as any)
  }, [dispatch, data?.patient_details?.id])

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '—'
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${datePart} at ${timePart}`
  }

  return (
    <div className='w-full mx-auto'>
      <h2 className='text-lg font-semibold text-black'>Audit Logs</h2>

      <div className='rounded-lg shadow-sm'>
        {!loadingCardConfiguration && (
          <>
            <div className=''>
              {auditList.map((activity: any) => (
                <div
                  key={activity.id}
                  className='px-6 py-4 border border-mediumGray rounded-lg my-4'
                >
                  <div className='flex items-start space-x-4'>
                    <div className='mt-1'>
                      <IconActivity
                        color={
                          activity.activity_type === 'CHANGE_WORKFLOW'
                            ? getColorPalette().secondaryColor
                            : activity.activity_type === 'MOVE'
                              ? getColorPalette().tertiaryColor
                              : getColorPalette().primaryColor
                        }
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-base  mb-2'>
                        {activity.activity ?? 'Activity'}
                      </h3>

                      <div className='flex items-center gap-6 text-sm text-gray-500 flex-wrap'>
                        {isShowCreatedByDetails && (
                          <div className='flex items-center gap-1'>
                            <CommonSVG svg={SVG_PERSON_GRAY} width='16' height='16' />
                            <span>User: {activity.activity_by ?? '—'}</span>
                          </div>
                        )}
                        <div className='flex items-center gap-1'>
                          <CalenderIcon color={getColorPalette().textColor} />
                          <span>Date: {formatDate(activity.activity_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {auditList.length === 0 && (
              <div className='px-6 py-12 text-center'>
                <p className='text-gray-500'>No Audit Logs found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ActivityLogs
