import hasValue from 'utils/hasValue'
import {ConditionalValueDiv} from './ConditionalValueDiv'
import {DataWrapper} from './DataWrapper'
import {PaymentDetail} from 'screens/Patients/LeadsProfile/main/payments/types/payments.types'
import moment from 'moment'

const PaymentSummary = ({payment_details}: {payment_details: any}) => {
  return (
    <div className=''>
      <DataWrapper
        isShow={true}
        title='Payment details'
        showBorder={hasValue(payment_details?.payments)}
      >
        <ConditionalValueDiv
          label='Total to be paid'
          value={hasValue(payment_details?.cost) ? '₹ ' + payment_details?.cost : null}
        />
        <ConditionalValueDiv
          label='Balance payment'
          value={
            hasValue(payment_details?.balance_payment)
              ? '₹ ' + payment_details?.balance_payment
              : null
          }
        />
      </DataWrapper>
      <DataWrapper
        isShow={hasValue(payment_details?.payments)}
        title='Payment list'
        showBorder={false}
      >
        {Object.entries(payment_details.payments).map(([date, paymentList]) => (
          <div key={date}>
            {(paymentList as PaymentDetail[]).map((element: PaymentDetail) => (
              <ConditionalValueDiv
                key={element.payment_id}
                label={element.name}
                value={
                  <div className='flex flex-wrap justify-start items-center gap-1'>
                    <div>{hasValue(element?.amount) ? '₹ ' + element?.amount : '-'}</div>
                    <div className='w-1 h-1 bg-black rounded-full md:block hidden'></div>
                    <div>{moment(element.date).format("dddd, DD MMM 'YY")}</div>
                  </div>
                }
              />
            ))}
          </div>
        ))}
      </DataWrapper>
    </div>
  )
}

export default PaymentSummary
