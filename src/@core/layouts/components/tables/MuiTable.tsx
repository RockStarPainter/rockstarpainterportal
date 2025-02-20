import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Box, Typography } from '@mui/material'

function MuiTable(props: any) {
  const { columns, data, options } = props

  const table = useMaterialReactTable({
    columns,
    data,

    // Basic Features
    enableColumnActions: false,
    enableSorting: true, // Enable sorting
    enableColumnFilters: true, // Enable filtering
    enablePagination: true, // Enable pagination
    enableDensityToggle: false,
    enableFullScreenToggle: true, // Enable full screen mode
    enableHiding: true, // Enable column hiding

    // Pagination settings
    paginationDisplayMode: 'pages',
    positionPagination: 'bottom',
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true
    },

    // Search and Filter settings
    enableGlobalFilter: true, // Enable global search
    enableFilterMatchHighlighting: true,
    globalFilterFn: 'contains',

    // Loading and Progress states
    muiLoadingOverlayProps: {
      sx: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(2px)' // Add blur effect when loading
      }
    },
    muiCircularProgressProps: {
      sx: { color: 'primary.main' },
      size: 40
    },

    // Empty state handling
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px'
        }}
      >
        <Typography variant='body1' color='text.secondary'>
          No records found
        </Typography>
      </Box>
    ),

    // Row styling
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          transition: 'background-color 0.2s ease'
        }
      }
    }),

    // Table styling
    muiTablePaperProps: {
      sx: {
        borderRadius: '10px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    },

    // Header styling
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        fontWeight: 'bold'
      }
    },

    // Initial state
    initialState: {
      density: 'compact',
      pagination: { pageSize: 20, pageIndex: 0 },
      showGlobalFilter: true,
      ...options?.initialState
    },

    // State from props
    ...options
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
