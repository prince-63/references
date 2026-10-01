/* eslint-disable react/jsx-no-undef */
import React from 'react'
const SortableContext: React.FC<any> = ({children}) => <>{children}</>
const verticalListSortingStrategy = () => null
import {Task} from '../types'
import {useNavigate} from 'react-router-dom'

type SectionItemProps = {
  id: string
  items?: string[]
  name?: string
  data?: Task[]
  isSortingContainer?: boolean
  dragOverlay?: boolean
  count?: number
  totalCount?: number
  color?: string
}

export const SectionItem: React.FC<SectionItemProps> = (props) => {
  const {id, items = [], name, data = [], isSortingContainer, dragOverlay} = props
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transition,
    transform,
  } = useSortable({
    id: id,
    data: {
      type: 'SECTION',
    },
  })

  const getColumnHeight = () => {
    const el = document.getElementsByClassName('kanban-column')[0] as HTMLElement | undefined
    const h = el ? el.clientHeight : 400
    return h
  }

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${(transform as any).x || 0}px, ${(transform as any).y || 0}px, 0)`
      : undefined,
    height: dragOverlay ? `${getColumnHeight() + 'px'}` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: dragOverlay
      ? '0 0 0 calc(1px / 1) rgba(63, 63, 68, 0.05), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
      : '',
    border: dragOverlay ? '1px solid rgba(64, 150, 255, 1)' : '1px solid #dcdcdc',
    touchAction:
      'ontouchstart' in window ||
      (('maxTouchPoints' in navigator && (navigator as any).maxTouchPoints > 0) as boolean) ||
      (('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0) as boolean)
        ? 'manipulation'
        : 'none',
  }

  return (
    <div ref={setNodeRef} className='kanban-column' style={style}>
      <div
        ref={setActivatorNodeRef}
        {...(attributes || {})}
        {...(listeners || {})}
        className='kanban-column-header'
        style={{
          cursor: dragOverlay ? 'grabbing' : 'grab',
          justifyContent: 'space-between',
          display: 'flex',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{width: 10, height: 10, borderRadius: 2}} />
          <div style={{fontSize: 12, color: 'var(--text-color, #666)', fontWeight: 600}}>
            {name}
          </div>
          <div style={{fontSize: 11, color: 'var(--text-color, #666)'}}>
            <span
              style={{
                background: 'transparent',
                padding: '2px 6px',
                borderRadius: 6,
                color: 'var(--text-color, #666)',
              }}
            >
              {props.count ?? 0}
            </span>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{fontSize: 11, color: 'var(--text-color, #999)'}}>{props.count}</div>
        </div>
      </div>
      <div className='kanban-column-list'>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {(items || []).map((item) => {
            return (
              <FieldItem
                id={item}
                key={item}
                item={data.find((d) => 'task-' + d.id === item)}
                disabled={isSortingContainer}
              />
            )
          })}
        </SortableContext>
      </div>
    </div>
  )
}

type FieldItemProps = {
  id: string
  item?: Task
  dragOverlay?: boolean
  disabled?: boolean
}

export const FieldItem: React.FC<FieldItemProps> = (props) => {
  const {id, item, dragOverlay} = props
  const safeItem: Task = item || ({} as Task)
  const {setNodeRef, listeners, isDragging, transform, transition, attributes} = useSortable({
    id: id,
    disabled: props.disabled,
    data: {
      type: 'FIELD',
    },
  })
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${(transform as any).x || 0}px, ${(transform as any).y || 0}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: dragOverlay
      ? '0 0 0 calc(1px / 1) rgba(63, 63, 68, 0.05), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
      : '',
    border: dragOverlay ? '1px solid rgba(64, 150, 255, 1)' : '1px solid #dcdcdc',
    cursor: dragOverlay ? 'grabbing' : 'grab',
    touchAction:
      typeof window.PointerEvent !== 'undefined' ||
      'ontouchstart' in window ||
      (('maxTouchPoints' in navigator && (navigator as any).maxTouchPoints > 0) as boolean) ||
      (('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0) as boolean)
        ? 'manipulation'
        : 'none',
  }
  const {permissionChecks} = useFeatureAccess()
  const practiceLocationPermissions =
    permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable

  try {
    return (
      <div
        ref={props.disabled ? null : setNodeRef}
        className='card'
        style={style}
        {...(attributes || {})}
        {...(listeners || {})}
        onDoubleClick={() => {
          item && navigate(profileBasePath + '/' + item.patient_id)
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--primary-support, #f5f4fe)',
            borderRadius: 8,
            padding: 12,
            border: '1px solid var(--light-gray, #efefef)',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{flex: 1, minWidth: 0}}>
              <div
                style={{
                  fontWeight: 600,
                  color: 'var(--neutral-black, #1d1f2c)',
                  fontSize: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {safeItem?.workflow_name ?? safeItem?.patient_name ?? ''}
              </div>
              <div style={{marginTop: 8}}>
                <div className='kanban-card-date' title={safeItem?.follow_up_date || ''}>
                  <span style={{marginRight: 6}}>⚠</span>
                  {safeItem?.follow_up_date || '—'}
                </div>
                <div style={{fontSize: 13, color: 'var(--text-color, #666666)', marginTop: 8}}>
                  {safeItem?.patient_name ?? ''}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8}}>
              <div className='kanban-card-chip'>
                {safeItem?.sequence_number
                  ? `#${safeItem.sequence_number}`
                  : `DD-${safeItem?.id ?? '-'}`}
              </div>
              <div className='kanban-avatar'>
                {safeItem?.assignee
                  ? safeItem.assignee
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'SK'}
              </div>
            </div>
          </div>
          <TextValuePair
            label='Patient ID'
            value={safeItem?.customer_mapped_id as any}
            type={'TEXT'}
          />
          <TextValuePair label='Created By:' value={safeItem?.created_by} type={'TEXT'} />
          <TextValuePair label='Created On:' value={safeItem?.created_on} type={'TEXT'} />
          <TextValuePair label='Product:' value={safeItem?.product} type={'BADGE'} />
          <TextValuePair label='Follow-up Date:' value={safeItem?.follow_up_date} type={'TEXT'} />
          <TextValuePair
            label='Case Type:'
            value={(safeItem?.case_type === 'NEW_CASE' ? 'NEW CASE' : safeItem?.case_type) as any}
            type={'BADGE'}
          />
          {practiceLocationPermissions && (
            <TextValuePair label='Clinic:' value={safeItem?.clinic} type={'TEXT'} />
          )}
        </div>
      </div>
    )
  } catch (err) {
    // Log useful debug info to the console to help diagnose the issue without crashing the whole app
    // eslint-disable-next-line no-console
    console.error('FieldItem render error', {
      error: err,
      id,
      disabled: props.disabled,
      item: safeItem,
      transform,
      attributes,
      listeners,
    })

    return (
      <div
        className='card'
        style={{
          padding: 12,
          border: '1px solid var(--red, #f45045)',
          background: 'var(--white, #fff)',
        }}
      >
        <strong>Error loading task</strong>
      </div>
    )
  }
}

import getColorPalette from 'utils/getColorPalette'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const TextValuePair: React.FC<{label: string; value: string | number; type: 'BADGE' | 'TEXT'}> = ({
  label,
  value,
  type,
}) => {
  const pal = getColorPalette()
  return (
    <div style={{marginTop: 6}}>
      <div style={{color: 'var(--text-color, #666666)', fontSize: 12}}>{label}:</div>
      <div style={{fontWeight: 500, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8}}>
        {type === 'BADGE' ? (
          <span
            style={{
              display: 'inline-block',
              backgroundColor: pal.lighterGray,
              color: pal.neutralBlack,
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 9999,
            }}
          >
            {value || '—'}
          </span>
        ) : (
          <>
            <span
              style={{
                width: 18,
                height: 18,
                background: 'var(--secondary-color,#0095ff)',
                display: 'inline-block',
                borderRadius: 4,
              }}
            />
            <span style={{fontSize: 13}}>{value || '-'}</span>
          </>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useSortable(options: {id: string; data: {type: string}; disabled?: boolean}): {
  attributes: any
  isDragging: any
  listeners: any
  setNodeRef: any
  setActivatorNodeRef: any
  transition: any
  transform: any
} {
  throw new Error('Function not implemented.')
}
