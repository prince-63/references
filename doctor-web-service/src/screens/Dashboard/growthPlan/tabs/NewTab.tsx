import React from 'react'
import {useNavigate} from 'react-router-dom'
import Section from '../components/Section'
import StatusPill from '../components/StatusPill'
import TabMetricItem from '../components/TabMetricItem'
import AssigneeItem from '../components/AssigneeItem'
import getColorPalette from 'utils/getColorPalette'
import {KanbanDetailItem} from '../types'

const NewTab = ({
  newCaseTotal,
  kanbanByName,
  hideZero,
  isPracticeView,
  growth,
}: {
  newCaseTotal: number
  kanbanByName: Map<string, KanbanDetailItem>
  hideZero: boolean
  isPracticeView: boolean
  growth: any
}) => {
  const navigate = useNavigate()
  const pal = getColorPalette()
  return (
    <Section
      title={
        <>
          <span>NEW CASE OPERATIONS</span>
          <StatusPill count={newCaseTotal} tone='info' />
        </>
      }
    >
      {newCaseTotal === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 py-10 text-center'>
          <div className='text-base font-medium' style={{color: pal.neutralBlack}}>
            No cases at the moment
          </div>
          <button
            className='rounded-md px-4 py-2 text-sm font-semibold'
            style={{backgroundColor: pal.primaryColor, color: '#fff'}}
            onClick={() => navigate('/aligner-orders?workFlow=new-case')}
          >
            + Add a case
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${
            isPracticeView ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
          } gap-4`}
        >
          <div className='lg:col-span-2 flex flex-col gap-3'>
            <div className='rounded-lg border border-lighterGray bg-white p-3 md:p-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                {kanbanByName
                  .get('NEW CASE')
                  ?.status_labels.filter((s) => !hideZero || s.count > 0)
                  .map((s) => (
                    <TabMetricItem
                      key={s.label_name}
                      label={String(s.label_name)}
                      count={s.count}
                      tone={'info'}
                      onClick={() =>
                        navigate(
                          `/aligner-orders?workFlow=new-case&status=${encodeURIComponent(
                            s.label_name
                          )}`
                        )
                      }
                    />
                  ))}
              </div>
            </div>
          </div>
          {!isPracticeView && (
            <div className='flex flex-col gap-3'>
              <h4 className='text-base font-semibold'>Assignee Distribution</h4>
              <div className='max-h-[320px] overflow-y-auto pr-1'>
                {growth?.new_case_assignee_distribution?.map((m: any, i: number) => (
                  <AssigneeItem key={m.user_name + i} m={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

export default NewTab
