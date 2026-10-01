import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import React from 'react'
import {SVG_RESIZE, SVG_CIRCLE_DASHED, SVG_SHAPES, SVG_CLIPBOARD_TEXT} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

interface RowProps {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  label: string
  value?: string
}

const Row: React.FC<RowProps> = ({icon, label, value}) => (
  <div className='flex flex-row items-center justify-between py-1'>
    <div className='md:w-1/2 flex items-center gap-2'>
      <BackGroundSVG svg={icon} width='20' height='20' />
      <div className='text-stone-500 text-sm font-medium leading-tight tracking-tight'>{label}</div>
    </div>
    <div
      className={`md:w-1/2 ${
        hasValue(value) ? 'text-black' : 'text-textColor'
      } text-sm font-semibold leading-tight tracking-tight text-left`}
    >
      {hasValue(value) ? value : '- -'}
    </div>
  </div>
)

interface TreatmentPlanDetailsProps {
  jawType?: string
  bracesTreatmentPlanDetail?: {
    treatment_stage_type?: string
    shape?: string
    type?: string
    material_name?: string
    material_size?: string
    note?: string
  }
}

const JawDetails: React.FC<TreatmentPlanDetailsProps> = ({jawType, bracesTreatmentPlanDetail}) => {
  const details = [
    {
      icon: SVG_CLIPBOARD_TEXT,
      label: 'Treatment stage',
      value: bracesTreatmentPlanDetail?.treatment_stage_type,
    },
    {
      icon: SVG_SHAPES,
      label: 'Material shape',
      value: bracesTreatmentPlanDetail?.shape,
    },
    {
      icon: SVG_CIRCLE_DASHED,
      label: 'Material',
      value: bracesTreatmentPlanDetail?.material_name,
    },
    {
      icon: SVG_RESIZE,
      label: 'Size of material',
      value: bracesTreatmentPlanDetail?.material_size,
    },
  ]

  const rawNote = bracesTreatmentPlanDetail?.note?.trim()
  const hasNote = hasValue(rawNote)
  const noteText = hasNote ? (rawNote as string) : 'Not Added'
  const truncatedNote =
    noteText.length > 150 ? `${noteText.substring(0, 150).trimEnd()}...` : noteText

  return (
    <div className='w-full p-4 my-2 bg-white rounded-lg border border-zinc-300 inline-flex flex-col gap-3'>
      {/* Jaw heading */}
      <div className='text-stone-500 text-sm font-medium leading-tight tracking-tight'>
        {jawType}
      </div>

      {/* Details rows */}
      <div className='flex flex-col w-full gap-1 mt-1'>
        {details.map((detail, index) => (
          <Row key={index} icon={detail.icon} label={detail.label} value={detail.value} />
        ))}
      </div>

      <div className='flex flex-col gap-1'>
        <div className='text-stone-500 text-sm font-medium'>Note</div>
        <div
          className={`${
            hasNote ? 'text-black' : 'text-textColor'
          } text-sm font-normal leading-snug break-words`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {truncatedNote}
        </div>
      </div>
    </div>
  )
}

export default JawDetails
