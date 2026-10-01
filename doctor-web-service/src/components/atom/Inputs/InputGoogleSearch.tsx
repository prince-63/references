import React, {FC} from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import CommonSVG from '../SVG/CommonSVG'
import {SVG_GOOGLE, SVG_SEARCH} from '../../../utils/SvgConstants'
interface props {
  handleInputChange?: any
}
const InputGoogleSearch: FC<props> = (props) => {
  const {handleInputChange} = props
  return (
    <div className='google-search-bar relative'>
      <div className='absolute z-20 left-2 top-1/2 transform -translate-y-1/2 focus:outline-none'>
        <CommonSVG svg={SVG_GOOGLE} width='18' height='18' />
      </div>
      <GooglePlacesAutocomplete
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        selectProps={{
          placeholder: 'Search for a place',
          onChange: handleInputChange,
          isSearchable: true,
          isClearable: true,
          styles: {
            input: (provided: any) => ({
              ...provided,
              padding: '6px 10px 6px 10px',
              border: 'none',
            }),
          },
        }}
      />
      <div className='absolute z-20 right-2 top-1/2 transform -translate-y-1/2 focus:outline-none bg-white'>
        <CommonSVG svg={SVG_SEARCH} width='18' height='18' />
      </div>
    </div>
  )
}
export default InputGoogleSearch
