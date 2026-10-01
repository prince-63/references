import React, {useContext, useEffect, useState} from 'react'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import DropdownPrimary from 'components/atom/Dropdown/DropdownPrimary'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import Page from 'components/page/Page'
import {ProductCard} from '../ProductCard'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getEnabledProductList,
  getProductList,
  setManufacturingProductSelected,
  setPlanningAssigneeSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'

const InHouseSection = ({isFromCustom = false}: {isFromCustom?: boolean}) => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [productionOption, setProductionOption] = useState<string>('DECIDE_AFTER_PLANNING')
  const [productSource, setProductSource] = useState<string>('OWNER_PRODUCTS')
  const [selectedVendor, setSelectedVendor] = useState<number>(Number(profileId))
  const {activeUsers, activeVendorsList, loadingActiveUsers} = useSelector(
    (state: RootState) => state.orders
  )
  const {
    productList,
    loadingProduct,
    enabledProductList,
    enabledLoadingProduct,
    manufacturingProductSelected,
    planningAssigneeSelected,
  } = useSelector((state: RootState) => state.productionSetup)

  useEffect(() => {
    dispatchAction(
      getProductList({
        owner_profile_id: profileId,
        vendor_profile_ids: [],
        product_type: 'ALIGNER',
      } as any)
    )
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <LabelTitle
          className='mt-4 font-figtree font-semibold text-[18px] leading-[26px] tracking-[-0.01em] not-italic text-black'
          title='Planning'
          required
        />
        <p className='font-figtree font-normal text-[16px] leading-6 tracking-normal text-textColor'>
          Assign the case to yourself or a team member for planning.
        </p>
        <DropdownPrimary
          name='planning-assignee'
          options={activeUsers}
          value={planningAssigneeSelected}
          onChange={(selectedUser) =>
            dispatchAction(setPlanningAssigneeSelected(selectedUser?.value))
          }
          placeholder={loadingActiveUsers ? 'Loading team members...' : 'Assign the case'}
          isSearchable
          isClearable={false}
          isDisabled={loadingActiveUsers}
        />
      </div>

      <div>
        <LabelTitle
          className='mt-4 font-figtree font-semibold text-[18px] leading-[26px] tracking-[-0.01em] not-italic text-black'
          title='Production'
        />
        <p className='font-figtree font-normal text-[16px] leading-6 tracking-normal text-textColor'>
          {isFromCustom
            ? 'Decide after planning'
            : ' Select a product now or decide after planning'}
        </p>

        <RadioGroupIcon
          className='text-center rounded-md md:rounded-lg sm:px-4 text-base !h-12 !px-4'
          options={
            isFromCustom
              ? [{label: 'Decide after planning', value: 'DECIDE_AFTER_PLANNING'}]
              : [
                  {label: 'Decide after planning', value: 'DECIDE_AFTER_PLANNING'},
                  {label: 'Select now', value: 'SELECT_NOW'},
                ]
          }
          selectedOption={productionOption}
          onOptionChange={(option) => setProductionOption(option)}
        />
      </div>
      {productionOption === 'SELECT_NOW' && (
        <div>
          <div className='text-lg text-textColor'>Select Product for Production</div>

          <RadioGroupIcon
            className='text-center rounded-md md:rounded-lg sm:px-4 text-base !h-12 !px-4 mb-3'
            options={[
              {label: 'Show only in-house', value: 'OWNER_PRODUCTS'},
              {label: 'Show only outsource', value: 'VENDOR_PRODUCTS'},
            ]}
            selectedOption={productSource}
            onOptionChange={(option) => {
              setProductSource(option)
            }}
          />

          <Page loading={loadingProduct || enabledLoadingProduct}>
            {productSource === 'OWNER_PRODUCTS' ? (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3'>
                {productList?.owner_products?.map((product) => (
                  <ProductCard
                    key={`${product.id}`}
                    product={product}
                    selected={manufacturingProductSelected?.id ?? 0}
                    setSelected={() => dispatchAction(setManufacturingProductSelected(product))}
                  />
                ))}
              </div>
            ) : (
              <div>
                <DropdownPrimary
                  name='manufacturing-assignee'
                  options={
                    activeVendorsList?.filter((lab) =>
                      lab?.enabled_items?.includes('MANUFACTURING')
                    ) ?? []
                  }
                  value={selectedVendor}
                  onChange={(selectedUser) => {
                    setSelectedVendor(safeParseInt(selectedUser?.value))
                    dispatchAction(
                      getEnabledProductList({
                        customer_profile_id: safeParseInt(profileId),
                        owner_organization_id: safeParseInt(selectedUser?.lab_organization_id),
                        owner_profile_id: safeParseInt(selectedUser?.value),
                      })
                    )
                  }}
                  placeholder={
                    loadingActiveUsers ? 'Loading team members...' : 'Assign Manufacturing case'
                  }
                  isSearchable
                  isClearable={false}
                  isDisabled={loadingActiveUsers}
                />
                {enabledProductList?.filter((prod) => prod.product_type === 'MANUFACTURING_SERVICE')
                  .length === 0 && (
                  <div className='my-12 text-textColor text-center'>
                    No Manufacturing Products are available for this vendor
                  </div>
                )}
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3'>
                  {enabledProductList &&
                    enabledProductList
                      .filter((prod) => prod.product_type === 'MANUFACTURING_SERVICE')
                      .map((product) => (
                        <ProductCard
                          key={String(product.id)}
                          product={product}
                          selected={manufacturingProductSelected?.id ?? 0}
                          setSelected={() =>
                            dispatchAction(setManufacturingProductSelected(product))
                          }
                        />
                      ))}
                </div>
              </div>
            )}
          </Page>
        </div>
      )}
    </div>
  )
}

export default InHouseSection
