import When from '../when/When'

import {Pagination} from 'antd'
import {PaginationProps} from 'antd'
import clsx from 'clsx'

interface SearchResultsPaginationProps extends PaginationProps {
  entities: any[]
  pager: {
    totalPages: number
    total: number
  }
  pageNumber: number
  setPageNumber: (pageNumber: number) => void
  className?: string
}

const SearchResultsPagination: React.FC<SearchResultsPaginationProps> = ({
  entities,
  pager,
  pageNumber,
  setPageNumber,
  className,
  ...rest
}) => {
  return (
    <When isTrue={entities?.length > 0}>
      <div className={clsx('flex justify-end', className)}>
        <Pagination
          showSizeChanger={false}
          defaultCurrent={pageNumber + 1}
          defaultPageSize={rest.pageSize || 25}
          onChange={(page) => setPageNumber(page)}
          total={pager?.total}
          {...rest}
        />
      </div>
    </When>
  )
}

export default SearchResultsPagination
