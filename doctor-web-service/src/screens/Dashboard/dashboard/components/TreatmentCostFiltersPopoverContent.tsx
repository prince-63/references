import React from 'react'
import useActiveProfile from '@hooks/useActiveProfile'
import {Collapse, ConfigProvider} from 'antd'
import ExpandIcon from 'assets/icons/ExpandIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useFormikContext} from 'formik'
import {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'
import FilterByPracticeLocation from 'screens/billingsAndPayments/components/filterDrawerComponents/FilterByPracticeLocation'
import FilterByTreatment from 'screens/billingsAndPayments/components/filterDrawerComponents/FilterByTreatment'
import getInitialValues from 'screens/billingsAndPayments/helpers/getInitialValues'

const TreatmentCostFiltersPopoverContent = () => {
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  const {activeProfile} = useActiveProfile()
  const {data: brandList} = useSelector((state: RootState) => state.apiProductionList)
  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  useEffect(() => {
    if (brandList) {
      formik.resetForm({
        values: {
          ...formik.values,
          checked_practice_location_list: practiceLocationsList,
        },
      })
    }
  }, [brandList, practiceLocationsList])
  return (
    <div>
      <div className='flex flex-col gap-3 w-full max-h-[50vh] overflow-y-auto'>
        <ConfigProvider
          theme={{
            components: {
              Collapse: {
                contentBg: 'transparent',
                padding: 0,
                headerBg: 'transparent',
              },
            },
            token: {
              fontSizeIcon: 16,
              fontFamily: 'figtree',
            },
          }}
        >
          <div className='mr-2'>
            <Collapse
              expandIconPosition='end'
              bordered={false}
              expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
              defaultActiveKey={['1', '2']}
              style={{
                padding: 0,
                fontFamily: 'figtree',
              }}
              items={[
                ...(activeProfile?.profile_type === 'OWNER'
                  ? [
                      {
                        key: '1',
                        label: <p className='text-lg font-semibold'>Filter by treatment</p>,
                        children: <FilterByTreatment />,
                        forceRender: true,
                        styles: {
                          body: {
                            padding: 0,
                          },
                        },
                      },
                    ]
                  : []),

                {
                  key: '2',
                  label: (
                    <p className='text-xs uppercase text-textColor mt-1 font-semibold'>
                      Filter by practice location
                    </p>
                  ),
                  children: <FilterByPracticeLocation />,
                  forceRender: true,
                  styles: {
                    body: {
                      padding: 0,
                    },
                  },
                },
              ]}
            />
          </div>
        </ConfigProvider>
      </div>
      <div className='flex gap-3 w-full justify-between mb-2'>
        <AntdButton
          className=' hover:!bg-white hover:!text-textColor h-10 font-semibold text-base w-full border border-mediumGray text-textColor'
          isLoading={false}
          text='Reset'
          onClick={() => {
            if (brandList && practiceLocationsList) {
              formik.setValues({
                ...getInitialValues(),
                checked_practice_location_list: practiceLocationsList,
              })
            }
          }}
        />
        <AntdButton
          className='bg-primaryColor text-white h-10 font-semibold text-base w-full'
          isLoading={formik.isSubmitting}
          disabled={formik.isSubmitting}
          text='Apply'
          htmlType='submit'
          onClick={() => formik.handleSubmit()}
        />
      </div>
    </div>
  )
}

export default TreatmentCostFiltersPopoverContent
