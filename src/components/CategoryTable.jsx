import { DataGrid } from '@mui/x-data-grid';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

export default function CategoryTable({ category, onEdit, onDelete }) {
    // -----------------------------
    // Split data by type
    // -----------------------------
    const incomeRows = category
        .filter((p) => p.type === 'income')
        .map((p, idx) => ({ ...p, id: p.id, srNo: idx + 1 }));

    const expenseRows = category
        .filter((p) => p.type === 'expense')
        .map((p, idx) => ({ ...p, id: p.id, srNo: idx + 1 }));

    // -----------------------------
    // DataGrid Columns
    // -----------------------------
    const columns = [
        { field: 'srNo', headerName: 'Sr No', width: 90, sortable: false, filterable: false },

        {
            field: 'icon',
            headerName: 'Icon',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const icon = params.row.icon;

                return icon ? (
                    <img
                        src={`data:image/*;base64,${icon}`}
                        alt="icon"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 4,
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                        No Icon
                    </span>
                );
            },
        },

        { field: 'name', headerName: 'Name', width: 150 },

        // -----------------------------
        // TYPE AS BADGE (Green/Red)
        // -----------------------------
        {
            field: 'type',
            headerName: 'Type',
            width: 140,
            renderCell: (params) => {
                const type = params.row.type;
                const isIncome = type === "income";

                return (
                    <Badge
                        bg={isIncome ? "success" : "danger"}
                        pill
                        style={{
                            fontSize: "0.85rem",
                            padding: "6px 12px",
                            textTransform: "capitalize",
                        }}
                    >
                        {type}
                    </Badge>
                );
            },
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 160,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => onEdit(params.row)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(params.row)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            {/* Income Table */}
            <h4 className="mt-3 mb-2">Income</h4>
            <div style={{ height: 300, width: '100%', marginBottom: '2rem' }}>
                <DataGrid
                    rows={incomeRows}
                    columns={columns}
                    pageSize={5}
                    disableRowSelectionOnClick
                />
            </div>

            {/* Expense Table */}
            <h4 className="mt-3 mb-2">Expense</h4>
            <div style={{ height: 300, width: '100%' }}>
                <DataGrid
                    rows={expenseRows}
                    columns={columns}
                    pageSize={5}
                    disableRowSelectionOnClick
                />
            </div>
        </>
    );
}
