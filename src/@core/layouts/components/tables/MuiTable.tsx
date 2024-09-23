import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function MuiTable(props: any) {
  const { columns, data, options } = props

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,

    // enableColumnFilters: false,
    // enablePagination: false,

    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    ...options,
    initialState: {
      density: 'compact',
      ...options?.initialState
    }
  })

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />
    </LocalizationProvider>
  )
}
MuiTable.defaultProps = {
  options: {}
}

export default MuiTable
