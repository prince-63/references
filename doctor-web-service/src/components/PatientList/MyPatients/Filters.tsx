import React, {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AuthContext} from '../../../context/AuthContext'
import {
  ApiGetData,
  capitalizeFirstLetter,
  safeParseInt,
  validateList,
} from '../../../utils/ConstFunctions'
import {RootState} from '../../../redux/store'
import {postApiDataListActivePracticeLocation} from '../../../redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_DROPDOWN, SVG_DROPUP, SVG_FILTER} from '../../../utils/SvgConstants'
import compilanceType from '../../../@constants/compilanceType'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import {AxiosError} from 'axios'
type FilterOption = {
  label: string
  value: string
}

type FiltersProps<T extends FilterOption> = {
  getFilteredData: (list: any[]) => void
  filter: Record<T['value'], boolean>
  getPatientsData: () => void
}
const Filters = <T extends FilterOption>({
  getFilteredData,
  filter,
  getPatientsData,
}: FiltersProps<T>) => {
  const {GOOD, POOR, AVERAGE} = compilanceType
  const dispatch = useDispatch()
  const {userId} = useContext(AuthContext)
  const [isFilterOptionOpen, setIsFilterOptionOpen] = useState(false)
  const [filter1, setFilter1] = useState(false)
  const [filter2, setFilter2] = useState(false)
  const [filter3, setFilter3] = useState(false)
  const [practiceLocations, setPracticeLocationList] = useState<any[]>([])

  const [compilanceCheckList, setCompilanceCheckList] = useState<any>([])
  const [brandNameCheckList, setBrandNameCheckList] = useState<any>([])
  const [practiceLocationCheckList, setPracticeLocationCheckList] = useState<any>([])
  const [filterNumber, setFilterNumber] = useState<number>(0)
  const compilanceList = [GOOD, AVERAGE, POOR]
  const [brandNameList, setBrandNameList] = useState<any>([])

  useEffect(() => {
    if (
      compilanceCheckList.length > 0 ||
      brandNameCheckList.length > 0 ||
      practiceLocationCheckList.length > 0
    ) {
      setCompilanceCheckList([])
      setBrandNameCheckList([])
      setPracticeLocationCheckList([])
      getPatientsData()
    }
  }, [filter])

  const {loading: loadingListActivePracticeLocation, data: dataListActivePracticeLocation} =
    useSelector((state: RootState) => state.apiListActivePracticeLocation)

  const getClinics = () => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
      },
    }
    dispatch(postApiDataListActivePracticeLocation(postData) as any)
  }

  useEffect(() => {
    if (dataListActivePracticeLocation != null && !loadingListActivePracticeLocation) {
      const list: any = dataListActivePracticeLocation.practice_location_list

      const clinicList: any = []
      list.forEach((element: any) => {
        clinicList.push({
          value: element.practice_location_id,
          label: element.practice_location_name,
        })
      })
      setPracticeLocationList(clinicList)
    }
  }, [dataListActivePracticeLocation])

  useEffect(() => {
    getClinics()

    getCallBrandListAPI()
  }, [])

  const getCallBrandListAPI = () => {
    const payload = {
      doctorId: safeParseInt(userId),
    }
    dispatch(getApiDataProductionList({payload}) as any)
      .unwrap()
      .then((res: any) => {
        const list: any = []
        res.forEach((element: any) => {
          list.push(element.label)
        })
        setBrandNameList(list)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  const handleCompilanceCheck = (event: {target: {checked: any; value: any}}) => {
    let updatedList = [...compilanceCheckList]
    if (event.target.checked) {
      updatedList = [...compilanceCheckList, event.target.value]
    } else {
      updatedList.splice(compilanceCheckList.indexOf(event.target.value), 1)
    }
    setCompilanceCheckList(updatedList)
  }

  const handleBrandNameCheck = (event: {target: {checked: any; value: any}}) => {
    let updatedList = [...brandNameCheckList]
    if (event.target.checked) {
      updatedList = [...brandNameCheckList, event.target.value]
    } else {
      updatedList.splice(brandNameCheckList.indexOf(event.target.value), 1)
    }
    setBrandNameCheckList(updatedList)
  }

  const handlePracticeLocationCheck = (event: {target: {checked: any; value: any}}) => {
    let updatedList = [...practiceLocationCheckList]
    if (event.target.checked) {
      updatedList = [...practiceLocationCheckList, event.target.value]
    } else {
      updatedList.splice(practiceLocationCheckList.indexOf(event.target.value), 1)
    }
    setPracticeLocationCheckList(updatedList)
  }

  useEffect(() => {
    const number =
      compilanceCheckList.length + brandNameCheckList.length + practiceLocationCheckList.length
    setFilterNumber(number)
  }, [compilanceCheckList, brandNameCheckList, practiceLocationCheckList])

  const resetAll = () => {
    setCompilanceCheckList([])
    setBrandNameCheckList([])
    setPracticeLocationCheckList([])
    // setData(list)
  }
  const callFilterSubmit = () => {
    setIsFilterOptionOpen(!isFilterOptionOpen)
    const list = [compilanceCheckList, brandNameCheckList, practiceLocationCheckList]
    getFilteredData(list)
  }

  const isCompilanceChecked = (item: any) => (compilanceCheckList.includes(item) ? true : false)
  const isBrandNamChecked = (item: any) => (brandNameCheckList.includes(item) ? true : false)
  const isPracticeLocationChecked = (item: any) =>
    practiceLocationCheckList.includes(item) ? true : false

  return (
    <div className='relative' data-te-dropdown-position='start'>
      <button
        className='px-3.5 py-2.5 bg-primarySupport rounded-lg border border-primaryColor justify-center items-center gap-2 inline-flex'
        type='button'
        aria-expanded={isFilterOptionOpen}
        onClick={() => setIsFilterOptionOpen(!isFilterOptionOpen)}
      >
        <CommonSVG svg={SVG_FILTER} height='16' width='16' />
        <div className='text-primaryColor text-sm font-bold leading-tight tracking-tight'>
          Filters{filterNumber != 0 && '(' + filterNumber + ')'}
        </div>
      </button>
      {isFilterOptionOpen && (
        <div className='max-h-[450px] overflow-y-scroll p-5 absolute z-[1000] right-0 min-w-[max] overflow-hidden rounded-lg bg-white text-left text-base shadow-lg '>
          <div className='flex justify-between w-80 py-2'>
            <div className='text-black text-base font-semibold leading-tight'>Filters</div>
            <button
              className='text-textColor text-sm font-normal underline leading-tight'
              onClick={() => resetAll()}
            >
              Reset all
            </button>
          </div>
          <div className='w-80 rounded-lg shadow border border-mediumGray mb-3'>
            <div className='relative' data-te-dropdown-ref>
              <button
                className='flex w-[280px] py-2 mx-4 items-center justify-between border-b'
                type='button'
                onClick={() => setFilter1(!filter1)}
              >
                <div className='text-black text-sm font-semibold leading-tight'>Compliance</div>
                <CommonSVG svg={filter1 ? SVG_DROPDOWN : SVG_DROPUP} height='16' width='16' />
              </button>
              {filter1 && (
                <div className='list-container px-4 pb-3'>
                  {validateList(compilanceList) &&
                    compilanceList.map((item, index) => (
                      <div key={index} className='flex gap-2 items-center mt-2'>
                        <input
                          className='w-5 h-5 text-primaryColor'
                          value={item}
                          checked={isCompilanceChecked(item)}
                          type='checkbox'
                          onChange={handleCompilanceCheck}
                        />
                        <span
                          className={
                            isCompilanceChecked(item)
                              ? 'text-primaryColor text-sm font-medium'
                              : 'text-textColor text-sm font-normal'
                          }
                        >
                          {capitalizeFirstLetter(item)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className='w-80 rounded-lg shadow border border-mediumGray mb-3'>
            <div className='relative' data-te-dropdown-ref>
              <button
                className='flex w-[280px] py-2 mx-4 items-center justify-between border-b'
                type='button'
                onClick={() => setFilter2(!filter2)}
              >
                <div className='text-black text-sm font-semibold leading-tight'>Brand</div>
                <CommonSVG svg={filter2 ? SVG_DROPDOWN : SVG_DROPUP} height='16' width='16' />{' '}
              </button>
              {filter2 && (
                <div className='list-container px-4 pb-3'>
                  {brandNameList.map((item: any, index: number) => (
                    <div key={index} className='flex gap-2 items-center mt-2'>
                      <input
                        className='w-5 h-5 text-primaryColor'
                        value={item}
                        checked={isBrandNamChecked(item)}
                        type='checkbox'
                        onChange={handleBrandNameCheck}
                      />
                      <span
                        className={
                          isBrandNamChecked(item)
                            ? 'text-primaryColor text-sm font-medium'
                            : 'text-textColor text-sm font-normal'
                        }
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className='w-80 rounded-lg shadow border border-mediumGray mb-3'>
            <div className='relative' data-te-dropdown-ref>
              <button
                className='flex w-[280px] py-2 mx-4 items-center justify-between border-b'
                type='button'
                onClick={() => setFilter3(!filter3)}
              >
                <div className='text-black text-sm font-semibold leading-tight'>
                  Practice Location
                </div>
                <CommonSVG svg={filter3 ? SVG_DROPDOWN : SVG_DROPUP} height='16' width='16' />{' '}
              </button>
              {filter3 && (
                <div className='list-container px-4 pb-3'>
                  {practiceLocations.map((item: any, index: number) => (
                    <div key={index} className='flex gap-2 items-center mt-2'>
                      <input
                        className='w-5 h-5 text-primaryColor'
                        value={item.label}
                        checked={isPracticeLocationChecked(item.label)}
                        type='checkbox'
                        onChange={handlePracticeLocationCheck}
                      />
                      <span
                        className={
                          isPracticeLocationChecked(item.label)
                            ? 'text-primaryColor text-sm font-medium'
                            : 'text-textColor text-sm font-normal'
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className='flex gap-2 float-right'>
            <button
              onClick={() => setIsFilterOptionOpen(!isFilterOptionOpen)}
              className='w-fit h-9 px-3.5 rounded-lg border border-textColor'
            >
              <div className='text-textColor text-sm font-medium leading-tight'>Cancel</div>
            </button>
            <button
              className='w-full h-9 px-3.5 bg-primaryColor rounded-lg '
              onClick={() => callFilterSubmit()}
            >
              <div className='text-white text-sm font-semibold'>Apply Filters</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default Filters
