import useDispatchAction from '@hooks/useDispatchAction'
import {Select} from 'antd'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import FormWrapper from 'components/formWrapper/FormWrapper'
import Page from 'components/page/Page'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {createOrder, getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  getProductList,
  setProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import {ProductCard} from './ProductCard'
import {updateAssignee} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {changeWorkFlow, getKanbanCountsByProfile} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {optionType} from 'types/optionType'
import caseTypes from '@constants/caseTypes'

const CustomPlanningSetup = () => {
  const {profileId, userId, organizationId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {patientId} = useParams()
  const [selectedType, setSelectedType] = useState<'IN_HOUSE' | 'OUTSOURCE'>('IN_HOUSE')
  const [assignee, setAssignee] = useState<number>(safeParseInt(profileId))
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const {dispatchAction} = useDispatchAction()
  const [selected, setSelected] = useState<number | null>(null)
  const {cardDetails} = useSelector((state: RootState) => state.kanban)
  const {loadingProduct, productList} = useSelector((state: RootState) => state.productionSetup)
  const {data: patientDetailsResponse} = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails
  )
  const assignedPractice = patientDetailsResponse?.patient_details?.assigned_practice

  useEffect(() => {
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        isInternalUserToShow: selectedType === 'IN_HOUSE' ? true : false,
      })
    )
      .unwrap()
      .then((res: optionType[]) => {
        const vendorList = res
          .filter((vendor) => vendor.value !== profileId)
          .map((vendor) => safeParseInt(vendor.value))

        dispatchAction(
          getProductList({
            owner_profile_id: safeParseInt(profileId),
            vendor_profile_ids: selectedType === 'IN_HOUSE' ? [] : vendorList,
            product_type: 'SERVICE',
            search: '',
          })
        )
        setAssignee(safeParseInt(profileId))
      })
  }, [selectedType])

  const handleInhouse = () => {
    const selectedProduct = productList.owner_products.find((product) => product.id === selected)
    const payload = {
      task_id: cardDetails?.id,
      assignee_id: assignee,
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
          patient_id: safeParseInt(patientId),
          profile_id: profileId,
          service_products: {
            manufacturing_id: 0,
            order_type: 'ALIGNER',
            workflow_name: 'Planning In House',
            workflow_status_name: 'TO DO',
            order_id: null,
            patient_id: safeParseInt(patientId),
            profile_id: profileId,
            service_products: {},
            lab_work_flow_name: null,
            lab_order_type: null,
            lab_workflow_status_name: null,
            case_type: 'IN_HOUSE_MANUFACTURING',
            lab_profile_id: null,
            organization_id: organizationId,
            doctor_id: userId,
            task_id: cardDetails?.id,
          },
          lab_work_flow_name: null,
          lab_order_type: null,
          lab_workflow_status_name: null,
          case_type: 'IN_HOUSE_MANUFACTURING',
          lab_profile_id: null,
          organization_id: organizationId,
          doctor_id: userId,
          task_id: cardDetails?.id,
        }

        dispatchAction(changeWorkFlow(payload as any))
          .unwrap()
          .then(() => {
            dispatchAction(getKanbanCountsByProfile({profile_id: Number(profileId)}))
              .unwrap()
              .then(() => {
                SuccessToast('Case moved to In-House Planning')

                navigate('/aligner-orders?workFlow=planning-in-house')
              })
          })
      })
  }

  const handleOutSource = () => {
    const product = productList?.vendor_products.find((product) => product.id === selected)
    dispatchAction(setProductSelected(product))

    const payload = {
      order_details: {
        lab_id: safeParseInt(profileId),
        lab_organization_id: safeParseInt(organizationId),
        lab_doctor_id: safeParseInt(userId),
        order_type: 'PLANNING_ORDER',
        due_by: null,
        delivery_preference: 'IN_BATCHES',
        target_user_details: {
          profile_id: safeParseInt(product?.profile_id),
          organization_id: safeParseInt(product?.organization_id),
          doctor_id: safeParseInt(product?.doctor_id),
        },
      },
      status: 'DRAFT',
      patient_id: patientId,
      doctor_id: userId,
      current_step: 1,
      organization_id: safeParseInt(organizationId),
      profile_id: safeParseInt(profileId),
      service_products: product,
      case_type: caseTypes.OUTSOURCED_PLANNING_ORDER,
      practice_doctor_id: safeParseInt(assignedPractice?.practice_doctor_id),
      practice_profile_id: safeParseInt(assignedPractice?.practice_profile_id),
      practice_organization_id: safeParseInt(assignedPractice?.practice_organization_id),
    }

    dispatchAction(createOrder(payload as any)).then((res: any) => {
      const queryParams = new URLSearchParams({
        customFlow: 'true',
      }).toString()

      navigate(`/orders/create-order/${res.payload.order_id}?${queryParams}`)
    })
  }

  return (
    <FormWrapper
      title={'Choose Your Set-Up'}
      subTitle='Decide if you want to handle one part in-house and outsource the other, or use different vendors for each.'
      buttonText='Next'
      onClickCancel={() => {
        navigate(-1)
      }}
      onClickSave={() => {
        if (!cardDetails?.id) {
          navigate(-1)
          return
        }
        if (selectedType === 'IN_HOUSE') {
          handleInhouse()
        } else {
          handleOutSource()
        }
      }}
    >
      <div className='text-xl font-semibold'>Step 1 : Planning</div>
      <div className=' text-textColor'>
        Assign this case to yourself, a team member, or choose an external planning provider.
      </div>
      <RadioGroupIcon
        options={[
          {label: 'In-House', value: 'IN_HOUSE'},
          {label: 'Outsource', value: 'OUTSOURCE'},
        ]}
        onOptionChange={(option) => {
          setSelectedType(option as 'IN_HOUSE' | 'OUTSOURCE')
        }}
        selectedOption={selectedType}
        label=''
        className='text-center rounded-md md:rounded-lg sm:px-4'
      />
      <div className='flex flex-col gap-8 mt-4'>
        {selectedType === 'IN_HOUSE' ? (
          <div>
            <LabelTitle className='mt-4' title='Assign user' required />
            <Select
              className='!w-full h-12'
              placeholder='Assign the case'
              value={assignee}
              options={activeVendorsList}
              onChange={(value) => setAssignee(value)}
            />
          </div>
        ) : (
          <div className='flex flex-col gap-8 mt-4'>
            <Page loading={loadingProduct}>
              {productList?.vendor_products ? (
                <div className='flex flex-wrap gap-4 rounded-lg  my-3'>
                  {productList?.vendor_products?.map((p: any) => (
                    <ProductCard
                      selected={selected ?? 0}
                      setSelected={(id) => setSelected(id)}
                      key={`VENDOR-${p.id}`}
                      product={p}
                      variant={'VENDOR'}
                    />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-20'>
                  <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                    <div className='text-3xl text-gray-400'>🗂️</div>
                  </div>
                  <div className='text-lg font-semibold text-textColor mb-2'>
                    No Products present
                  </div>
                  <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
                    There are no products yet. Add a new product to get started.
                  </div>
                </div>
              )}
            </Page>
          </div>
        )}{' '}
        <div>
          <div className='text-xl font-semibold'>Step 2 : Production</div>
          <div className=' text-textColor'>
            Select an in-house or outsourced option for production, or decide later.
          </div>

          <LabelTitle className='' title='Assign user' required />
          <RadioGroupIcon
            className='text-center rounded-md md:rounded-lg sm:px-4'
            onOptionChange={(option) => {
              setSelectedType(option as 'IN_HOUSE' | 'OUTSOURCE')
            }}
            selectedOption={'DECIDE_AFTER_PLANNING'}
            options={[
              {
                label: 'Decide after planning',
                value: 'DECIDE_AFTER_PLANNING',
              },
            ]}
          />
        </div>
      </div>
    </FormWrapper>
  )
}

export default CustomPlanningSetup
