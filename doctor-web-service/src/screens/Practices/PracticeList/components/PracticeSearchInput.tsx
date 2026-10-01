import cn from '@utils/cn'
import {ConfigProvider} from 'antd'
import Search from 'antd/es/input/Search'
import hasValue from 'utils/hasValue'

const PracticeSearchInput = ({
  placeholder,
  className,
  handleSearch,
  defaultValue,
}: {
  className?: string
  placeholder?: string
  defaultValue?: string
  handleSearch: (searchInput: string | null) => void
}) => {
  return (
    <div className={cn('md:w-1/3 w-full', className)}>
      <ConfigProvider theme={{token: {fontFamily: 'figtree'}}}>
        <Search
          placeholder={placeholder}
          size='large'
          className={cn('w-full rounded-md ant-custom')}
          allowClear
          defaultValue={defaultValue}
          onClear={() => {
            handleSearch(null)
          }}
          onChange={(e) => {
            if (!hasValue(e.target.value)) {
              handleSearch(null)
            }
          }}
          onSearch={(searchParam) => {
            handleSearch(searchParam)
          }}
          maxLength={30}
        />
      </ConfigProvider>
    </div>
  )
}

export default PracticeSearchInput
