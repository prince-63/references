import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {Plus, Eye, Edit, Trash2, MoreVertical} from 'lucide-react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getApiDataPrescriptionByPatient,
  deletePrescription,
  resetPrescriptionState,
  type PrescriptionData,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import ModalLayout from 'components/modal/ModalLayout'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import getColorPalette from 'utils/getColorPalette'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {DeletePrescriptionModal} from '../components/DeletePrescriptionModal'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import Page from 'components/page/Page'
import {Dropdown, Modal} from 'antd'
import type {MenuProps} from 'antd'
import EmptyDataCard from 'components/atom/EmptyState/EmptyDataCard'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
import cn from '@utils/cn'
import useServiceConfigurationState from 'screens/settings/services/hooks/useServiceConfigurationState'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

interface AddPrescriptionModalProps {
  isModalVisible: boolean
  onClose: () => void
  patientId: string
  mode?: 'add' | 'view' | 'edit'
  prescriptionId?: number | null
  onUpdateSuccess?: () => void
  selectedTemplate?: PrescriptionTemplateOption['value']
  item?: PrescriptionData | null
}

type PrescriptionTemplateOption = {
  value: 'ALIGNER' | 'ORTHO'
  label: string
  subTitle: string
}

const prescriptionTemplateOptions: PrescriptionTemplateOption[] = [
  {
    value: 'ALIGNER',
    label: 'For Aligner Treatments',
    subTitle: 'For aligner-based prescriptions.',
  },
]

const getPrescriptionLabel = (data?: PrescriptionData['data']) => {
  if (!data) return undefined
  const textFieldKey = Object.keys(data).find((key) => key.includes('textfield'))
  const label = textFieldKey ? data[textFieldKey] : undefined
  if (typeof label === 'string' && label.trim()) return label
  return undefined
}

type PrescriptionTemplateModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (template: PrescriptionTemplateOption['value']) => void
  selectedTemplate: PrescriptionTemplateOption['value']
  onSelectTemplate: (template: PrescriptionTemplateOption['value']) => void
  templateOptions: PrescriptionTemplateOption[]
}

const PrescriptionTemplateModal = ({
  open,
  onClose,
  onConfirm,
  selectedTemplate,
  onSelectTemplate,
  templateOptions,
}: PrescriptionTemplateModalProps) => (
  <Modal
    destroyOnClose
    style={{fontFamily: 'figtree'}}
    closable={false}
    open={open}
    title={<p className='font-semibold text-2xl text-neutralBlack'>Select prescription template</p>}
    width={640}
    centered
    footer={
      <div className='flex justify-between gap-3 pt-2'>
        <button
          className='w-full rounded-lg h-12 px-5 text-primaryColor border border-primaryColor bg-primarySupport hover:bg-[#ece4ff]'
          type='button'
          onClick={onClose}
        >
          Cancel
        </button>
        <AntdButton
          key='confirm'
          text='Confirm'
          htmlType='submit'
          className='h-12 w-full font-semibold text-base bg-primaryColor'
          onClick={() => onConfirm(selectedTemplate)}
        />
      </div>
    }
  >
    <div className='flex flex-col gap-4 pt-2'>
      {templateOptions.map((option) => {
        const isSelected = option.value === selectedTemplate
        return (
          <FilterOptionSelectDropdown
            key={option.value}
            value={option.value}
            label={option.label}
            subTitle={option.subTitle}
            onChange={(opt) => onSelectTemplate(opt.value as PrescriptionTemplateOption['value'])}
            className={cn(
              'px-4 py-4 border rounded-xl transition-colors',
              isSelected ? 'border-primaryColor bg-primarySupport' : 'border-mediumGray bg-white'
            )}
            checked={isSelected}
            labelClassName='truncate font-semibold text-lg text-black'
          />
        )
      })}
    </div>
  </Modal>
)

export const AddPrescriptionModal = ({
  isModalVisible,
  onClose,
  patientId,
  mode = 'add',
  prescriptionId,
  onUpdateSuccess,
  selectedTemplate = 'ALIGNER',
  item,
}: AddPrescriptionModalProps) => {
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null)
  const {postLoading} = useSelector((state: RootState) => state.apiPrescription)

  if (!isModalVisible) return null

  const prescriptionLabel = getPrescriptionLabel(item?.data)
  const title = `${prescriptionLabel ? `${prescriptionLabel}` : 'Prescription'}`

  return (
    <ModalLayout
      title={title}
      isResponsive
      className='md:!w-[60%] !h-[100vh] flex flex-col'
      onClose={onClose}
      footer={
        mode !== 'view' && (
          <div className='flex justify-end'>
            <div className='flex flex-wrap w-full sm:w-1/2 md:w-auto justify-end gap-2 ml-auto'>
              <AntdButton
                onClick={() => {
                  if (postLoading) return
                  submitForm?.()
                }}
                text='Save'
                className='h-[3rem] w-full sm:w-auto min-w-[10rem] font-semibold rounded-lg bg-primaryColor hover:bg-primaryColor text-white font-figtree shadow-sm'
                isLoading={postLoading}
                isDisabled={postLoading}
              />
            </div>
          </div>
        )
      }
    >
      <EmbeddedPrescriptionForm
        prescriptionId={prescriptionId}
        patientId={patientId}
        onSuccess={onUpdateSuccess || onClose}
        mode={mode} // view, edit, add
        setSubmitForm={setSubmitForm}
        template={selectedTemplate}
      />
    </ModalLayout>
  )
}

/* -------------------------------------------------- */
/*  PRESCRIPTIONS PAGE                                */
/* -------------------------------------------------- */

export const Prescriptions = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {patientId} = useParams<{patientId: string}>()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('order_id') || undefined
  const {prescriptionsByPatient, getByPatientLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )
  const palette = getColorPalette()
  const {isStarterPlanUser} = useAllUserPlan()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<PrescriptionTemplateOption['value']>('ALIGNER')
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add')
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionData | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prescriptionIdToDelete, setPrescriptionIdToDelete] = useState<number | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  const {permissionChecks} = useFeatureAccess()
  const prescriptionAccess = permissionChecks?.patientProfileActions?.prescriptions
  const {sections} = useServiceConfigurationState()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const isBracesAddOnActive = useMemo(
    () =>
      sections.some(
        (section) =>
          section.itemName === ServiceConfigurationItemName.BRACES_ADD_ON && section.isActive
      ),
    [sections]
  )
  const templateOptions = useMemo(() => {
    const opts: PrescriptionTemplateOption[] = [...prescriptionTemplateOptions]
    if (isBracesAddOnActive) {
      opts.push({
        value: 'ORTHO',
        label: 'General Orthodontic Template',
        subTitle: 'For aligner or braces treatment',
      })
    }
    return opts
  }, [isBracesAddOnActive])

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /* ------------------------- Fetch prescriptions ------------------------- */
  useEffect(() => {
    const idFromUrl = patientId ? Number(patientId) : null
    const id = idFromUrl || data?.patient_details?.id || null
    if (id)
      dispatchAction(getApiDataPrescriptionByPatient({patientId: id, orderId: orderIdFromUrl}))
  }, [patientId, data?.patient_details?.id, dispatchAction])

  /* ------------------------- Modal Actions ------------------------- */

  useEffect(() => {
    return () => {
      dispatchAction(resetPrescriptionState())
    }
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPrescription(null)
    setSelectedPrescriptionId(null)
  }

  const handleOpenAddModal = () => {
    setSelectedPrescription(null)
    setSelectedPrescription(null)
    const currentPatientId = patientId ?? data?.patient_details?.id?.toString()
    const returnTo = currentPatientId
      ? `${profileBasePath}/${currentPatientId}/details/prescriptions${
          orderIdFromUrl ? `?order_id=${orderIdFromUrl}` : ''
        }`
      : undefined

    if (!isStarterPlanUser) {
      if (currentPatientId) {
        navigate(
          `${profileBasePath}/${currentPatientId}/details/prescriptions/new?template=ALIGNER`,
          {
            state: {returnTo},
          }
        )
        return
      }
      // Fallback to template modal if patient id is unavailable
      setIsTemplateModalOpen(true)
      return
    }

    setIsTemplateModalOpen(true)
  }

  const handleConfirmTemplate = (template: PrescriptionTemplateOption['value']) => {
    setSelectedTemplate(template)
    setIsTemplateModalOpen(false)
    if (patientId) {
      const returnTo = `${profileBasePath}/${patientId}/details/prescriptions${
        orderIdFromUrl ? `?order_id=${orderIdFromUrl}` : ''
      }`
      navigate(`${profileBasePath}/${patientId}/details/prescriptions/new?template=${template}`, {
        state: {returnTo},
      })
      return
    }
    setModalMode('add')
    setSelectedPrescriptionId(null)
    setSelectedPrescription(null)
    setSelectedPrescription(null)
    setIsModalOpen(true)
  }

  const handleOpenViewModal = (prescriptionId: number) => {
    const matchedPrescription =
      prescriptionsByPatient.find(
        (prescription) => prescription.prescription_id === prescriptionId
      ) || null
    setSelectedPrescription(matchedPrescription)
    setModalMode('view')
    setSelectedPrescriptionId(prescriptionId)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (prescriptionId: number) => {
    if (patientId) {
      const returnTo = `${profileBasePath}/${patientId}/details/prescriptions${
        orderIdFromUrl ? `?order_id=${orderIdFromUrl}` : ''
      }`
      navigate(`${profileBasePath}/${patientId}/details/prescriptions/${prescriptionId}/edit`, {
        state: {returnTo},
      })
      return
    }
    const matchedPrescription =
      prescriptionsByPatient.find(
        (prescription) => prescription.prescription_id === prescriptionId
      ) || null
    setSelectedPrescription(matchedPrescription)
    setSelectedPrescription(matchedPrescription)
    setModalMode('edit')
    setSelectedPrescriptionId(prescriptionId)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    setPrescriptionIdToDelete(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async (id?: number) => {
    const targetId = id ?? prescriptionIdToDelete
    if (targetId == null) return
    setLoadingDelete(true)

    try {
      await dispatchAction(deletePrescription(targetId))
      setShowDeleteModal(false)
      setPrescriptionIdToDelete(null)

      if (data?.patient_details?.id) {
        dispatchAction(
          getApiDataPrescriptionByPatient({
            patientId: data.patient_details.id,
            orderId: orderIdFromUrl,
          })
        )
      }
    } finally {
      setLoadingDelete(false)
    }
  }

  const handleUpdateSuccess = async () => {
    setIsModalOpen(false)
    setSelectedPrescriptionId(null)
    setSelectedPrescription(null)
    setModalMode('add')
    if (data?.patient_details?.id) {
      dispatchAction(
        getApiDataPrescriptionByPatient({
          patientId: data.patient_details.id,
          orderId: orderIdFromUrl,
        })
      )
    }
  }

  /* ------------------------- UI ------------------------- */

  return (
    <div className='flex flex-col h-full overflow-y-scroll'>
      <div className='w-full flex flex-col min-h-0 h-full'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
          <h1 className='text-base md:text-lg font-semibold text-gray-900'>Prescriptions</h1>

          {prescriptionAccess?.isAddable && serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && (
            <button
              onClick={handleOpenAddModal}
              style={{
                background: palette.primaryColor,
                border: `1px solid ${palette.primaryColor}`,
                color: palette.white,
              }}
              className='flex items-center md:w-auto w-full space-x-2  px-4 py-2 rounded-lg transition-colors shadow-sm hover:opacity-90 self-start sm:self-auto'
            >
              <Plus size={20} />
              <span>Add Prescription</span>
            </button>
          )}
        </div>

        {/* List */}
        {getByPatientLoading ? (
          <p className='text-textColor'>Loading prescriptions...</p>
        ) : prescriptionsByPatient.length === 0 ? (
          <EmptyDataCard emptyText='No Prescriptions uploaded yet' />
        ) : (
          <Page loading={getByPatientLoading} containerClassName='overflow-auto'>
            {prescriptionsByPatient.map((p) => (
              <div
                key={p.prescription_id}
                className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-mediumGray hover:shadow-md transition-shadow cursor-pointer flex justify-between items-stretch mb-4'
                onClick={() => handleOpenViewModal(p.prescription_id)}
              >
                <div className='flex-1'>
                  <h3 className='text-base md:text-lg font-semibold mb-2'>
                    {getPrescriptionLabel(p?.data) ?? 'Prescription'}
                  </h3>
                </div>

                <div className='ml-4 flex flex-col items-end justify-between'>
                  {/* Actions */}
                  {(() => {
                    const actionItems: MenuProps['items'] = [
                      prescriptionAccess?.isViewable && {
                        key: 'view',
                        label: (
                          <div className='flex items-center gap-2 text-textColor'>
                            <Eye className='w-4 h-4' />
                            <span>View</span>
                          </div>
                        ),
                      },
                      prescriptionAccess?.isEditable &&
                        serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && {
                          key: 'edit',
                          label: (
                            <div className='flex items-center gap-2 text-textColor'>
                              <Edit className='w-4 h-4' />
                              <span>Edit</span>
                            </div>
                          ),
                        },
                      prescriptionAccess?.isDeletable &&
                        serviceConfig?.ALIGNER_PLANNING_MANUFACTURING && {
                          key: 'delete',
                          disabled: loadingDelete,
                          label: (
                            <div className='flex items-center gap-2 text-red'>
                              <Trash2 className='w-4 h-4' color='#f45045' />
                              <span className='text-red'>Delete</span>
                            </div>
                          ),
                        },
                    ].filter(Boolean) as MenuProps['items']

                    return (
                      <Dropdown
                        menu={{
                          items: actionItems,
                          onClick: ({key, domEvent}) => {
                            domEvent.stopPropagation()
                            if (key === 'view') handleOpenViewModal(p.prescription_id)
                            if (key === 'edit') handleOpenEditModal(p.prescription_id)
                            if (key === 'delete') handleDelete(p.prescription_id)
                          },
                        }}
                        trigger={['click']}
                        placement='bottomRight'
                      >
                        <button
                          type='button'
                          onClick={(e) => e.stopPropagation()}
                          className='p-2 rounded-sm hover:bg-gray-100'
                        >
                          <MoreVertical className='w-5 h-5 text-textColor' />
                        </button>
                      </Dropdown>
                    )
                  })()}

                  <p className='text-gray-500 text-sm mt-4 text-right'>
                    Created On: {formatDate((p as any).created_at)}
                  </p>
                </div>
              </div>
            ))}
          </Page>
        )}

        {/* ---------------- Add / Edit / View Modal ---------------- */}
        <AddPrescriptionModal
          isModalVisible={isModalOpen}
          onClose={handleCloseModal}
          patientId={data?.patient_details?.id.toString() ?? ''}
          mode={modalMode}
          prescriptionId={selectedPrescriptionId}
          onUpdateSuccess={handleUpdateSuccess}
          selectedTemplate={selectedTemplate}
          item={selectedPrescription}
        />

        {/* ---------------- Delete Modal ---------------- */}
        <DeletePrescriptionModal
          prescriptionId={prescriptionIdToDelete ?? 0}
          isModalVisible={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setPrescriptionIdToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />

        {/* ---------------- Template Selector Modal ---------------- */}
        <PrescriptionTemplateModal
          open={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onConfirm={handleConfirmTemplate}
          selectedTemplate={selectedTemplate}
          templateOptions={templateOptions}
          onSelectTemplate={setSelectedTemplate}
        />
      </div>
    </div>
  )
}
