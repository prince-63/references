import React, {useContext, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import type {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {addDoctorComment, getDoctorComments} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import getColorPalette from 'utils/getColorPalette'
import moment from 'moment'
import useDispatchAction from '@hooks/useDispatchAction'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {getActivityCommentLogs} from 'redux/Slices/AppSlice/ActivityCommentLogs/ActivityCommentLogs.slice'

const Comments = () => {
  const dispatch = useDispatch() as any
  const {userId, profileId} = useContext(AuthContext)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {comments} = useSelector((state: RootState) => state.kanban)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams<{patientId: string}>()

  useEffect(() => {
    const payload = {patientId: data?.patient_details?.id}
    dispatch(getDoctorComments(payload as any))
  }, [])

  const reversedComments = useMemo<any[]>(() => {
    const list = (comments as any[]) ?? []
    return list.slice().reverse()
  }, [comments])

  const onAddComment = async () => {
    const value = text.trim()
    if (!value) return
    setSubmitting(true)

    const payload = {
      doctor_id: userId,
      profile_id: profileId,
      notes: value,
      patient_id: data?.patient_details?.id,
      remark: value,
    } as any

    dispatch(addDoctorComment(payload))
      .unwrap()
      .then(() => {
        setText('')
        const payload = {patientId: data?.patient_details?.id} as any
        dispatch(getDoctorComments(payload))
          .unwrap()
          .then(() => {
            dispatchAction(
              getActivityCommentLogs({
                patient_id: safeParseInt(patientId),
                page_number: 0,
                page_size: 10,
              })
            ).unwrap()
          })
      })
      .catch(() => {})
    setSubmitting(false)
  }

  return (
    <div className='min-h-screen'>
      <div className='w-full mx-auto'>
        <div className='flex items-center gap-3 border-b pb-3'>
          <h2 className='text-lg font-semibold text-gray-900'>Comments</h2>
        </div>

        <div className='relative mt-6'>
          <div className='absolute left-4 top-3 bottom-0 w-px border-l-2 border-dashed border-gray-300' />
          <div className='relative pl-9'>
            <span className='absolute left-2.5 top-2 h-3.5 w-3.5 rounded-full bg-white border-2 border-primaryColor' />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Leave a comment here'
              className='w-full rounded-lg border border-gray-300 bg-white p-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400'
              rows={3}
            />
            <button
              onClick={onAddComment}
              disabled={submitting || !text.trim()}
              className='flex items-center mt-2 space-x-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm'
              style={{
                background: getColorPalette().primaryColor,
                border: `1px solid ${getColorPalette().primaryColor}`,
              }}
            >
              {submitting ? 'Adding…' : 'Add comment'}
            </button>
          </div>

          <div className='mt-6 space-y-6'>
            {reversedComments.map((c: any) => (
              <CommentItem
                key={c.comment_id ?? `${c.created_at}-${c.display_name}`}
                createdAt={c.created_at}
                displayName={c.display_name}
                roleLabel={''}
                remark={c.remark || c.notes}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comments

function CommentItem({
  createdAt,
  displayName,
  roleLabel,
  remark,
}: {
  createdAt?: string
  displayName?: string
  roleLabel?: string
  remark?: string
}) {
  return (
    <div className='relative pl-9'>
      <span className='absolute left-2 top-2 h-3.5 w-3.5 rounded-full bg-white border-2 border-primaryColor' />
      <div className='text-xs text-gray-500'>
        {' '}
        {moment(createdAt).format('DD-MMM-YYYY, hh:mm A')}
      </div>
      <div className='mt-1 whitespace-pre-wrap text-sm text-gray-900'>
        <span className='font-semibold'>{displayName || ''}</span>
        {roleLabel ? (
          <span className='ml-1 align-middle text-xs text-gray-500'>{roleLabel}</span>
        ) : null}
        <div className='mt-1 text-gray-700'>{remark || '-'}</div>
      </div>
    </div>
  )
}
