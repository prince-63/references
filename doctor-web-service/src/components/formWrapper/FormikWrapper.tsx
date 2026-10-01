// components/formWrapper/FormikWrapper.tsx
import React from 'react'
import {Layout} from 'antd'
import {Content, Footer} from 'antd/es/layout/layout'
import {Formik, Form as FormikForm, type FormikHelpers, type FormikProps} from 'formik'
import * as Yup from 'yup' // optional, only if you pass a Yup schema
import AntdButton from 'components/atom/Buttons/AntdButton'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import {useNavigate as useCustomNavigate} from 'context/CustomNavigationContext'
import {useSearchParams} from 'react-router-dom'

type CommonUIProps = {
  title: string
  subTitle?: string
  children: React.ReactNode | ((formik: FormikProps<any>) => React.ReactNode)
  onClickCancel?: () => void
  onClickSave?: () => void
  buttonText?: string
  isDisabled?: boolean
  showBackButton?: boolean
  onClickBack?: () => void
  showFooterBackButton?: boolean
  backButtonText?: string
}

type FormikBits<T> = {
  initialValues: T
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>
  validationSchema?: Yup.AnyObjectSchema | any
  enableReinitialize?: boolean
}

type FormikWrapperProps<T> = CommonUIProps & FormikBits<T>

const FormikWrapper = <T extends Record<string, any>>({
  title,
  subTitle,
  children,
  onClickCancel,
  onClickSave,
  buttonText,
  isDisabled = false,
  showBackButton = false,
  onClickBack,
  showFooterBackButton = false,
  backButtonText = 'Back',

  initialValues,
  onSubmit,
  validationSchema,
  enableReinitialize = true,
}: FormikWrapperProps<T>) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const {navigate} = useCustomNavigate()

  return (
    <Formik<T>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={enableReinitialize}
      validateOnBlur
      validateOnChange
    >
      {(formik) => (
        <Layout className='!h-screen flex flex-col'>
          <Content className='bg-white flex-1 overflow-hidden'>
            <FormikForm className='flex flex-col h-full min-h-0'>
              {/* Body */}
              <div className='flex-1 overflow-auto p-4 pb-28'>
                <div className='flex flex-col gap-2 mb-4'>
                  <div className='flex items-start gap-2'>
                    {showBackButton && (
                      <button
                        type='button'
                        onClick={() =>
                          onClickBack ? onClickBack() : navigate(-1 as unknown as any)
                        }
                        className='rounded-full bg-lightGray w-8 h-8 flex items-center justify-center'
                      >
                        <img src={leftArrow} alt='' width={16} />
                      </button>
                    )}
                    <div>
                      <div className='font-semibold text-2xl'>{title}</div>
                      {subTitle && <div className='text-base text-textColor'>{subTitle}</div>}
                    </div>
                  </div>
                </div>

                {/* Children (supports function-as-child to access formik) */}
                {typeof children === 'function' ? children(formik) : children}
                <Footer className='bg-white !p-0 fixed bottom-0 w-full right-4'>
                  <div className='w-full flex gap-2 justify-end items-center me-4 border-t border-mediumGray'>
                    {(onClickCancel || onClickSave) && (
                      <div className='flex flex-wrap gap-3 pt-6 pb-6'>
                        {onClickCancel && (
                          <button
                            className='flex gap-2 items-center w-fit text-textColor border border-mediumGray text-base font-semibold px-4 py-3 rounded-lg'
                            type='button'
                            onClick={onClickCancel}
                          >
                            Cancel
                          </button>
                        )}

                        {showFooterBackButton && onClickBack && (
                          <button
                            className='flex gap-2 items-center w-fit text-textColor border border-mediumGray text-base font-semibold px-4 py-3 rounded-lg'
                            type='button'
                            onClick={onClickBack}
                          >
                            {backButtonText}
                          </button>
                        )}

                        <AntdButton
                          text={isEdit ? 'Save changes' : buttonText || 'Verify and add'}
                          htmlType='button'
                          className='md:w-fit w-full text-base bg-primaryColor text-white hover:!bg-primarySupport hover:!text-primaryColor font-semibold px-6 py-3 min-h-12'
                          onClick={async () => {
                            // preserve your FormWrapper API but still submit the form
                            onClickSave?.()
                            await formik.submitForm()
                          }}
                          loading={formik.isSubmitting}
                          disabled={formik.isSubmitting || isDisabled}
                        />
                      </div>
                    )}
                  </div>
                </Footer>
              </div>

              {/* Footer */}
            </FormikForm>
          </Content>
        </Layout>
      )}
    </Formik>
  )
}

export default FormikWrapper
