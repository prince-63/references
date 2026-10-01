import {Info, Layers} from 'lucide-react'
import {useCallback, useMemo, useState} from 'react'
import SectionCard from './SectionCard'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  resetManufacturingData,
  setManufacturingData,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {generateAlignerOptions, safeParseInt} from 'utils/ConstFunctions'
import {ConfigProvider, Divider, Select, Spin} from 'antd'
import {
  AlignerSummary,
  DeliveryType,
  getAlignerRangeDetails,
  SelectBatch,
} from 'screens/Patients/LeadsProfile/main/overview/components/StartManufacturingModal'
import {useParams} from 'react-router-dom'
import cn from '@utils/cn'
import Spinner from 'components/spinner/Spinner'
import manufacturingConstants from '@constants/manufacturing.constants'

function getTotal({
  upperStart,
  upperEnd,
  lowerStart,
  lowerEnd,
}: {
  upperStart: number | null | undefined
  upperEnd: number | null | undefined
  lowerStart: number | null | undefined
  lowerEnd: number | null | undefined
}) {
  const count = (start?: number | null, end?: number | null) => {
    const s = Number(start)
    const e = Number(end)
    if (!Number.isFinite(s) || !Number.isFinite(e)) return 0
    if (s <= 0 || e <= 0 || e < s) return 0
    return e - s + 1
  }

  const upper = count(upperStart, upperEnd)
  const lower = count(lowerStart, lowerEnd)

  return upper + lower
}

const ManufacturingSetup = ({
  setManufacturingForAll = () => {},
}: {
  setManufacturingForAll?: (value: boolean) => void
}) => {
  const {treatmentId} = useParams()
  const {dispatchAction} = useDispatchAction()

  const {manufacturingData} = useSelector((state: RootState) => state.productionSetup)
  const {latest_manufacturing_data, unprocessed, alignerListForUpdate, loading} =
    useManufacturingDetails({
      treatment_plan_id: safeParseInt(treatmentId) ?? undefined,
      getFreshData: true,
    })
  const [delivery, setDelivery] = useState<DeliveryType>('IN_BATCHES')
  const alignerList = useMemo(() => {
    const isManufacturingStarted =
      latest_manufacturing_data?.status === 'MANUFACTURING_STARTED' &&
      latest_manufacturing_data?.manufacturing_batch_id

    const source = isManufacturingStarted ? alignerListForUpdate : unprocessed

    return generateAlignerOptions(
      source?.lowerJaw?.start,
      source?.lowerJaw?.end,
      source?.upperJaw?.start,
      source?.upperJaw?.end
    )
  }, [latest_manufacturing_data, alignerListForUpdate, unprocessed])

  const isNextBatch = latest_manufacturing_data?.status === manufacturingConstants.DELIVERED

  const totalAligners = unprocessed?.total_aligners ?? 0

  const handleDeliveryChange = useCallback(
    (val: DeliveryType) => {
      if (val === 'IN_BATCHES') {
        setManufacturingForAll(false)
      }
      if (val === 'ALL_ALIGNERS') {
        setManufacturingForAll(true)
      }
      if (totalAligners === 0) return
      if (val === 'IN_BATCHES' && delivery === 'ALL_ALIGNERS') {
        dispatchAction(resetManufacturingData())
      }
      setDelivery(val)
    },
    [delivery, dispatchAction, totalAligners]
  )

  return (
    <Spin indicator={<Spinner loading />} spinning={loading}>
      <SectionCard
        id='aligner-batch'
        icon={<Layers className='h-5 w-5' />}
        title='Aligner Batch Options'
        subtitle='Define aligners to start manufacturing'
      >
        <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600'>
          <Info className='mr-2 inline h-4 w-4' /> Batches let you stage treatment and check patient
          tracking before producing later stages.
        </div>
        {/* Local state based implementation */}
        <div className='flex flex-col gap-4 p-5'>
          <SelectBatch
            title='Define series'
            subtitle='Manually issued to patient for each batch.'
            value='IN_BATCHES'
            selected={delivery === 'IN_BATCHES'}
            onSelect={handleDeliveryChange}
          >
            <div className='flex flex-col gap-4'>
              <Divider className='p-0 m-0' />
              <div>
                <div className='text-textColor font-medium text-base mb-2'>Stages</div>
                <div className='flex gap-2'>
                  <PlainSelect
                    label='From'
                    options={alignerList}
                    disabled
                    value={alignerList[0]?.value || 0}
                  />
                  <PlainSelect
                    label='To'
                    options={alignerList}
                    value={manufacturingData.upper_end ?? 0}
                    onChange={(v: any) => {
                      const fromStage = alignerList[0]
                      const toStage =
                        delivery === 'ALL_ALIGNERS'
                          ? alignerList[alignerList.length - 1]
                          : alignerList.find((stage) => stage.value === v)
                      const alignerSet = getAlignerRangeDetails(fromStage, toStage, alignerList)
                      dispatchAction(
                        setManufacturingData({
                          batchType: delivery,
                          total: alignerSet.total_aligners,
                          upper_start: alignerSet.upper_aligner_start || null,
                          upper_end: alignerSet.upper_aligner_end || null,
                          lower_start: alignerSet.lower_aligner_start || null,
                          lower_end: alignerSet.lower_aligner_end || null,
                        })
                      )
                    }}
                  />
                </div>
              </div>
              <Divider className='p-0 m-0' />
              <AlignerSummary
                upperTotal={getTotal({
                  upperStart: manufacturingData.upper_start,
                  upperEnd: manufacturingData.upper_end,
                  lowerStart: null,
                  lowerEnd: null,
                })}
                lowerTotal={getTotal({
                  upperStart: null,
                  upperEnd: null,
                  lowerStart: manufacturingData.lower_start,
                  lowerEnd: manufacturingData.lower_end,
                })}
                definedSeries={{
                  upper_aligner_start: manufacturingData.upper_start || 0,
                  upper_aligner_end: manufacturingData.upper_end || 0,
                  lower_aligner_start: manufacturingData.lower_start || 0,
                  lower_aligner_end: manufacturingData.lower_end || 0,
                  total_aligners: manufacturingData.total || 0,
                }}
              />
            </div>
          </SelectBatch>

          {!isNextBatch && (
            <SelectBatch
              title='Send All Aligners'
              subtitle='All aligners delivered at once.'
              value='ALL_ALIGNERS'
              selected={delivery === 'ALL_ALIGNERS'}
              onSelect={() => {
                setDelivery('ALL_ALIGNERS')
                const fromStage = alignerList[0]
                const toStage = alignerList[alignerList.length - 1]
                const alignerSet = getAlignerRangeDetails(fromStage, toStage, alignerList)
                dispatchAction(
                  setManufacturingData({
                    batchType: 'ALL_ALIGNERS',
                    total: alignerSet.total_aligners,
                    upper_start: alignerSet.upper_aligner_start || null,
                    upper_end: alignerSet.upper_aligner_end || null,
                    lower_start: alignerSet.lower_aligner_start || null,
                    lower_end: alignerSet.lower_aligner_end || null,
                  })
                )
                setManufacturingForAll(true)
              }}
            />
          )}
        </div>
      </SectionCard>
    </Spin>
  )
}

export default ManufacturingSetup

type PlainSelectProps = {
  label: string
  disabled?: boolean
  required?: boolean
  options: {label: string; value: number | string}[]
  value: number | string | null | undefined
  onChange?: (value: number | string | null | undefined) => void
}

const PlainSelect: React.FC<PlainSelectProps> = ({
  label,
  disabled,
  required,
  options,
  value,
  onChange,
}) => {
  // value here is expected to be raw (not Formik field). Convert to labelInValue

  return (
    <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
      <div className='w-full'>
        {label && (
          <label className='block text-base font-medium text-textColor mb-1'>
            {label}
            {required && <span className='text-red ml-1'>*</span>}
          </label>
        )}
        <Select
          labelInValue
          className={cn('w-full h-12')}
          options={options}
          value={
            value
              ? {label: options.find((opt) => opt.value === value)?.label || '', value}
              : undefined
          }
          onChange={(val) => onChange?.(val.value)}
          disabled={disabled}
        />
      </div>
    </ConfigProvider>
  )
}
