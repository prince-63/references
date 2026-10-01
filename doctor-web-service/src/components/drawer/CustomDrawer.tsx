import {DrawerTitle} from './DrawerTitle'
import {Drawer, DrawerProps} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'

interface CustomDrawerProps extends DrawerProps {
  subTitle?: React.ReactNode
  title: string
}

const CustomDrawer = ({subTitle, title, ...props}: CustomDrawerProps) => {
  const {onClose, children} = props
  return (
    <Drawer
      title={<DrawerTitle title={title} subTitle={subTitle} />}
      closeIcon={null}
      rootStyle={{fontFamily: 'figtree'}}
      width={672}
      extra={
        <div className='cursor-pointer h-full' onClick={onClose}>
          <CloseIcon />
        </div>
      }
      {...props}
    >
      {children}
    </Drawer>
  )
}

export default CustomDrawer
