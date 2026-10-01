import {Collapse, ConfigProvider} from 'antd'
import PermissionTable from './PermissionTable'
import ExpandIcon from 'screens/Patients/PatientProfile/Tabs/components/ExpandIcon'
import {PermissionSubModule} from 'screens/AccessControl/AccessControlList/types/accessControlList.types'

const CollapsibleSelectPermission = ({
  module,
  module_description,
  module_permission,
  edit = false,
}: {
  module: string
  module_description: string
  module_permission: PermissionSubModule[]
  edit?: boolean
}) => {
  return (
    <div className='border border-mediumGray rounded-lg mb-3'>
      <ConfigProvider
        theme={{
          components: {
            Collapse: {
              contentPadding: 0,
            },
          },
        }}
      >
        <Collapse
          bordered={true}
          style={{
            fontFamily: 'figtree',
            padding: 0,
            backgroundColor: 'transparent',
            border: '1px',
            borderColor: '#666',
          }}
          className='.permission-table-div'
          items={[
            {
              key: '1',
              label: (
                <div>
                  <p className='font-medium text-base'>{module}</p>
                  <p className='text-sm font-normal text-textColor '>{module_description}</p>
                </div>
              ),
              children: <PermissionTable modules={module_permission} isNotViewable={edit} />,
              forceRender: true,
            },
          ]}
          expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
          expandIconPosition='end'
        />
      </ConfigProvider>
    </div>
  )
}

export default CollapsibleSelectPermission
