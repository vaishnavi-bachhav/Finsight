// src/components/category/CategoryTable.jsx
import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import TypeBadge from "../shared/TypeBadge.jsx";
import CONSTANTS from "../../data/constant.js";

export default function CategoryTable({ category, onEdit, onDelete }) {
  const [typeFilter, setTypeFilter] = useState("all"); // all | income | expense

  // Normalize raw list into rows with stable id
  const rows = useMemo(
    () =>
      (category || []).map((p, idx) => ({
        ...p,
        id: p.id || p._id || idx, // fallback just in case
      })),
    [category]
  );

  // Filter by name + type
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesType =
          typeFilter === "all" ? true : row.type === typeFilter;

        return  matchesType;
      }),
    [rows, typeFilter]
  );

  return (
    <div className="category-section">
      {/* Filters row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
        {/* <div>
          <h5 className="mb-1 text-surface">All Categories</h5>
          <small className="text-muted">
            Filter by type or search by name.
          </small>
        </div> */}

        <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
          {/* Type filter pills */}
          <div className="btn-group" role="group" aria-label="Type filter">
            <button
              type="button"
              className={
                "btn btn-sm " +
                (typeFilter === "all" ? "btn-gradient-main" : "btn-soft-dark")
              }
              onClick={() => setTypeFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={
                "btn btn-sm " +
                (typeFilter === "income"
                  ? "btn-gradient-main"
                  : "btn-soft-dark")
              }
              onClick={() => setTypeFilter("income")}
            >
              Income
            </button>
            <button
              type="button"
              className={
                "btn btn-sm " +
                (typeFilter === "expense"
                  ? "btn-gradient-main"
                  : "btn-soft-dark")
              }
              onClick={() => setTypeFilter("expense")}
            >
              Expense
            </button>
          </div>

          {/* Search box */}
          {/* <input
            type="text"
            className="form-control dark-input"
            style={{ maxWidth: 260 }}
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          /> */}
        </div>
      </div>

      {/* Card + list (same style as transactions) */}
      <div className="transaction-card shadow-sm">
        <div className="list-group list-group-flush transaction-list">
          {filteredRows.length === 0 && (
            <div className="list-group-item transaction-list-item text-muted small px-4 py-3 text-center">
              No categories found. Try adjusting filters or create a new
              category.
            </div>
          )}

          {filteredRows.map((row) => {
            const icon = row.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE;

            return (
              <div
                key={row.id}
                className="list-group-item transaction-list-item d-flex justify-content-between align-items-center px-4 py-3"
              >
                {/* LEFT: icon + name + type */}
                <div className="d-flex align-items-center gap-3">
                  <div className="transaction-icon-wrapper">
                    <img
                      src={`data:image/*;base64,${icon}`}
                      alt={row.name}
                      className="transaction-icon"
                    />
                  </div>
                
              
                    
                        <div className="fw-semibold text-surface">{row.name}</div>
                        <div><TypeBadge type={row.type} /></div>
                
               
                </div>

                {/* RIGHT: actions */}
                <div className="d-flex gap-2 ms-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="btn-soft-dark"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="btn-soft-danger"
                    onClick={() => onDelete(row)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
