import SearchListItem, {listItemProps} from './SearchListItem'

const SearchList = ({
  heading,
  searchList,
  closeSearchModal,
}: {
  heading: string
  searchList: listItemProps[]
  closeSearchModal: () => void
}) => {
  return (
    <div className='flex flex-col gap-2 mb-2'>
      <div className='text-textColor font-semibold px-6'>{heading}</div>
      {searchList.map((listItem, index, searchList) => {
        return (
          <div key={listItem.title}>
            <SearchListItem
              type={listItem.type}
              image={listItem.image}
              title={listItem.title}
              subtitle={listItem.subtitle}
              link={listItem.link}
              showBorder={index < searchList.length - 1}
              closeSearchModal={closeSearchModal}
            />
          </div>
        )
      })}
    </div>
  )
}

export default SearchList
