import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const AlignerProductionCounts = ({
  filter,
  handleGlobalStatus,
}: {
  filter: string | null
  handleGlobalStatus: (x: string | null) => void
}) => {
  const {countsStatusData, statusMeta} = useSelector((state: RootState) => state.alignerProduction)

  let merged: Array<{
    label_name: string
    count: number
    color?: string
    position?: number
  }>

  if (Array.isArray(statusMeta) && statusMeta.length > 0) {
    const countMap = new Map<string, number>()
    ;(countsStatusData || []).forEach((c) => {
      const key = (c.label_name || '').toString().trim().toLowerCase()
      countMap.set(key, c.count)
    })

    merged = statusMeta.map((st: any) => ({
      label_name: st.label_name,
      count: countMap.get(st.label_name?.toString().trim().toLowerCase()) ?? 0,
      color: st.color,
      position: st.position,
    }))
  } else {
    merged = (countsStatusData || []) as any
  }

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
      {merged &&
        merged.map((data: any, idx: number) => {
          const isActive = (data.label_name ?? '').toLowerCase() === (filter ?? '').toLowerCase()

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center rounded-md p-4 shadow cursor-pointer border ${
                isActive ? 'ring-2 ring-offset-2 ring-primaryColor' : ''
              }`}
              style={{
                backgroundColor: (data.color as string) || '#4B5563',
                color: '#ffffff',
                borderColor: isActive ? 'var(--primaryColor)' : 'transparent',
              }}
              onClick={() => handleGlobalStatus(data.label_name)}
            >
              <span className='text-sm font-medium'>{data.label_name?.toUpperCase()}</span>
              <span className='text-2xl font-bold'>{data.count}</span>
            </div>
          )
        })}
    </div>
  )
}

export default AlignerProductionCounts
