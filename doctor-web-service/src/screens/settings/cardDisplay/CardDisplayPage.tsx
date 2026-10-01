import React, {useContext, useEffect} from 'react'
import {Switch, Tooltip} from 'antd'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getCardConfiguration,
  updateCardConfiguration,
} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import getColorPalette from 'utils/getColorPalette'

export type CardConfigurationField = {
  config_id: number
  display_type: 'TEXT' | 'BADGE'
  enabled: boolean
  field_key: string
  id: number
  label: string
  position: number
  sample_value: string
  show_in_preview: boolean
}

const ALWAYS_ON_KEY = 'patient_name'
const HIDDEN_KEYS = ['follow_up_date'] // ⬅️ exclude this from UI entirely

const isAlwaysOn = (f: CardConfigurationField) => f.field_key === ALWAYS_ON_KEY
const isHidden = (f: CardConfigurationField) => HIDDEN_KEYS.includes(f.field_key)
const effectiveEnabled = (f: CardConfigurationField) => (isAlwaysOn(f) ? true : f.enabled)

const formatSampleValue = (field: CardConfigurationField) => {
  if (!field.sample_value) return field.sample_value

  if (field.field_key === 'created_on') {
    const parts = field.sample_value.split('-')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const normalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
      return `${day}-${normalizedMonth}-${year}`
    }
  }

  return field.sample_value
}

const CardDisplayPage: React.FC = () => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {cardConfiguration, loadingCardConfiguration} = useSelector(
    (state: RootState) => state.workFlow
  )

  useEffect(() => {
    getCardCardConfig()
  }, [])

  const getCardCardConfig = () => {
    dispatchAction(getCardConfiguration({profileId: safeParseInt(profileId)}))
  }

  const toggle = (field: CardConfigurationField) => {
    if (isAlwaysOn(field) || isHidden(field)) return // 🚫 block toggle for hidden/always-on
    dispatchAction(updateCardConfiguration({...field, enabled: !field.enabled}))
      .unwrap()
      .then(() => {
        getCardCardConfig()
      })
  }

  // Hide "Follow-up Date" from count as well
  const visibleFields = cardConfiguration.filter((f) => !isHidden(f))
  const enabledCount = visibleFields.filter((f) => effectiveEnabled(f)).length

  return (
    <Page loading={loadingCardConfiguration}>
      <h2 className='text-xl font-semibold'>Card Display Settings</h2>
      <p className='text-gray-600 mt-2'>
        Choose what information is visible on each case card in the kanban view. You can enable or
        disable fields to control how much detail user sees while managing cases. Changes apply
        globally for workspaces.
      </p>

      <div className='mt-6 grid lg:grid-cols-2 gap-6'>
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold'>Field Configuration</h3>
            <div className='text-sm text-gray-600'>
              {enabledCount} of {visibleFields.length} enabled
            </div>
          </div>

          <div className='space-y-2'>
            {(() => {
              const configOrder = [
                'patient_name',
                'gender',
                'age',
                'patient_id',
                'created_by',
                'created_on',
                'product',
                'case_type',
                'assignee',
              ]

              return visibleFields
                .slice()
                .sort((a, b) => {
                  const indexA = configOrder.indexOf(a.field_key)
                  const indexB = configOrder.indexOf(b.field_key)
                  if (indexA === -1 && indexB === -1) return a.position - b.position
                  if (indexA === -1) return 1
                  if (indexB === -1) return -1
                  return indexA - indexB
                })
                .map((f, idx) => {
                  const on = effectiveEnabled(f)
                  return (
                    <div
                      key={`field-${f.id}-${idx}`}
                      className={`p-3 border rounded bg-white flex items-center justify-between ${
                        on ? '' : 'opacity-60'
                      }`}
                    >
                      <div>
                        <div className='font-medium'>
                          {f.label}
                          {isAlwaysOn(f)}
                        </div>
                      </div>

                      <div className='flex items-center space-x-3'>
                        {isAlwaysOn(f) ? (
                          <Tooltip title='Patient name is required and cannot be turned off'>
                            <span>
                              <Switch checked={true} disabled />
                            </span>
                          </Tooltip>
                        ) : (
                          <Switch checked={on} onChange={() => toggle(f)} />
                        )}
                      </div>
                    </div>
                  )
                })
            })()}
          </div>
        </div>

        <div>
          <h3 className='font-semibold mb-3'>Card Preview</h3>
          <BorderedCard>
            {/* Header: patient name (always on) */}
            <div className='font-semibold text-gray-900 text-lg'>
              {cardConfiguration.find((f) => f.field_key === 'patient_name' && effectiveEnabled(f))
                ?.sample_value || 'Sample Name'}
            </div>

            <div className='grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700'>
              {(() => {
                const previewOrder = [
                  'gender',
                  'age',
                  'patient_id',
                  'created_by',
                  'created_on',
                  'product',
                  'case_type',
                  'customer_name',
                  'assignee',
                ]

                return cardConfiguration
                  .filter(
                    (f) => effectiveEnabled(f) && !isHidden(f) && f.field_key !== 'patient_name'
                  )
                  .sort((a, b) => {
                    const indexA = previewOrder.indexOf(a.field_key)
                    const indexB = previewOrder.indexOf(b.field_key)
                    if (indexA === -1 && indexB === -1) return a.position - b.position
                    if (indexA === -1) return 1
                    if (indexB === -1) return -1
                    return indexA - indexB
                  })
                  .map((f, idx) => {
                    const pal = getColorPalette()
                    const displayValue = formatSampleValue(f) || '-'
                    return (
                      <React.Fragment key={`row-${f.id}-${idx}`}>
                        <div className='text-gray-500'>{f.label}:</div>
                        <div className='font-medium'>
                          {f.display_type === 'BADGE' ? (
                            <span
                              className='inline-block text-xs px-3 py-1 rounded-full'
                              style={{backgroundColor: pal.lighterGray, color: pal.neutralBlack}}
                            >
                              {displayValue || '—'}
                            </span>
                          ) : (
                            <span>{displayValue}</span>
                          )}
                        </div>
                      </React.Fragment>
                    )
                  })
              })()}
            </div>
          </BorderedCard>
        </div>
      </div>
    </Page>
  )
}

export default CardDisplayPage
