import {Formik, Form, FormikHelpers} from 'formik'
import dayjs from 'dayjs'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import SectionCard from '../components/SectionCard'
import PencilIcon from 'assets/icons/PencilIcon'
import TrashOutline from 'assets/icons/TrashOutline'
import {ChevronDown, Info} from 'lucide-react'

export type InternalNoteFormValues = {
  internalNote: string
}

export type InternalNoteItem = {
  id: number
  text: string
  addedBy?: string
  patientId?: number
  updatedAt?: string | null
  createdAt?: string | null
}

type InternalNotesSectionProps = {
  className?: string
  notes: InternalNoteItem[]
  notesLoading: boolean
  canAddNote: boolean
  canEditNote: boolean
  canDeleteNote: boolean
  editingNote: InternalNoteItem | null
  initialValues: InternalNoteFormValues
  onSubmit: (values: InternalNoteFormValues, helpers: FormikHelpers<InternalNoteFormValues>) => void
  onEditNote: (note: InternalNoteItem) => void
  onDeleteNote: (note: {id: number; patientId?: number}) => void
  onCancelEdit: () => void
  disableSubmit?: boolean
}

const InternalNotesSection = ({
  className,
  notes,
  notesLoading,
  canAddNote,
  canEditNote,
  canDeleteNote,
  editingNote,
  initialValues,
  onSubmit,
  onEditNote,
  onDeleteNote,
  onCancelEdit,
  disableSubmit = false,
}: InternalNotesSectionProps) => {
  return (
    <SectionCard className={className}>
      <div className='flex items-center justify-between shrink-0 pb-3'>
        <div className='flex items-center gap-2'>
          <Info size={18} className='text-primaryColor' />
          <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wide'>Internal</h3>
        </div>
        <ChevronDown size={18} className='text-gray-400' />
      </div>
      <div className='rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700'>
        These notes are strictly for the lab team and are completely hidden from the customer.
      </div>
      <div className='flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-3'>
        {notesLoading ? (
          <p className='text-sm text-gray-500'>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className='text-sm text-gray-500'>No internal notes yet.</p>
        ) : (
          notes.map((note) => {
            const rawTimestamp = note.updatedAt || note.createdAt
            const formattedUpdatedAt =
              rawTimestamp && dayjs(rawTimestamp).isValid()
                ? dayjs(rawTimestamp).format('DD-MMM-YYYY, hh:mm A')
                : null

            return (
              <div
                key={note.id}
                className='rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs font-semibold text-amber-700'>
                      {note.addedBy || 'Unknown user'}
                    </p>
                    <p className='text-[11px] text-amber-600'>{formattedUpdatedAt ?? '-'}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {canEditNote ? (
                      <button
                        type='button'
                        onClick={() => onEditNote(note)}
                        className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-700 transition hover:bg-amber-100'
                        aria-label='Edit note'
                      >
                        <PencilIcon width='16' height='16' color='#B45309' />
                      </button>
                    ) : null}
                    {canDeleteNote ? (
                      <button
                        type='button'
                        onClick={() => onDeleteNote(note)}
                        className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-white text-red transition hover:bg-red-50'
                        aria-label='Delete note'
                      >
                        <TrashOutline height='16' width='16' />
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className='mt-2 whitespace-pre-wrap text-sm text-slate-700'>{note.text}</p>
              </div>
            )
          })
        )}
      </div>
      {canAddNote || canEditNote ? (
        <Formik initialValues={initialValues} enableReinitialize onSubmit={onSubmit}>
          {(formik) => {
            const isSubmitDisabled =
              !formik.values.internalNote.trim() || notesLoading || disableSubmit

            return (
              <Form className='shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3'>
                <FormikInputTextArea
                  name='internalNote'
                  placeholder='Type an internal note...'
                  rows={4}
                  className='min-h-[120px] !border-amber-200 !bg-amber-50'
                />
                <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700'>
                    Visible to internal team only.
                  </p>
                  <div className='flex items-center gap-2'>
                    {editingNote ? (
                      <button
                        type='button'
                        onClick={() => {
                          onCancelEdit()
                          formik.resetForm()
                        }}
                        className='rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100'
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      type='button'
                      onClick={() => formik.handleSubmit()}
                      disabled={isSubmitDisabled}
                      className='rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300'
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </Form>
            )
          }}
        </Formik>
      ) : (
        <p className='text-xs text-gray-400'>You do not have permission to add internal notes.</p>
      )}
    </SectionCard>
  )
}

export default InternalNotesSection
