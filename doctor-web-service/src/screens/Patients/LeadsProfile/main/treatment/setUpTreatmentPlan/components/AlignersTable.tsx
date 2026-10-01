import jawTypeOptions from '@staticData/jawTypeOptions'
import ColorIcon from 'components/colorIcon/ColorIcon'

type AlignersTableProps = {
  selectedUpperBoxes: number[]
  selectedLowerBoxes: number[]
}

const AlignersTable: React.FC<AlignersTableProps> = ({selectedUpperBoxes, selectedLowerBoxes}) => {
  const allAligners = [...Array.from(new Set([...selectedUpperBoxes, ...selectedLowerBoxes]))].sort(
    (a, b) => a - b
  )

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col gap-2 '>
        <p className=' text-black md:font-semibold text-base font-semibold md:text-xl'>
          Final aligner table
        </p>
        <div className='flex gap-3 text-sm font-medium '>
          {jawTypeOptions.map((jawType, index) => (
            <div key={index} className='flex justify-center items-center gap-1'>
              <ColorIcon color={jawType.color} />
              <p style={{color: jawType.color}}>{jawType.label} jaw</p>
            </div>
          ))}
        </div>
      </div>
      <div className='overflow-x-auto card-wrapper  '>
        <table className='block w-1 '>
          <tbody className=''>
            <tr>
              <th className='border border-mediumGray '>
                <div className=' font-semibold text-sm w-20 h-14  flex justify-center items-center '>
                  Aligner
                </div>
              </th>
              {allAligners.map((aligner, index) => {
                const type =
                  selectedUpperBoxes.includes(aligner) && selectedLowerBoxes.includes(aligner)
                    ? 'B'
                    : selectedUpperBoxes.includes(aligner)
                      ? 'U'
                      : 'L'

                const className =
                  type === 'U'
                    ? 'text-secondaryColor bg-secondarySupport'
                    : type === 'L'
                      ? 'bg-primarySupport text-primaryColor'
                      : 'bg-lightOrange text-[#BE8901]'
                return (
                  <td key={index} className={`  ${className} border border-mediumGray  `}>
                    <div className='w-14 h-14 flex justify-center items-center '>{aligner}</div>
                  </td>
                )
              })}
            </tr>
            <tr>
              <th className='border border-mediumGray '>
                <div className=' font-semibold text-sm w-20 h-14 flex justify-center items-center'>
                  Type
                </div>
              </th>
              {allAligners.map((aligner, index) => {
                const type =
                  selectedUpperBoxes.includes(aligner) && selectedLowerBoxes.includes(aligner)
                    ? 'B'
                    : selectedUpperBoxes.includes(aligner)
                      ? 'U'
                      : 'L'

                const className =
                  type === 'U'
                    ? 'text-secondaryColor bg-secondarySupport'
                    : type === 'L'
                      ? 'bg-primarySupport text-primaryColor'
                      : 'bg-lightOrange text-[#BE8901]'

                return (
                  <td key={index} className={`  ${className} border  border-mediumGray`}>
                    <div className='w-14 h-14 flex justify-center items-center'>{type}</div>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AlignersTable
