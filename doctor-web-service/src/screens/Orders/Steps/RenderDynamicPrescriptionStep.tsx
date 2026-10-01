import PrescriptionStep from './PrescriptionStep'
//import userOrderDetails from '../hooks/userOrderDetails'

const RenderDynamicPrescriptionStep = () => {
  //  const {order} = userOrderDetails(true)

  // If no prescription details, render EmbeddedDynamicPrescriptionForm

  // If prescriptionDetails exists but does not have data and form_id, render PrescriptionStep
  return <PrescriptionStep />
}

export default RenderDynamicPrescriptionStep
