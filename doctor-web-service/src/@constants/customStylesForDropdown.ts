export const customStylesForDropdown = {
  control: (provided: any) => ({
    ...provided,
    height: '48px',
    borderColor: '#D9D9D9',
    boxShadow: 'none',
    borderRadius: '4px',
  }),
  option: (provided: any) => ({
    ...provided,
    boxShadow: 'none',
    backgroundColor: 'white',
    color: 'black',
    ':hover': {
      backgroundColor: '#F5F4FE',
      color: 'black',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    boxShadow: 'none',
    border: '1px solid #D9D9D9', // Add this line for the border
    borderRadius: '4px', // Optional: add this for rounded corners
  }),
  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '200px', // This replaces the height in the menu style
    padding: '0', // Optional: removes default padding
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  input: (provided: any) => ({
    ...provided,

    pointerEvents: 'none',
  }),
}
