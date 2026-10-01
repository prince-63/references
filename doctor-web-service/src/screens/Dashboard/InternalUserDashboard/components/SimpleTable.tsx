import React from 'react'

type Column<T> = {key: keyof T; header: string; className?: string}

type SimpleTableProps<T extends {id: string}> = {
  columns: Column<T>[]
  data: T[]
}

const SimpleTable = <T extends {id: string}>({columns, data}: SimpleTableProps<T>) => {
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 bg-white text-sm'>
          {data.map((row) => (
            <tr key={row.id} className='hover:bg-gray-50'>
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-2 text-gray-700 ${col.className ?? ''}`}
                >
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SimpleTable
