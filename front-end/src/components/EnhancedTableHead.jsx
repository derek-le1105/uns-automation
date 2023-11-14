import {TableCell, TableHead, TableRow, Checkbox, TableSortLabel, Box} from "@mui/material";
import { visuallyHidden } from '@mui/utils';

const EnhancedTableHead = (props) => {
    const { onSelectAllClick, sortOrder, orderBy, numSelected, rowCount, onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    const headCells = [
        {
          id: 'quantity',
          numeric: true,
          disablePadding: true,
          label: 'Quantity',
        },
        {
          id: 'name',
          numeric: false,
          disablePadding: false,
          label: 'Plant Name',
        },
        {
          id: 'barcode',
          numeric: false,
          disablePadding: false,
          label: 'Barcode',
        },
        {
          id: 'fullfillment_number',
          numeric: true,
          disablePadding: false,
          label: 'Fulfillment Number',
        },
        {
          id: 'vendor',
          numeric: false,
          disablePadding: false,
          label: 'Vendor',
        },
        { id: 'sku', numberic: false, disablePadding: false, label: 'SKU'}, 
        {id: 'customer_code', numberic: false, disablePadding: false, label: 'Customer Code'}
    ];
      
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? sortOrder : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? sortOrder : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  export default EnhancedTableHead
  