import {
  FRONT_SIDE_SMILE_SIMULATION,
  LEFT_SIDE_SMILE_SIMULATION,
  RIGHT_SIDE_SMILE_SIMULATION,
} from 'utils/ImageConst'

const InfoSmileSimulation = () => {
  return (
    <div className='w-full'>
      <div className='w-full text-2xl font-semibold'>Smile Simulation </div>
      <div className='font-normal text-textColor'>
        Upload an image to see the simulated result. The image is processed to display the before
        and after comparison.
      </div>
      <div className='w-full h-full border border-mediumGray rounded-lg'>
        <table className='table-auto w-full curved-table h-full'>
          <thead>
            <tr className='bg-gray-100 text-gray-800'>
              <th colSpan={3} className='p-1 border-b border-gray-300'>
                Examples
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className='flex justify-evenly'>
              <td>
                <ExamplePhoto src={RIGHT_SIDE_SMILE_SIMULATION} title='Right side ' />
              </td>
              <td>
                <ExamplePhoto src={FRONT_SIDE_SMILE_SIMULATION} title='Front' />
              </td>
              <td>
                <ExamplePhoto src={LEFT_SIDE_SMILE_SIMULATION} title='Left side' />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InfoSmileSimulation

const ExamplePhoto = ({src, title}: {src: string; title: string}) => {
  return (
    <div className='flex flex-col justify-center items-center m-2'>
      <img className='w-24 h-14 border-mediumGray rounded-lg' src={src} />
      <p className='text-sm font-medium'>{title}</p>
    </div>
  )
}
