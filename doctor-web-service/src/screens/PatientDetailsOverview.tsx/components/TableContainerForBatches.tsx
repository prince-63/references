import React, {useMemo} from 'react'
import {ProcessedManufacturingBatch} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'

// Type for each row in the table
export interface BatchTableRow {
  category: string
  product: string
  stages: string
  series: string
  quantity: number
}

interface TableContainerForBatchesProps {
  processed: ProcessedManufacturingBatch
}

export const TableContainerForBatches: React.FC<TableContainerForBatchesProps> = ({processed}) => {
  const {service_products, upperJaw, lowerJaw, totalAligners, product_name} = processed

  // service_products may be undefined; guard before accessing fields
  const product_category_name = service_products?.product_category_name ?? '-'

  const upperStages =
    upperJaw.start != null && upperJaw.end != null ? `${upperJaw.start}-${upperJaw.end}` : undefined

  const lowerStages =
    lowerJaw.start != null && lowerJaw.end != null ? `${lowerJaw.start}-${lowerJaw.end}` : undefined

  const upperSeries = 'Upper'
  const lowerSeries = 'Lower'

  const safeCount = (start?: number | null, end?: number | null): number =>
    start != null && end != null ? Math.max(0, end - start + 1) : 0

  const upperQty: number = safeCount(upperJaw.start, upperJaw.end)
  const lowerQty: number = safeCount(lowerJaw.start, lowerJaw.end)

  // use processed.total_aligners if available, otherwise fall back to totalAligners
  const providedTotal: number = (processed as any).total_aligners ?? totalAligners ?? 0

  const data = useMemo<BatchTableRow[]>(() => {
    const rows: BatchTableRow[] = []

    if (upperStages || upperQty > 0) {
      rows.push({
        category: product_category_name,
        product: product_name!,
        stages: upperStages ?? '-',
        series: upperSeries,
        quantity: upperQty,
      })
    }

    if (lowerStages || lowerQty > 0) {
      rows.push({
        category: product_category_name,
        product: product_name!,
        stages: lowerStages ?? '-',
        series: lowerSeries,
        quantity: lowerQty,
      })
    }

    if (rows.length === 0) {
      rows.push({
        category: product_category_name,
        product: product_name!,
        stages: '-',
        series: '-',
        quantity: providedTotal,
      })
    }

    return rows
  }, [
    product_category_name,
    product_name,
    upperStages,
    lowerStages,
    upperQty,
    lowerQty,
    providedTotal,
  ])

  const totalQuantity = useMemo(() => {
    const sum = data.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0)
    return providedTotal && providedTotal >= sum ? providedTotal : sum
  }, [data, providedTotal])

  const columns = useMemo<ColumnDef<BatchTableRow>[]>(
    () => [
      {
        id: 'category',
        accessorKey: 'category',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Category</div>} />
        ),
        cell: ({row}) => <RenderCell>{row.original.category}</RenderCell>,
        size: 160,
      },
      {
        id: 'product',
        accessorKey: 'product',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Product</div>} />
        ),
        cell: ({row}) => <RenderCell>{row.original.product}</RenderCell>,
        size: 200,
      },
      {
        id: 'stages',
        accessorKey: 'stages',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Stages</div>} />
        ),
        cell: ({row}) => <RenderCell>{row.original.stages}</RenderCell>,
        size: 120,
      },
      {
        id: 'series',
        accessorKey: 'series',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Series</div>} />
        ),
        cell: ({row}) => <RenderCell>{row.original.series}</RenderCell>,
        size: 120,
      },
      {
        id: 'quantity',
        accessorKey: 'quantity',
        header: () => (
          <RenderTableHeader className='w-full font-medium text-xs' header={<div>Quantity</div>} />
        ),
        cell: ({row}) => <RenderCell>{row.original.quantity}</RenderCell>,
        size: 100,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className='
    overflow-x-auto overflow-y-auto
    max-h-[60vh]   /* cap height so a vertical scrollbar can appear */
    scroll-smooth
    /* Visible, styled scrollbars (no Tailwind plugin needed) */
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-textColor
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
    [&::-webkit-scrollbar-thumb]:rounded-full
  '
      style={{scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent'}} // Firefox
    >
      <table className='min-w-full border border-gray-200 text-xs sm:text-sm'>
        <thead className='bg-gray-50'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className='border-b p-2 sm:p-3 text-left font-semibold text-gray-600'
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className='border-b p-2 sm:p-3'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length - 1} className='p-2 sm:p-3 text-right font-semibold'>
              Total:
            </td>
            <td className='p-2 sm:p-3 font-semibold'>{totalQuantity}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default TableContainerForBatches
