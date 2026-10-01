/* cspell:ignore whie */

import {useContext, useEffect, useState} from 'react'
import {Plus, MoreVertical} from 'lucide-react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {addNotes, getNotes, updateNotes} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {AuthContext} from 'context/AuthContext'
import ModalDeleteNote from '../components/ModalDeleteNote'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import getColorPalette from 'utils/getColorPalette'
import dayjs from 'dayjs'
import {Dropdown} from 'antd'
import type {MenuProps} from 'antd'
import PencilIcon from 'assets/icons/PencilIcon'
import TrashOutline from 'assets/icons/TrashOutline'
import cn from '@utils/cn'
import EmptyDataCard from 'components/atom/EmptyState/EmptyDataCard'

const AddNoteModal = ({isModalVisible, onClose, editingNote}: any) => {
  const [text, setText] = useState('')
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const profileIdNumber =
    profileId !== null && profileId !== undefined && !isNaN(Number(profileId))
      ? Number(profileId)
      : null

  useEffect(() => {
    if (isModalVisible) {
      const noteText = editingNote?.text || ''
      setText(noteText)
    } else {
      // Clear text when modal closes
      setText('')
    }
  }, [isModalVisible, editingNote])

  const handleSave = () => {
    if (text.trim()) {
      if (profileId === null || isNaN(Number(profileId))) {
        return
      }
      if (editingNote) {
        // Update existing note
        const payload = {
          notes: text.trim(),
          user_profile_id: Number(profileId),
          note_id: editingNote.id,
          patient_id: data?.patient_details?.id,
        }

        dispatchAction(updateNotes(payload))
          .unwrap()
          .then(() => {
            if (profileIdNumber && data?.patient_details?.id) {
              dispatchAction(
                getNotes({
                  patient_id: data.patient_details.id,
                  profile_id: profileIdNumber,
                })
              )
            }
            onClose()
          })
          .catch((error: any) => {
            console.error('Failed to update note:', error)
          })
      } else {
        // Add new note
        const payload = {
          patient_id: data?.patient_details?.id,
          notes: text.trim(),
        }
        dispatchAction(addNotes(payload))
          .unwrap()
          .then(() => {
            if (profileIdNumber && data?.patient_details?.id) {
              dispatchAction(
                getNotes({
                  patient_id: data.patient_details.id,
                  profile_id: profileIdNumber,
                })
              )
            }
            onClose()
          })
          .catch((error: any) => {
            console.error('Failed to add note:', error)
          })
      }
    }
  }

  const handleClose = () => {
    setText('')
    onClose()
  }

  if (!isModalVisible) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-96 max-w-md mx-4'>
        <h2 className='text-xl font-semibold mb-4'>{editingNote ? 'Edit Note' : 'Add New Note'}</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              placeholder='Write your note here...'
            />
          </div>
        </div>
        <div className='flex justify-end space-x-3 mt-6'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            {editingNote ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const Notes = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const profileIdNumber =
    profileId !== null && profileId !== undefined && !isNaN(Number(profileId))
      ? Number(profileId)
      : null

  const notes = useSelector((state: RootState) =>
    state.calendar.notes.map((n: any) => ({
      id: n.note_id,
      text: n.notes,
      addedBy: n.added_by_user_name,
      patientId: n.patient_id,
      updatedAt:
        n.updated_at ||
        n.updatedAt ||
        n.last_updated_at ||
        n.last_updated_on ||
        n.updated_on ||
        null,
      createdAt: n.created_at || n.createdAt || n.created_on || null,
    }))
  )
  const palette = getColorPalette()

  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  // Add state for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<{id: number; patientId: number} | null>(null)
  const {permissionChecks} = useFeatureAccess()
  const notesAddAccess = permissionChecks?.patientProfileActions?.internalNotesTab
  const canAddNote = notesAddAccess?.isAddable ?? false
  const canEditNote = notesAddAccess?.isEditable ?? false
  const canDeleteNote = notesAddAccess?.isDeletable ?? false

  useEffect(() => {
    if (data?.patient_details?.id && profileIdNumber) {
      dispatchAction(getNotes({patient_id: data.patient_details.id, profile_id: profileIdNumber}))
    }
  }, [data?.patient_details?.id, profileIdNumber])

  const handleEditNote = (note: any) => {
    setEditingNote(note)
    setIsAddNoteModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsAddNoteModalVisible(false)
    setEditingNote(null)
  }

  const handleAddNewNote = () => {
    if (!canAddNote) return
    setEditingNote(null) // Clear editing note for new note creation
    setIsAddNoteModalVisible(true)
  }

  const handleDeleteNote = (note: any) => {
    setNoteToDelete({
      id: note.id,
      patientId: note.patientId,
    })
    setIsDeleteModalOpen(true)
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setNoteToDelete(null)
    // Refresh notes list
    if (data?.patient_details?.id && profileIdNumber) {
      dispatchAction(getNotes({patient_id: data.patient_details.id, profile_id: profileIdNumber}))
    }
  }

  return (
    <div className='min-h-screen'>
      <div className='w-full mx-auto'>
        <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4'>
          <div className='text-lg font-semibold '>Internal Notes</div>
          {canAddNote && (
            <button
              type='button'
              onClick={handleAddNewNote}
              style={{
                background: palette.primaryColor,
                border: `1px solid ${palette.primaryColor}`,
                color: palette.white,
              }}
              className='flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-sm transition-opacity hover:opacity-90'
            >
              <Plus size={20} />
              <span className='text-sm'>Add Note</span>
            </button>
          )}
        </div>

        {notes.length === 0 ? (
          <EmptyDataCard emptyText='No notes yet' />
        ) : (
          <div className='space-y-4'>
            {notes.map((note: any) => {
              const rawTimestamp = note.updatedAt || note.createdAt
              const formattedUpdatedAt =
                rawTimestamp && dayjs(rawTimestamp).isValid()
                  ? dayjs(rawTimestamp).format('DD-MMM-YYYY, hh:mm A')
                  : null
              const showActions = true
              const showActionColumn = true

              return (
                <div key={note.id} className='rounded-lg border border-mediumGray p-4'>
                  <div className='flex flex-col gap-3 justify-between md:flex-row items-start'>
                    <div>
                      <p className='whitespace-pre-wrap leading-relaxed text-base '>{note.text}</p>
                      <p className='text-xs text-textColor mt-4'>
                        {`Last updated: ${formattedUpdatedAt ?? '-'}. By: ${note.addedBy ?? '-'}`}{' '}
                      </p>
                    </div>
                    {showActionColumn && (
                      <div className='flex gap-2 flex-col items-start w-full md:w-auto'>
                        {showActions && (
                          <div>
                            {(() => {
                              const actionItems: MenuProps['items'] = []

                              if (canEditNote) {
                                actionItems.push({
                                  key: 'edit',
                                  label: (
                                    <div className='flex items-center gap-2 text-gray-800'>
                                      <PencilIcon />
                                      <span>Edit</span>
                                    </div>
                                  ),
                                })
                              }

                              if (canDeleteNote) {
                                actionItems.push({
                                  key: 'delete',
                                  label: (
                                    <div className='flex items-center gap-2 text-red'>
                                      <TrashOutline height='20' width='20' />
                                      <span className='text-red'>Delete</span>
                                    </div>
                                  ),
                                })
                              }

                              if (!actionItems.length) return null

                              const handleMenuClick: MenuProps['onClick'] = ({key}) => {
                                switch (key) {
                                  case 'edit':
                                    handleEditNote(note)
                                    break
                                  case 'delete':
                                    handleDeleteNote(note)
                                    break
                                  default:
                                    break
                                }
                              }

                              return (
                                <Dropdown
                                  menu={{items: actionItems, onClick: handleMenuClick}}
                                  trigger={['click']}
                                  placement='bottomRight'
                                >
                                  <button
                                    type='button'
                                    onClick={(event) => {
                                      event.stopPropagation()
                                    }}
                                    className={cn(
                                      'p-2 hover:!bg-primarySupport  flex-end border border-mediumGray rounded-lg'
                                    )}
                                  >
                                    <MoreVertical
                                      color={getColorPalette().textColor}
                                      className='w-5 h-5'
                                    />
                                  </button>
                                </Dropdown>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <AddNoteModal
          isModalVisible={isAddNoteModalVisible}
          onClose={handleCloseModal}
          editingNote={editingNote}
        />

        {/* Add Delete Modal */}
        {isDeleteModalOpen && noteToDelete && (
          <ModalDeleteNote
            noteId={noteToDelete.id}
            patientId={noteToDelete.patientId}
            setIsModalOpen={setIsDeleteModalOpen}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  )
}
