import {getStorageType} from 'utils/storage'

const safePersistStorage = {
  getItem: (key: string) => {
    return Promise.resolve(getStorageType().getItem(key))
  },
  setItem: (key: string, value: string) => {
    getStorageType().setItem(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string) => {
    getStorageType().removeItem(key)
    return Promise.resolve()
  },
}

export default safePersistStorage
