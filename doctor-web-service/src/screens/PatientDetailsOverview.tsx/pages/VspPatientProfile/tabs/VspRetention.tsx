import {useState} from 'react'
import Page from 'components/page/Page'
import {Card, Button, Tabs, Empty, Space} from 'antd'
import {Heart, Calendar, PhoneCall} from 'lucide-react'

export default function VspRetention() {
  const [loading] = useState(false)

  const retentionTabs = [
    {
      key: 'followups',
      label: 'Follow-ups',
      children: (
        <div className='space-y-4'>
          <div className='flex justify-end mb-4'>
            <Button type='primary' size='small'>
              Schedule Follow-up
            </Button>
          </div>
          <Empty description='No follow-ups scheduled' />
        </div>
      ),
    },
    {
      key: 'retention-plan',
      label: 'Retention Plan',
      children: (
        <div className='space-y-4'>
          <Empty description='No retention plan created' />
        </div>
      ),
    },
    {
      key: 'communications',
      label: 'Communications',
      children: (
        <div className='space-y-4'>
          <Empty description='No communications logged' />
        </div>
      ),
    },
    {
      key: 'satisfaction',
      label: 'Patient Satisfaction',
      children: (
        <div className='space-y-4'>
          <Empty description='No satisfaction records' />
        </div>
      ),
    },
  ]

  return (
    <Page loading={loading}>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2'>
          <Heart className='h-5 w-5 text-red-500' />
          <h3 className='text-lg font-semibold text-gray-800'>Patient Retention</h3>
        </div>

        <Card className='shadow-sm bg-gradient-to-r from-red-50 to-pink-50'>
          <Space direction='vertical' className='w-full'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-red-500' />
              <span className='text-sm text-gray-600'>Next Follow-up: Not scheduled</span>
            </div>
            <div className='flex items-center gap-2'>
              <PhoneCall className='h-4 w-4 text-red-500' />
              <span className='text-sm text-gray-600'>Contact Status: Pending</span>
            </div>
          </Space>
        </Card>

        <Card className='shadow-sm'>
          <Tabs items={retentionTabs} />
        </Card>
      </div>
    </Page>
  )
}
