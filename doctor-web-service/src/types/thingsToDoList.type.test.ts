import {ThingsToDoList} from './thingsToDoList.type'

describe('ThingsToDoList type guard behavior', () => {
  it('accepts a fully shaped object', () => {
    const item: ThingsToDoList = {
      name: 'Call patient',
      icon: 'phone',
      link: '/patients',
      is_premium: false,
      required_feature: 'feature',
      children: [
        {
          id: '1',
          name: 'Child task',
          is_completed: false,
          icon: 'child',
        },
      ],
      is_completed: false,
      type: 'task',
      id: 'parent',
      notification_count: 2,
    }

    expect(item.children?.[0].name).toBe('Child task')
  })

  it('handles minimal optional fields', () => {
    const item: ThingsToDoList = {
      name: 'Basic',
      icon: 'note',
      link: '/basic',
      is_premium: true,
      is_completed: true,
      type: 'task',
      id: 'basic',
    }

    expect(item.notification_count).toBeUndefined()
  })
})
