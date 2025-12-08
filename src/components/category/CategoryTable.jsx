import { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "react-bootstrap/Button";
import TypeBadge from "../shared/TypeBadge.jsx";
import CONSTANTS from "../../data/constant.js";

export default function CategoryTable({ category, onEdit, onDelete }) {
    const [search, setSearch] = useState("");

    // -----------------------------
    // Prepare rows with Sr No + id
    // -----------------------------
    const rows = useMemo(
        () =>
            category.map((p, idx) => ({
                ...p,
                id: p.id, // DataGrid requires id
                srNo: idx + 1,
            })),
        [category]
    );

    // -----------------------------
    // Search Filter (by name)
    // -----------------------------
    const normalizedSearch = search.trim().toLowerCase();

    const filteredRows = useMemo(
        () =>
            !normalizedSearch
                ? rows
                : rows.filter((row) =>
                    row.name?.toLowerCase().includes(normalizedSearch)
                ),
        [rows, normalizedSearch]
    );

    // -----------------------------
    // Split by type AFTER filtering
    // -----------------------------
    const incomeRows = filteredRows.filter((r) => r.type === "income");
    const expenseRows = filteredRows.filter((r) => r.type === "expense");

    // -----------------------------
    // DataGrid Columns
    // -----------------------------
    const columns = [
        // Combined Icon + Name column
        {
            field: "category",
            headerName: "Category",
            width: 260,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const row = params.row;
                const icon = row.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE;

                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <img
                            src={`data:image/*;base64,${icon}`}
                            className="category-icon"
                            alt="icon"
                        />
                        <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                            {row.name}
                        </span>
                    </div>
                );
            },
        },

        {
            field: "type",
            headerName: "Type",
            width: 140,
            renderCell: (params) => <TypeBadge type={params.row.type} />,
        },

        {
            field: "actions",
            headerName: "Actions",
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
            {/* Filter Input */}
            <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                <h4 className="mb-0">Categories</h4>
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Income Table */}
            <h5 className="mt-3 mb-2">Income</h5>
            <div style={{ height: 300, width: "100%", marginBottom: "2rem" }}>
                <DataGrid
                    rows={incomeRows}
                    columns={columns}
                    pageSize={5}
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    localeText={{
                        noRowsLabel: "No income categories yet. Try adding one!"
                    }}
                />
            </div>

            {/* Expense Table */}
            <h5 className="mt-3 mb-2">Expense</h5>
            <div style={{ height: 300, width: "100%" }}>
                <DataGrid
                    rows={expenseRows}
                    columns={columns}
                    pageSize={5}
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    localeText={{
                        noRowsLabel: "No expense categories yet. Try adding one!"
                    }}
                />
            </div>
        </>
    );
}
