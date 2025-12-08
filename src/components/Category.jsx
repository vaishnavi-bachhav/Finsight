import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { profiles } from '../data/data.js';

export default function Category() {
    // -----------------------------
    // DataGrid Columns
    // -----------------------------
    const [people, _] = useState(profiles);

    const rowsWithSr = people.map((p, idx) => ({ ...p, srNo: idx + 1 }));

    const columns = [
        { field: 'srNo', headerName: 'Sr No', width: 90, sortable: false, filterable: false },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'likes', headerName: 'Likes', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            filterable: false,
            // renderCell: (params) => (
            //     <>
            //         {/* <Button variant="outline-primary" size="sm" className="me-2" onClick={() => onEdit(params.row)}>Edit</Button> */}
            //         {/* <Button variant="outline-danger" size="sm" className="me-2" onClick={() => onDelete(params.row)} */}
            //         {/* >Delete</Button> */}
            //     </>
            // )
        }
    ];
     return (
        <div style={{ height: 300, width: '100%' }}>
            <DataGrid rows={rowsWithSr} columns={columns} pageSize={5} disableRowSelectionOnClick />
        </div>
    )
}