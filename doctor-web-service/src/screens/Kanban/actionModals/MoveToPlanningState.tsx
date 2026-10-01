import React, {useContext, useEffect, useState} from 'react'
import {Modal} from 'antd'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  changeWorkFlow,
  getKanbanCountsByProfile,
  setIsOpenMoveToPlanningStateModal,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import {Formik} from 'formik'
import getInitialValues from '../helpers/getInitialValues'
import {selectPlanningSchema} from '../helpers/selectPlanningSchema'
import FormikRadio from 'components/atom/Radio/FormikRadio'
import When from 'components/when/When'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useNavigate, useParams} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {updateAssignee} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {
  getProductList,
  setProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {Image} from 'assets/images/Images/Image'
import {IMAGE_COMING_SOON} from 'utils/ImageConst'
import {Product} from '../components/ProductCard'
import hasValue from 'utils/hasValue'

interface optionTypeRadio {
  label: string
  value: string
  subLabel: string
}
export const caseTypesList: optionTypeRadio[] = [
  {
    label: 'In-house',
    value: 'IN_HOUSE',
    subLabel: 'Plan and produce the aligners internally with your own team and resources.',
  },
  {
    label: 'Outsource?',
    value: 'OUTSOURCE',
    subLabel:
      'Send the case to an external lab to handle planning and manufacturing for this patient.',
  },
  {
    label: 'Custom',
    value: 'CUSTOM',
    subLabel:
      'Split the work: handle one part in-house and outsource the other, or use different providers for each.',
  },
]
export const caseTypesListForCustomer: optionTypeRadio[] = [
  {
    label: 'Outsource?',
    value: 'OUTSOURCE',
    subLabel:
      'Send the case to an external lab to handle planning and manufacturing for this patient.',
  },
  {
    label: 'Custom',
    value: 'CUSTOM',
    subLabel:
      'Split the work: handle one part in-house and outsource the other, or use different providers for each.',
  },
]

interface MoveToPlanningStateProps {
  isFromMainPage?: boolean
}

const MoveToPlanningState: React.FC<MoveToPlanningStateProps> = ({isFromMainPage}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const {isOpenMoveToPlanningStateModal, cardDetails} = useSelector(
    (state: RootState) => state.kanban
  )
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const navigate = useNavigate()
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const {isCustomer} = useAllUserPlan()
  const [showInHouseSetup, setShowInHouseSetup] = React.useState(false)
  const {productList} = useSelector((state: RootState) => state.productionSetup)
  const [selected, setSelected] = useState<number | null>(null)

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>) => {
    const selectedProduct = productList.owner_products.find((product) => product.id === selected)
    const payload = {
      task_id: cardDetails?.id,
      assignee_id: values?.assignee_id,
      manufacturing_products: selectedProduct,
    }
    dispatchAction(updateAssignee(payload as any))
      .unwrap()
      .then(() => {
        const payload = {
          manufacturing_id: null,
          order_type: 'ALIGNER',
          workflow_name: 'Planning In House',
          workflow_status_name: 'TO DO',
          order_id: null,
          patient_id: isFromMainPage ? safeParseInt(patientId) : cardDetails?.patient_id,
          profile_id: profileId,
          service_products: selectedProduct,
          lab_work_flow_name: null,
          lab_order_type: null,
          lab_workflow_status_name: null,
          case_type: 'IN_HOUSE_MANUFACTURING',
          lab_profile_id: null,
          organization_id: organizationId,
          doctor_id: userId,
          task_id: isFromMainPage ? getIndividualTaskList?.id : cardDetails?.id,
          service_product_id: selectedProduct?.id,
        }

        dispatchAction(changeWorkFlow(payload as any))
          .unwrap()
          .then(() => {
            dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
              .unwrap()
              .then(() => {
                dispatchAction(setIsOpenMoveToPlanningStateModal(false))
                SuccessToast('Case moved to In-House Planning')
                !isFromMainPage
                  ? navigate('?workFlow=planning-in-house')
                  : navigate('/aligner-orders?workFlow=planning-in-house')
              })
          })
      })
  }

  return (
    <Formik
      initialValues={getInitialValues({isCustomer, profileId: safeParseInt(profileId)})}
      enableReinitialize
      validationSchema={selectPlanningSchema()}
      onSubmit={handleSubmit}
    >
      {(formik) => {
        useEffect(() => {
          if (!isOpenMoveToPlanningStateModal) return
          dispatchAction(
            getVendorsList({
              doctor_id: safeParseInt(userId),
              isInternalUserToShow: true,
            })
          )
            .unwrap()
            .then(() => {
              formik.setFieldValue('assignee_id', profileId)
            })

          dispatchAction(
            getProductList({
              owner_profile_id: safeParseInt(profileId),
              vendor_profile_ids: [],
              product_type: 'ALIGNER',
              search: '',
            })
          )
        }, [isOpenMoveToPlanningStateModal])

        const handleCancel = () => {
          dispatchAction(setIsOpenMoveToPlanningStateModal(false))
          formik.resetForm()
        }

        useEffect(() => {
          if (formik.values.production_option === 'DECIDE_AFTER_PLANNING') {
            setSelected(null)
          }
        }, [formik.values.production_option])

        return (
          <Modal
            destroyOnClose
            open={isOpenMoveToPlanningStateModal}
            onCancel={handleCancel}
            footer={null}
            centered
            width={540}
          >
            <div className='flex flex-col gap-5 mt-4'>
              {/* Step 1: Choose case type */}
              {!showInHouseSetup && (
                <>
                  <div className='flex flex-col items-start gap-3'>
                    <div className='text-2xl font-bold'>Choose how you'd like to go ahead</div>
                    <div className='text-sm text-textColor'>
                      Select how you want to handle treatment planning and aligner production for
                      this patient.
                    </div>
                  </div>
                  <FormikRadio
                    classNameForRadio='flex !flex-col gap-2'
                    name='case_type'
                    items={isCustomer ? caseTypesListForCustomer : caseTypesList}
                  />

                  <div className='w-full flex gap-4'>
                    <ButtonOutlined
                      text={'Cancel'}
                      className={'h-10 border !border-mediumGray text-textColor'}
                      onClick={() => {
                        handleCancel()
                      }}
                    />

                    <AntdButton
                      disabled={!hasValue(formik.values.case_type)}
                      onClick={() => {
                        const payload = {
                          task_id: cardDetails?.id,
                          planning_case_type: String(formik.values?.case_type),
                        }
                        dispatchAction(updateAssignee(payload as any))
                        // redirect to unified stepper page replacing modal + page mix
                        navigate(`/planning-setup-stepper/${cardDetails?.patient_id}`)
                        dispatchAction(setIsOpenMoveToPlanningStateModal(false))
                      }}
                      text='Continue'
                      className='w-full h-10 font-semibold rounded-lg bg-primaryColor hover:bg-primaryColor font-figtree'
                    />
                  </div>
                </>
              )}

              {/* Step 2: In-house setup */}
              {showInHouseSetup && (
                <>
                  <div className='text-2xl font-bold'>Set up In-House Workflow</div>
                  <FormikSelect
                    name='assignee_id'
                    label='Planning'
                    placeholder='Assign the case'
                    required
                    options={activeVendorsList}
                  />

                  <FormikRadio
                    label='Production'
                    name='production_option'
                    items={[
                      {
                        label: 'Decide after planning',
                        value: 'DECIDE_AFTER_PLANNING',
                        subLabel: '',
                      },
                      {label: 'Select now', value: 'SELECT_NOW', subLabel: ''},
                    ]}
                  />

                  <When isTrue={String(formik.values?.production_option) === 'SELECT_NOW'}>
                    <ProductListDropdown
                      products={productList?.owner_products ?? []}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </When>

                  <div
                    style={{marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12}}
                  >
                    <ButtonOutlined
                      text={'Back'}
                      className={'!h-[50px] !w-[150px] border !border-mediumGray text-textColor'}
                      onClick={() => setShowInHouseSetup(false)}
                    />

                    <AntdButton
                      onClick={handleSubmit as any}
                      text='Continue'
                      className='h-[3rem] min-w-[120px] font-semibold rounded-lg bg-primaryColor hover:bg-primaryColor font-figtree'
                    />
                  </div>
                </>
              )}
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default MoveToPlanningState

/* Small list item used by the dropdown-like panel */
const ProductListItem = ({
  product,
  isSelected,
  onClick,
}: {
  product: Product
  isSelected: boolean
  onClick: (id: number) => void
}) => {
  return (
    <div
      onClick={() => onClick(product.id)}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-violet-50' : ''
      }`}
    >
      <div className='w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0'>
        <Image
          src={product.product_image ?? IMAGE_COMING_SOON}
          alt={product.product_name}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='flex-1'>
        <div className='font-medium text-sm text-gray-800'>{product.product_name}</div>
        <div className='text-xs text-gray-500 line-clamp-2'>{product.product_description}</div>
      </div>
      <div className='flex-shrink-0'>
        <div
          className={`w-5 h-5 rounded border ${
            isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300 bg-white'
          }`}
        />
      </div>
    </div>
  )
}

/* Dropdown-like panel that lists owner products */
const ProductListDropdown = ({
  products,
  selected,
  setSelected,
}: {
  products: Product[]
  selected: number | null
  setSelected: (id: number) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  if (!products || products.length === 0) return null
  return (
    <div className='mt-4 w-full'>
      <div className='border rounded-md bg-white shadow-sm'>
        <div className='p-3 border-b text-sm font-medium'>Select product</div>
        <div className='max-h-56 overflow-auto'>
          {products.map((p) => (
            <ProductListItem
              key={p.id}
              product={p}
              isSelected={selected === p.id}
              onClick={(id) => {
                dispatchAction(setProductType('IN_HOUSE'))
                setSelected(id)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
