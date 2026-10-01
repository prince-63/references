import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Page from 'components/page/Page'
import Footer from './VSPFooter'
import dayjs from 'dayjs'
import {
  User,
  ClipboardList,
  FolderOpen,
  FileText,
  Truck,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react'
import cn from '@utils/cn'
import useDispatchAction from '@hooks/useDispatchAction'
import {updateVspOrderStatus} from 'redux/Slices/AppSlice/VSP/orders.slice'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {useNavigate} from 'react-router-dom'
import {useVspOrder} from '../hooks/useVspOrder'

/* ─────────────── Helpers ─────────────── */

const getSurgeryTypeLabel = (prescription: any): string => {
  const types: string[] = []
  if (prescription?.is_single_jaw) types.push('Single Jaw')
  if (prescription?.is_bi_jaw) types.push('Bi-Jaw')
  if (prescription?.is_undecided) types.push('Undecided')
  if (prescription?.is_genioplasty) types.push('Genioplasty')
  if (prescription?.is_others) {
    types.push('Others')
  }
  return types.length > 0 ? types.join(', ') : '—'
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return dayjs(date).format('ddd, MMM D, YYYY')
}

/* ─────────────── Section Card ─────────────── */

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => (
  <div className='rounded-2xl border border-gray-200 bg-white'>
    <div className='flex items-center gap-3 border-b border-gray-100 px-5 py-4'>
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600'>
        {icon}
      </div>
      <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
    </div>
    <div className='px-5 py-4'>{children}</div>
  </div>
)

/* ─────────────── Label / Value ─────────────── */

const LabelValue = ({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) => (
  <div className='flex flex-col gap-0.5'>
    <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>{label}</span>
    <span className={`text-sm font-medium text-gray-900 ${valueClassName ?? ''}`}>
      {value || '—'}
    </span>
  </div>
)

/* ─────────────── File Count Badge ─────────────── */

const FileBadge = ({label, count, hasFiles}: {label: string; count: number; hasFiles: boolean}) => (
  <div className='flex flex-col gap-1'>
    <span className='text-xs font-semibold text-gray-900'>{label}</span>
    {hasFiles ? (
      <span className='inline-flex items-center gap-1 text-xs font-medium text-green-600'>
        <CheckCircle2 className='h-3.5 w-3.5' />
        {count} Added
      </span>
    ) : (
      <span className='inline-flex items-center gap-1 text-xs font-medium text-gray-400'>
        <XCircle className='h-3.5 w-3.5' />
        Not added
      </span>
    )}
  </div>
)

/* ─────────────── Main Component ─────────────── */

export const ReviewAndStep = () => {
  const {vspCaseRecordDetails} = useSelector((state: RootState) => state.vspCaseRecord)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {vspOrderDetails} = useVspOrder()
  const caseRecord = vspOrderDetails?.case_records?.[0] ?? vspCaseRecordDetails
  const prescription = vspOrderDetails?.prescriptions?.[0]

  const extraoralCount = caseRecord?.extraoral_photo_files?.length ?? 0
  const intraoralPhotoCount = caseRecord?.intraoral_photo_files?.length ?? 0
  const intraoralScanCount = caseRecord?.intraoral_scan_files?.length ?? 0
  const stoneCastCount = caseRecord?.stone_cast_files?.length ?? 0
  const dicomCount = caseRecord?.dicom_files?.length ?? 0
  const RadiographsCount = caseRecord?.radio_grap_files?.length ?? 0
  const externalLinks = (caseRecord?.external_links ?? []).filter(Boolean)

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true)

      const existingOrderId = String(vspOrderDetails?.order_id ?? '').trim()

      if (existingOrderId) {
        const serviceProductId = Number(vspOrderDetails?.service_product_id)
        const patientId = Number(vspOrderDetails?.patient_id)

        if (!patientId || !serviceProductId) {
          ErrorToast('Missing patient or product information')
          return
        }

        await dispatchAction(
          updateVspOrderStatus({
            order_id: existingOrderId,
            status: 'ORDERED',
          })
        )
          .unwrap()
          .then(() => {
            const patientIdForNav = vspOrderDetails?.patient_id
            if (patientIdForNav) {
              navigate(`/vsp-profile/${patientIdForNav}/plans?orderId=${vspOrderDetails?.order_id}`)
            } else {
              navigate(-1)
            }
          })
      }

      setShowConfirmModal(false)
    } catch (error: any) {
      ErrorToast(error?.status?.message ?? error?.message ?? 'Failed to submit order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Page
      title={<p className='text-2xl font-bold text-gray-900'>Review and send</p>}
      exitConfirmPredicate={false}
      containerClassName='w-full'
      headerClassName='flex md:flex-row items-center'
    >
      <p className='text-sm text-gray-500 -mt-2 mb-6'>
        Please verify all case details before final submission.
      </p>

      <div className='mx-auto w-full space-y-5 pb-28'>
        {/* ── Patient Details ── */}
        <SectionCard icon={<User className='h-4 w-4' />} title='Patient details'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <LabelValue label='Name' value={vspOrderDetails?.patient_name} />
            <LabelValue label='Gender' value={vspOrderDetails?.gender} />
            <LabelValue label='Age' value={vspOrderDetails?.age} />
            <LabelValue
              label='Patient ID'
              value={
                vspOrderDetails?.customer_mapped_id ? (
                  <span className='text-indigo-600'>#{vspOrderDetails?.customer_mapped_id}</span>
                ) : (
                  '—'
                )
              }
            />
          </div>
        </SectionCard>

        {/* ── Order Details ── */}
        <SectionCard icon={<ClipboardList className='h-4 w-4' />} title='Order details'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <LabelValue label='Selected Product' value={vspOrderDetails?.service_product_name} />
            <LabelValue label='Oral Surgeon' value={vspOrderDetails?.oral_surgeon_name} />
            <LabelValue label='Orthodontist' value={vspOrderDetails?.orthodontist_name} />
          </div>
        </SectionCard>

        {/* ── Case Records ── */}
        <SectionCard icon={<FolderOpen className='h-4 w-4' />} title='Case Records'>
          <div className='space-y-4'>
            <LabelValue label='Record Source' value='New Uploads / Links' />

            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <FileBadge
                label='Extraoral Photos'
                count={extraoralCount}
                hasFiles={extraoralCount > 0}
              />
              <FileBadge
                label='Intraoral Photos'
                count={intraoralPhotoCount}
                hasFiles={intraoralPhotoCount > 0}
              />
              <FileBadge
                label='Intraoral Scan'
                count={intraoralScanCount}
                hasFiles={intraoralScanCount > 0}
              />
            </div>

            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <FileBadge label='Stone Cast' count={stoneCastCount} hasFiles={stoneCastCount > 0} />
              <FileBadge label='DICOM (CT/CBCT)' count={dicomCount} hasFiles={dicomCount > 0} />
              <FileBadge
                label='Radiographs'
                count={RadiographsCount}
                hasFiles={RadiographsCount > 0}
              />
            </div>

            <div>
              <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
                External Links
              </span>
              {externalLinks.length > 0 ? (
                <div className='mt-2 space-y-2'>
                  {externalLinks.map((link, index) => (
                    <a
                      key={`${link}-${index}`}
                      href={link}
                      target='_blank'
                      rel='noreferrer'
                      className='block truncate text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline'
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <p className='mt-2 text-sm text-gray-400'>No external links added.</p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Surgical Prescription ── */}
        <SectionCard icon={<FileText className='h-4 w-4' />} title='Surgical Prescription'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <LabelValue label='Surgery Types' value={getSurgeryTypeLabel(prescription)} />
              <LabelValue
                label='Surgery Date'
                value={formatDate(prescription?.tentative_surgery_date)}
              />
              <LabelValue
                label='Needed By'
                value={formatDate(prescription?.earliest_treatment_plan_by_date)}
                valueClassName='text-red-500'
              />
            </div>

            {prescription?.is_others && prescription?.others_description?.trim() && (
              <div>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
                  Comment
                </span>
                <div className='mt-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900'>
                  {prescription.others_description.trim()}
                </div>
              </div>
            )}

            {prescription?.treatment_plan && (
              <div>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
                  Treatment Plan Preview
                </span>
                <div className='mt-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3'>
                  <div
                    className='text-sm text-gray-700 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-1 [&_p]:my-1'
                    dangerouslySetInnerHTML={{
                      __html: prescription.treatment_plan,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Billing & Shipping ── */}
        <SectionCard icon={<Truck className='h-4 w-4' />} title='Billing &amp; Shipping'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {/* Billing Address */}
            <div>
              <span className='text-xs font-semibold uppercase tracking-wide text-indigo-500'>
                Billing Address
              </span>
              <div className='mt-2 space-y-1 text-sm text-gray-700'>
                {vspOrderDetails?.billing_details?.name && (
                  <p className='font-semibold text-gray-900'>
                    {vspOrderDetails.billing_details.name}
                  </p>
                )}
                {vspOrderDetails?.billing_details?.addressed_to && (
                  <p className='text-gray-600'>{vspOrderDetails.billing_details.addressed_to}</p>
                )}

                {vspOrderDetails?.billing_details?.address_line && (
                  <p className='text-gray-600'>{vspOrderDetails.billing_details.address_line}</p>
                )}
                {(vspOrderDetails?.billing_details?.city ||
                  vspOrderDetails?.billing_details?.state ||
                  vspOrderDetails?.billing_details?.pincode) && (
                  <p className='text-gray-600'>
                    {[
                      vspOrderDetails.billing_details.city,
                      vspOrderDetails.billing_details.state,
                      vspOrderDetails.billing_details.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {vspOrderDetails?.billing_details?.country && (
                  <p className='text-gray-600'>{vspOrderDetails.billing_details.country}</p>
                )}
                {!vspOrderDetails?.billing_details?.name && <p className='text-gray-400'>—</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <span className='text-xs font-semibold uppercase tracking-wide text-indigo-500'>
                Shipping Address
              </span>
              <div className='mt-2 space-y-1 text-sm text-gray-700'>
                {vspOrderDetails?.shipping_details?.name && (
                  <p className='font-semibold text-gray-900'>
                    {vspOrderDetails.shipping_details.name}
                  </p>
                )}
                {vspOrderDetails?.shipping_details?.mobile_number && (
                  <p className='text-gray-600'>{vspOrderDetails.shipping_details?.mobile_number}</p>
                )}
                {vspOrderDetails?.shipping_details?.addressed_to && (
                  <p className='text-gray-600'>{vspOrderDetails.shipping_details.addressed_to}</p>
                )}

                {vspOrderDetails?.shipping_details?.address_line && (
                  <p className='text-gray-600'>{vspOrderDetails.shipping_details.address_line}</p>
                )}
                {(vspOrderDetails?.shipping_details?.city ||
                  vspOrderDetails?.shipping_details?.state ||
                  vspOrderDetails?.shipping_details?.pincode) && (
                  <p className='text-gray-600'>
                    {[
                      vspOrderDetails.shipping_details.city,
                      vspOrderDetails.shipping_details.state,
                      vspOrderDetails.shipping_details.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {vspOrderDetails?.shipping_details?.country && (
                  <p className='text-gray-600'>{vspOrderDetails.shipping_details.country}</p>
                )}
                {!vspOrderDetails?.shipping_details?.name && <p className='text-gray-400'>—</p>}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <Footer
        onNext={() => setShowConfirmModal(true)}
        nextButtonText='Continue & Send'
        loadingNext={submitting}
      />

      {/* Confirm & Submit Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]'>
          <div className='mx-4 w-full max-w-md rounded-2xl bg-white px-8 py-8 shadow-xl'>
            <div className='flex flex-col items-center text-center'>
              <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CAD7FF] bg-[#EEF2FF]'>
                <Send className='h-6 w-6 text-[#4A62E8]' />
              </div>
              <h3 className='mb-2 text-xl font-bold text-gray-900'>Submit Order?</h3>
              <p className='text-sm text-gray-500'>
                You are about to submit this order for processing. The status will change from{' '}
                <span className='font-semibold text-gray-800'>Draft</span> to{' '}
                <span className='font-semibold text-[#4A62E8]'>Submitted</span> and the case will be
                sent to the lab for planning.
              </p>
            </div>

            <div className='mt-8 flex gap-3'>
              <button
                type='button'
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className={cn(
                  'h-11 flex-1 rounded-xl border border-[#D0D5DD] text-sm font-semibold text-[#344054]',
                  'transition-all hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSubmitOrder}
                disabled={submitting}
                className={cn(
                  'h-11 flex-1 rounded-xl border border-[#4462EA] bg-[#4A62E8] text-sm font-semibold text-white',
                  'shadow-[0_8px_18px_-10px_rgba(74,98,232,0.75)] transition-all',
                  'hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
