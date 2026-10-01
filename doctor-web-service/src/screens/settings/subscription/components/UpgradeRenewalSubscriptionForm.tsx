import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {Collapse, ConfigProvider, Modal} from 'antd'
import clsx from 'clsx'
import Tag from 'components/tags/Tag'
import {Formik} from 'formik'
import moment from 'moment'
import {capitalizeFirstLetter, getSalutations, safeParseInt} from 'utils/ConstFunctions'
import getInitialValues from '../helpers/getInitialValues'
import defaultCountyCode from '@constants/defaultCountyCode'
import {useContext, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {upgradeRenewalRequest} from 'redux/Slices/AppSlice/settings/settings.slice'
import {upgradeRenewalSchema} from '../upgradeRenewal.schema'
import {AuthContext} from 'context/AuthContext'
import InputMobile from 'components/atom/Inputs/InputMobile'
import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'
import requestTypeList from '@staticData/requestTypeListOptions'
import When from 'components/when/When'
import FormikSelectListWithRadio from 'components/atom/Dropdown/FormikSelectListWithRadio'
import planTypeList from '@staticData/planTypeListOptions'
import {Input} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import requestTypePlansConstants from '@constants/requestTypePlans.constants'
import Page from 'components/page/Page'
import getActiveProfile from '@utils/getActiveProfile'

const {TextArea} = Input
const {Panel} = Collapse

const UpgradeRenewalSubscriptionForm = () => {
  const {userId, profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {subscriptionData, loadingSubscriptionData} = useSubscriptionDetails()
  const [confirmCancelModel, setConfirmCancelModel] = useState(false)
  const [upgradeRenewalModel, setUpgradeRenewalModel] = useState(false)
  const navigate = useNavigate()
  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const activeProfile = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  const doctorName = `${getSalutations(activeProfile?.salutation)} ${activeProfile?.first_name} ${
    activeProfile?.last_name ?? ''
  }`
  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formik: any) => {
    try {
      if (
        values?.request_type === requestTypePlansConstants.UPGRADE_PLAN &&
        !values?.new_plan_name?.trim()
      ) {
        formik.setFieldError('new_plan_name', 'Please select a plan.')
      } else {
        const payload = {
          doctor_id: safeParseInt(userId),
          user_name: doctorName,
          user_email: doctorData.email?.toLocaleLowerCase(),
          country_code: countryCode,
          mobile: values.mobile,
          current_plan_name: subscriptionData.plan_metadata.plan_name,
          current_plan_start_date: subscriptionData.plan_metadata.current_term_start,
          current_plan_end_date: subscriptionData.plan_metadata.current_term_end,
          request_type: values.request_type,
          new_plan_name: values.new_plan_name,
          notes: values.notes,
        }
        await dispatchAction(upgradeRenewalRequest(payload))
          .unwrap()
          .then(() => {
            setUpgradeRenewalModel(true)
          })
      }
    } catch (error) {}
  }

  return (
    <Formik
      initialValues={getInitialValues()}
      enableReinitialize
      validationSchema={upgradeRenewalSchema(countryCode)}
      onSubmit={handleSubmit}
    >
      {(formik) => {
        return (
          <Page loading={loadingSubscriptionData}>
            <Modal
              closable={false}
              destroyOnClose={true}
              open={confirmCancelModel}
              className={clsx('md:w-[566px] w-full text-center md:p-4')}
              maskClosable={false}
              width={566}
              footer={
                <div className={clsx('flex gap-2 mt-2')}>
                  <button
                    className={clsx('w-full text-red border border-red py-3 px-6 rounded-lg')}
                    type='button'
                    onClick={() => {
                      setConfirmCancelModel(false)
                    }}
                  >
                    {'Go back'}
                  </button>
                  <button
                    className={clsx('w-full text-white bg-red  py-3 px-6 rounded-lg')}
                    type='button'
                    onClick={() => {
                      setConfirmCancelModel(false)
                      navigate(-1)
                    }}
                  >
                    {'Cancel'}
                  </button>
                </div>
              }
            >
              <div className='flex flex-col gap-3'>
                <div>
                  <div className={clsx('md:text-2xl text-xl font-semibold ')}>
                    {'Are you sure you want to cancel?'}
                  </div>

                  <div className={clsx('text-base text-textColor ')}>
                    {'You have unsaved changes. Are you sure you want to leave?'}
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              closable={false}
              destroyOnClose={true}
              open={upgradeRenewalModel}
              className={clsx('md:w-[566px] w-full md:p-4')}
              maskClosable={false}
              width={566}
              footer={
                <div className={clsx('flex gap-2 mt-2')}>
                  <button
                    className={clsx('w-full text-white bg-primaryColor  py-3 px-6 rounded-lg')}
                    type='button'
                    onClick={() => {
                      setUpgradeRenewalModel(false)
                      navigate('/')
                    }}
                  >
                    {'Got it'}
                  </button>
                </div>
              }
            >
              <div className='flex flex-col gap-3'>
                <div className='w-16 h-16 rounded-full bg-tertiarySupport flex justify-center items-center'>
                  <CheckedCircleOutlineIcon />
                </div>
                <div>
                  <div className={clsx('md:text-2xl text-xl font-semibold ')}>
                    {'Your request has been submitted successfully!'}
                  </div>

                  <div className={clsx('text-base font-normal text-textColor break-words')}>
                    <p> {'Our team will contact you soon.'}</p>
                    <p>
                      You can also reach us at <u className='text-black'>+91 8169723642</u>{' '}
                      (Call/WhatsApp) or <u className='text-black'>info@dental-stack.com</u>.
                    </p>
                  </div>
                </div>
              </div>
            </Modal>

            <div className='w-full md:w-[566px] flex justify-between flex-wrap items-center gap-3 p-4'>
              <div>
                <div className='text-2xl font-semibold'>Request for an upgrade or renewal </div>
                <div className='text-textColor font-normal'>
                  Send us a request and we’ll get back to you.
                </div>
              </div>
              <div className='w-full'>
                <ConfigProvider
                  theme={{
                    components: {
                      Collapse: {
                        headerBg: 'transparent',
                      },
                    },
                  }}
                >
                  <Collapse defaultActiveKey={['1']} accordion expandIconPosition='right'>
                    <Panel
                      header={
                        <div>
                          <div className='font-semibold'>{doctorName}</div>
                          <div className='text-textColor font-normal text-sm'>
                            {doctorData?.email}
                          </div>
                        </div>
                      }
                      key='1'
                    >
                      {subscriptionData?.plan_metadata?.trial_plan && (
                        <Tag
                          value={'TRIAL'}
                          className='bg-lightGray text-textColor w-fit text-xs px-2 font-medium mb-2'
                        />
                      )}
                      <p className={clsx('text-neutralBlack  font-semibold ')}>
                        {capitalizeFirstLetter(subscriptionData?.plan_metadata?.plan_name)}
                      </p>
                      <div className='text-sm text-textColor font-normal flex gap-1'>
                        Start date:{' '}
                        <span className='text-black '>
                          {moment(subscriptionData?.plan_metadata?.current_term_start).format(
                            'DD-MMM-YYYY'
                          )}
                        </span>{' '}
                      </div>
                      <div className='text-sm text-textColor font-normal flex gap-1'>
                        End date:{' '}
                        <span className='text-black '>
                          {moment(subscriptionData?.plan_metadata?.current_term_end).format(
                            'DD-MMM-YYYY'
                          )}
                        </span>
                      </div>
                    </Panel>
                  </Collapse>
                </ConfigProvider>
              </div>

              <form className='w-full' onSubmit={formik.handleSubmit}>
                <div className='flex flex-col gap-4'>
                  <div className='mt-6'>
                    <InputMobile
                      name='mobile'
                      className=''
                      label='Mobile Number'
                      classNameLabel='text-textColor text-base font-medium'
                      formik={formik}
                      required={true}
                      countryCode={countryCode}
                      setCountryCode={setCountryCode}
                      value={formik.values.mobile}
                    />
                    <div className='flex items-center gap-1 text-primaryColor text-sm font-medium'>
                      <InfoIcon color={getColorPalette().primaryColor} width='14' height='14' />
                      <p>Our team will contact you on this number.</p>
                    </div>
                  </div>

                  <div>
                    <FormikSelectListWithRadio
                      {...{
                        name: 'request_type',
                        showSearch: true,
                        required: true,
                        items: requestTypeList,
                        className: '!h-12 !rounded-sm',
                        label: 'Request type',
                        onChangeMapperFunc: String,
                        placeholder: 'Select',
                      }}
                    />
                  </div>

                  <When
                    isTrue={formik.values.request_type === requestTypePlansConstants.UPGRADE_PLAN}
                  >
                    <FormikSelectListWithRadio
                      {...{
                        name: 'new_plan_name',
                        showSearch: true,
                        required: true,
                        items: planTypeList,
                        className: '!h-12 !rounded-sm',
                        label: 'Select plan',
                        onChangeMapperFunc: String,
                        placeholder: 'Select',
                      }}
                    />
                  </When>

                  <div>
                    <label htmlFor={'notes'} className='text-base font-medium text-textColor mb-1'>
                      {'Any other requirements'}
                    </label>
                    <TextArea
                      {...formik.getFieldProps('notes')}
                      name={'notes'}
                      maxLength={200}
                      placeholder={
                        'Let us know if you have any additional requests or questions regarding your subscription...'
                      }
                      className='min-!h-20'
                      autoSize={{minRows: 3}}
                    />
                  </div>

                  <div className='flex w-full gap-3'>
                    <button
                      className='w-full text-textColor border border-mediumGray rounded-lg text-base font-semibold px-2 h-12'
                      type='button'
                      onClick={() => {
                        setConfirmCancelModel(true)
                      }}
                    >
                      Cancel
                    </button>
                    <AntdButton
                      text='Save'
                      htmlType='submit'
                      className='w-full text-base bg-primaryColor border text-white hover:!bg-primaryColor hover:!text-white font-semibold px-2 h-12'
                      loading={formik.isSubmitting}
                      disabled={formik.isSubmitting}
                    />
                  </div>
                </div>
              </form>
            </div>
          </Page>
        )
      }}
    </Formik>
  )
}

export default UpgradeRenewalSubscriptionForm
