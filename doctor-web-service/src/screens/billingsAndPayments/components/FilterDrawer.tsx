import AntdButton from 'components/atom/Buttons/AntdButton'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {useFormikContext} from 'formik'
import {useState} from 'react'
import FilterByTreatment from './filterDrawerComponents/FilterByTreatment'
import FilterByPracticeLocation from './filterDrawerComponents/FilterByPracticeLocation'
import QuitEditingModal from 'components/quitEditingModal/QuitEditingModal'
import {Collapse, ConfigProvider} from 'antd'
import FilterByReminder from './filterDrawerComponents/FilterByReminder'
import FilterByPaymentDate from './filterDrawerComponents/FilterByPaymentDate'
import SortBy from './filterDrawerComponents/SortBy'
import {FilterDrawerFormikContextType} from '../billingsAndPayments.types'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ExpandIcon from 'assets/icons/ExpandIcon'
import getInitialValues from '../helpers/getInitialValues'
import useActiveProfile from '@hooks/useActiveProfile'

const FilterDrawer = ({
  toggleDrawer,
  isFilterDrawerOpen,
  setShowLoading,
}: {
  isFilterDrawerOpen: boolean
  toggleDrawer: (value: boolean) => void
  setShowLoading: (value: boolean) => void
}) => {
  const {activeProfile} = useActiveProfile()
  const formik = useFormikContext<FilterDrawerFormikContextType>()
  const [cancelSaveModalVisible, setCancelSaveModalVisible] = useState(false)
  const handleClose = () => {
    if (formik.dirty) {
      setCancelSaveModalVisible(true)
    } else {
      toggleDrawer(false)
      formik.resetForm()
    }
  }
  const {data: brandList} = useSelector((state: RootState) => state.apiProductionList)

  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)

  return (
    <CustomDrawer
      destroyOnClose={true}
      onClose={() => {
        handleClose()
      }}
      style={{fontFamily: 'figtree'}}
      styles={{body: {paddingTop: 0}}}
      open={isFilterDrawerOpen}
      title={'Filter & sort'}
      footer={
        <div className='flex gap-3 w-full md:w-auto justify-end'>
          <AntdButton
            className=' hover:!bg-white !bg-white hover:!text-textColor h-10 font-semibold text-base w-fit border border-mediumGray text-textColor'
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
            className='bg-primaryColor text-white h-10 font-semibold text-base w-fit'
            isLoading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            text='Apply'
            htmlType='submit'
            onClick={() => {
              setShowLoading(true)
              formik.handleSubmit()
            }}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-3'>
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
          <Collapse
            expandIconPosition='end'
            bordered={false}
            expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
            defaultActiveKey={['1', '2', '3', '4', '5']}
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
                label: <p className='text-lg font-semibold'>Filter by practice location</p>,
                children: <FilterByPracticeLocation />,
                forceRender: true,
                styles: {
                  body: {
                    padding: 0,
                  },
                },
              },
              {
                key: '3',
                label: <p className='text-lg font-semibold'>Filter by reminder</p>,
                children: <FilterByReminder />,
                forceRender: true,
                styles: {
                  body: {
                    padding: 0,
                  },
                },
              },
              {
                key: '4',
                label: <p className='text-lg font-semibold'>Filter by payment date</p>,
                children: <FilterByPaymentDate />,
                forceRender: true,
                styles: {
                  body: {
                    padding: 0,
                  },
                },
              },
              {
                key: '5',
                label: <p className='text-lg font-semibold'>Sort by</p>,
                children: <SortBy />,
                forceRender: true,
                styles: {
                  body: {
                    padding: 0,
                  },
                },
              },
            ]}
          />
        </ConfigProvider>
      </div>
      <QuitEditingModal
        {...{
          visible: cancelSaveModalVisible,
          setQuitModalVisible: setCancelSaveModalVisible,
          onOkClick: () => {
            toggleDrawer(false)
            formik.resetForm()
          },
        }}
      />
    </CustomDrawer>
  )
}

export default FilterDrawer
