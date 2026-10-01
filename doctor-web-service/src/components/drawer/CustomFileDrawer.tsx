import {useState} from 'react'
import {Drawer, Tabs} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'
import UploadFile from 'screens/Patients/LeadsProfile/main/files/components/UploadFile'
import ReUploadFile from 'screens/Patients/LeadsProfile/main/files/components/ReUploadFile'
import useDispatchAction from '@hooks/useDispatchAction'
import {setOpenUploadFilesModal} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'

const CustomFileDrawer = () => {
  const [open, setOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const {dispatchAction} = useDispatchAction()

  const onClose = () => {
    setOpen(false)
    dispatchAction(setOpenUploadFilesModal(false))
  }

  return (
    <Drawer
      title={<div className='font-semibold text-lg'>Files</div>}
      placement='right'
      width={672}
      open={open}
      onClose={onClose}
      closeIcon={null}
      extra={
        <div className='cursor-pointer h-full' onClick={onClose}>
          <CloseIcon />
        </div>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'upload',
            label: 'Upload',
            children: <UploadFile />,
          },
          {
            key: 'my-files',
            label: 'My Files',
            children: <ReUploadFile />,
          },
        ]}
      />
    </Drawer>
  )
}

export default CustomFileDrawer
