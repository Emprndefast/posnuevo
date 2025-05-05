import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

const EnhancedTable = ({
  columns,
  data,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onExport,
  onPrint,
  onRefresh,
  onSort,
  onFilter,
  selectedRows = [],
  onSelectRow,
  onSelectAllRows,
  pagination = true,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  onSearch,
  searchValue = '',
  actions = true,
  elevation = 1,
  sx = {},
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action, row) => {
    handleMenuClose();
    switch (action) {
      case 'view':
        onView?.(row);
        break;
      case 'edit':
        onEdit?.(row);
        break;
      case 'delete':
        onDelete?.(row);
        break;
      case 'export':
        onExport?.(row);
        break;
      case 'print':
        onPrint?.(row);
        break;
      default:
        break;
    }
  };

  return (
    <Paper 
      elevation={elevation}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        ...sx,
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              sx={{ 
                width: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onFilter && (
              <Tooltip title="Filtrar">
                <IconButton onClick={onFilter} size="small">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
            {onSort && (
              <Tooltip title="Ordenar">
                <IconButton onClick={onSort} size="small">
                  <SortIcon />
                </IconButton>
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title="Actualizar">
                <IconButton onClick={onRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      <TableContainer>
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }} 
          />
        )}
        <Table>
          <TableHead>
            <TableRow>
              {onSelectAllRows && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.length === data.length}
                    onChange={(e) => onSelectAllRows(e.target.checked)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={column.sortDirection}
                  sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={column.sortDirection !== false}
                      direction={column.sortDirection || 'asc'}
                      onClick={() => onSort?.(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0) + (onSelectAllRows ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0) + (onSelectAllRows ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography color="text.secondary">
                      No se encontraron resultados
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                  }}
                >
                  {onSelectAllRows && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectRow?.(row.id);
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      {column.render ? column.render(row[column.id], row) : row[column.id]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, row);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(e, newPage) => onPageChange?.(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {onView && (
          <MenuItem onClick={() => handleAction('view', selectedRow)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver detalles</ListItemText>
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction('edit', selectedRow)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => handleAction('delete', selectedRow)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        )}
        {onExport && (
          <MenuItem onClick={() => handleAction('export', selectedRow)}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Exportar</ListItemText>
          </MenuItem>
        )}
        {onPrint && (
          <MenuItem onClick={() => handleAction('print', selectedRow)}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Imprimir</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default EnhancedTable; 