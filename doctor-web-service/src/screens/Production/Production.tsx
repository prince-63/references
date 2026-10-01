import {useContext, useEffect, useState} from 'react'
import useFilter from '@hooks/useFilter'
import Header from './components/Header'
import ProductionMainBody from './components/ProductionMainBody'
import {ProductionFilterOption} from './types/productionModule.types'
import {AuthContext} from 'context/AuthContext'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import {postApiDataDoctorAllBrandList} from 'redux/Slices/AppSlice/DoctorProfile/DoctorAllBrandList'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ProductionFilterSection from './components/productionFilterSection/ProductionFilterSection'
import productionStatusFilterOptions from '@staticData/productionStatusFilterOptions'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import {IProductionOrder} from './types/productionOrders.interface'
import {useLocation} from 'react-router-dom'
import {postApiDataProductionSlice} from 'redux/Slices/AppSlice/production/production.slice'
import {ThunkDispatch} from 'redux-thunk'
import {AnyAction} from '@reduxjs/toolkit'
import AlignerTrackingNonResponsive from 'assets/images/AlignerTrackingNonResponsive'
import hasValue from 'utils/hasValue'

const Production = () => {
  const {productionOrders, filteredOrders, loading} = useSelector(
    (state: RootState) => state.production
  )
  const {filter, handleFilterChange} = useFilter<ProductionFilterOption>(
    productionStatusFilterOptions
  )
  const location = useLocation()
  const {patientName} = location.state || {patientName: ''}
  const [searchName, setSearchName] = useState<string>(patientName || '')
  const [searchedResults, setSearchResults] = useState<IProductionOrder[]>([])
  const {userId}: any = useContext(AuthContext)
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch()

  const handleSearch = (e: any) => {
    setSearchName(e.target.value)
    filterOnSearch()
  }

  const filterOnSearch = () => {
    const searchedOrders = filteredOrders?.filter((order) => {
      const fullName = `${order.patient.first_name} ${order.patient.last_name}`.toLowerCase()
      return fullName.includes(searchName.toLowerCase())
    })
    setSearchResults(searchedOrders || [])
  }

  const getProductionOrders = async () => {
    dispatch(
      postApiDataProductionSlice({
        status: '',
        doctorId: safeParseInt(userId),
      })
    )
  }
  useEffect(() => {
    filterOnSearch()
  }, [filteredOrders])
  useEffect(() => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
      },
    }
    dispatch(postApiDataDoctorAllBrandList(postData))
    getProductionOrders()
  }, [])
  const {data: brandList} = useSelector((state: RootState) => {
    return state.apiDoctorAllBrandList
  })

  return (
    <div className='flex flex-col gap-5 '>
      <Header filter={filter} />

      <div className='flex flex-col items-center md:hidden text-textColor h-[calc(100vh-21rem)] pt-40'>
        <AlignerTrackingNonResponsive />
        <div className='flex flex-col'>
          <p className='text-base font-semibold'>This content is best viewed on web</p>
          <p className='text-sm font-normal gap-1'>For a better experience switch to your pc.</p>
        </div>
      </div>

      <div className='md:block hidden'>
        <ProductionFilterSection
          onSearch={handleSearch}
          {...{
            searchName,
            handleFilterChange,
            filter,
            brandList,
            totalOrders: productionOrders?.total_orders,
            setSearchName,
          }}
        />
        <When isTrue={loading}>
          <div className='flex flex-col justify-center items-center gap-5 h-[37rem]'>
            <Spinner loading />
          </div>
        </When>
        <When isTrue={!loading}>
          <ProductionMainBody
            {...{
              filter,
              searchName,
              productionOrders: !hasValue(searchName) ? filteredOrders : searchedResults,
            }}
          />
        </When>
      </div>
    </div>
  )
}

export default Production
