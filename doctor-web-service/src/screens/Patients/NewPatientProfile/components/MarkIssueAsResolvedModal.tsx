import React from 'react'
import {Modal} from 'antd'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import cn from '@utils/cn'
import AntdButton from 'components/atom/Buttons/AntdButton'

interface MarkIssueAsResolvedModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: {remarks: string}) => void
}

const validationSchema = Yup.object().shape({
  remarks: Yup.string().required('Remarks are required'),
})

const MarkIssueAsResolvedModal: React.FC<MarkIssueAsResolvedModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const initialValues = {
    remarks: '',
  }
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      closable={false}
      title={<h1 className='text-2xl font-semibold'>Mark issue as resolved</h1>}
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({isSubmitting, isValid}) => (
          <Form className='flex flex-col gap-6'>
            <p className='text-textColor'>
              Add comments for your records before resolving the issue.
            </p>

            <div>
              <FormikInputTextArea
                name='remarks'
                label='Remarks'
                required
                maxLength={500}
                rows={4}
                subLabel='(This is not shown to patient)'
              />
            </div>

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={onClose}
                className={cn(
                  'flex-1 h-12 px-4 rounded-lg border border-primaryColor bg-primarySupport',
                  'text-primaryColor font-medium'
                )}
              >
                Cancel
              </button>
              <AntdButton
                disabled={isSubmitting || !isValid}
                text='Save'
                htmlType='submit'
                loading={isSubmitting}
                className={cn(
                  'flex-1 h-12 px-4 rounded-lg bg-primaryColor',
                  'text-white font-medium hover:bg-primaryColor/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              ></AntdButton>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default MarkIssueAsResolvedModal
