// src/components/transaction/Transaction.jsx
import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Pagination from "react-bootstrap/Pagination";
import Alert from "react-bootstrap/Alert";
import { Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TypeToggle from "../shared/TypeToggle.jsx";
import DeleteConfirmation from "../shared/DeleteConfirmation.jsx";
import CONSTANTS from "../../data/constant.js";

import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../api/transactionApi.js";
import { fetchCategories, addCategory } from "../../api/categoryApi.js";

import {
  ListFilter,
  PlusCircle,
  CalendarRange,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from "lucide-react";

// ---- Helpers ---------------------------------------------------

const txFetcher = async () => await fetchTransactions();
const catFetcher = async () => await fetchCategories();

const formatMoney = (value = 0) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PAGE_SIZE = 3;

// Yup validation (blocks future dates)
const validationSchema = Yup.object({
  date: Yup.date()
    .max(new Date(), "Date cannot be in the future")
    .required("Date is required"),
  type: Yup.string()
    .oneOf(["income", "expense"], "Type is required")
    .required("Type is required"),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0.01, "Amount must be greater than 0"),
  categoryId: Yup.string().required("Category is required"),
  note: Yup.string().optional(),
});

export default function Transaction() {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);

  // inline quick-create category (inside tx modal)
  const [showQuickCat, setShowQuickCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatError, setQuickCatError] = useState("");
  const [quickCatLoading, setQuickCatLoading] = useState(false);

  const {
    data: grouped = [],
    isLoading,
    error,
  } = useSWR("transactions", txFetcher);

  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useSWR("categories", catFetcher);

  const getCategoriesByType = (type) => categories.filter((c) => c.type === type);

  const resetQuickCat = () => {
    setShowQuickCat(false);
    setQuickCatName("");
    setQuickCatError("");
    setQuickCatLoading(false);
  };

  const handleClose = () => {
    setEditing(null);
    setShow(false);
    resetQuickCat();
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    setShow(true);
    resetQuickCat();
  };

  const confirmDelete = (tx) => {
    setDeleteTarget(tx);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteTarget?._id) {
        await deleteTransaction(deleteTarget._id);
        mutate("transactions");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editing) {
        await updateTransaction(editing._id, values);
      } else {
        await addTransaction(values);
      }
      mutate("transactions");
      resetForm();
      handleClose();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // -------- Global quick stats ----------------------------------
  const globalStats = useMemo(() => {
    if (!grouped.length) return { totalIncome: 0, totalExpense: 0, net: 0 };

    let totalIncome = 0;
    let totalExpense = 0;

    grouped.forEach((m) => {
      totalIncome += m.totalIncome || 0;
      totalExpense += m.totalExpense || 0;
    });

    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  }, [grouped]);

  // ---------- Filtering & pagination -----------------------------

  useEffect(() => {
    setPage(1);
  }, [typeFilter, categoryFilter, monthFilter]);

  const filteredGroups = grouped.reduce((acc, group) => {
    if (monthFilter !== "all" && group.month !== monthFilter) return acc;

    const filteredTx = group.transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      if (categoryFilter !== "all") {
        if (!tx.category?._id) return false;
        if (tx.category._id !== categoryFilter) return false;
      }

      return true;
    });

    const filtersActive =
      typeFilter !== "all" || categoryFilter !== "all" || monthFilter !== "all";

    if (filtersActive && filteredTx.length === 0) return acc;

    acc.push({
      ...group,
      visibleTransactions: filteredTx.length ? filteredTx : group.transactions,
    });

    return acc;
  }, []);

  const totalPages =
    filteredGroups.length > 0 ? Math.ceil(filteredGroups.length / PAGE_SIZE) : 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [filteredGroups.length, page, totalPages]);

  const pagedMonths = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading || catLoading) return <p>Loading...</p>;
  if (error || catError) return <p className="text-danger">Failed to load data.</p>;

  return (
    <>
      {/* Top bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="mb-1 fw-semibold text-surface d-flex align-items-center gap-2">
            <CalendarRange size={20} />
            Transactions
          </h4>
          <small className="text-muted">
            Add, review, and manage your monthly income and expenses.
          </small>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <div className="mini-stat-pill">
            <ArrowUpCircle size={14} className="text-success me-1" />
            <span className="label">Total Income</span>
            <span className="value text-success">${formatMoney(globalStats.totalIncome)}</span>
          </div>
          <div className="mini-stat-pill">
            <ArrowDownCircle size={14} className="text-danger me-1" />
            <span className="label">Total Expense</span>
            <span className="value text-danger">${formatMoney(globalStats.totalExpense)}</span>
          </div>
          <div className="mini-stat-pill">
            <Wallet size={14} className="me-1" />
            <span className="label">Net</span>
            <span className={"value " + (globalStats.net >= 0 ? "text-success" : "text-danger")}>
              {globalStats.net >= 0 ? "+" : "-"}${formatMoney(Math.abs(globalStats.net))}
            </span>
          </div>

          <Button
            variant="primary"
            className="btn-gradient-main d-flex align-items-center ms-1"
            onClick={() => {
              setEditing(null);
              setShow(true);
              resetQuickCat();
            }}
          >
            <PlusCircle size={16} className="me-1" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="transaction-filters mb-4 p-3 rounded-4">
        <Row className="g-3 align-items-end">
          <Col xs={12} md={3}>
            <div className="d-flex align-items-center gap-1 mb-1">
              <ListFilter size={14} className="text-muted" />
              <Form.Label className="fw-semibold text-muted small mb-0">Type</Form.Label>
            </div>
            <Form.Select
              size="sm"
              className="dark-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All types</option>
              <option value="income">Income only</option>
              <option value="expense">Expense only</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={4}>
            <Form.Label className="fw-semibold text-muted small">Category</Form.Label>
            <Form.Select
              size="sm"
              className="dark-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} md={3}>
            <Form.Label className="fw-semibold text-muted small">Month</Form.Label>
            <Form.Select
              size="sm"
              className="dark-input"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">All months</option>
              {grouped.map((g) => (
                <option key={g.month} value={g.month}>
                  {g.month}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} md={2} className="text-md-end">
            <Button
              size="sm"
              variant="outline-secondary"
              className="btn-soft-dark w-100"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setMonthFilter("all");
              }}
            >
              Reset filters
            </Button>
          </Col>
        </Row>
      </div>

      {/* Modal Form */}
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="dark-modal"
        backdrop="static"
        dialogClassName="dark-modal-dialog"
        backdropClassName="dark-modal-backdrop"
      >
        <Formik
          initialValues={{
            date: editing ? new Date(editing.date).toISOString().slice(0, 10) : "",
            type: editing?.type || "income",
            amount: editing?.amount ?? "",
            note: editing?.note || "",
            categoryId: editing?.categoryId?.toString() || editing?.category?._id || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, handleChange, values, errors, touched, setFieldValue }) => {
            const typeCategories = getCategoriesByType(values.type);
            const hasCategoriesForType = typeCategories.length > 0;

            const createCategoryInline = async () => {
              setQuickCatError("");

              const name = quickCatName.trim();
              if (!name) {
                setQuickCatError("Category name is required.");
                return;
              }

              // basic uniqueness check in UI (for the selected type)
              const exists = typeCategories.some(
                (c) => c.name?.toLowerCase() === name.toLowerCase()
              );
              if (exists) {
                setQuickCatError("A category with this name already exists.");
                return;
              }

              try {
                setQuickCatLoading(true);

                const res = await addCategory({
                  name,
                  type: values.type, // lock to selected tx type
                  icon: CONSTANTS.DEFAULT_CATEGORY_IMAGE,       // default icon
                });

                await mutate("categories");

                // Try to pick the inserted id from Mongo insert result
                const newId =
                  res?.insertedId || res?.insertedId?.toString?.() || res?.insertedId;

                // Fallback: find by name after revalidate (works even if API doesn't return insertedId)
                const updatedCats = await fetchCategories();
                const created = updatedCats.find(
                  (c) =>
                    c.type === values.type &&
                    c.name?.toLowerCase() === name.toLowerCase()
                );

                const finalId = created?._id || newId;

                if (finalId) {
                  setFieldValue("categoryId", finalId);
                }

                setQuickCatName("");
                setShowQuickCat(false);
              } catch (e) {
                console.error("Create category failed:", e);
                setQuickCatError("Failed to create category. Please try again.");
              } finally {
                setQuickCatLoading(false);
              }
            };

            // If type changes, reset category selection (and quick-cat errors)
            // (prevents selecting an income category for expense, etc.)
            const handleTypeChangeCleanup = (newType) => {
              setFieldValue("type", newType);
              setFieldValue("categoryId", "");
              setQuickCatError("");
              setShowQuickCat(false);
              setQuickCatName("");
            };

            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton className="dark-modal-header">
                  <Modal.Title className="text-surface">
                    {editing ? "Edit transaction" : "Add transaction"}
                  </Modal.Title>
                </Modal.Header>

                <Modal.Body className="dark-modal-body">
                  {/* Date */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold required-label">Date</Form.Label>
                    <DatePicker
                      selected={values.date ? new Date(values.date) : null}
                      onChange={(date) =>
                        setFieldValue("date", date ? date.toISOString().slice(0, 10) : "")
                      }
                      className={`form-control dark-input ${
                        touched.date && errors.date ? "is-invalid" : ""
                      }`}
                      placeholderText="Select date"
                      calendarClassName="dark-datepicker"
                      maxDate={new Date()}
                      dateFormat="MM/dd/yyyy"
                    />
                    {touched.date && errors.date && (
                      <div className="invalid-feedback d-block">{errors.date}</div>
                    )}
                  </Form.Group>

                  {/* Type (with cleanup) */}
                  <TypeToggle
                    name="type"
                    formik={{
                      values,
                      errors,
                      touched,
                      setFieldValue: (name, val) => {
                        if (name === "type") handleTypeChangeCleanup(val);
                        else setFieldValue(name, val);
                      },
                    }}
                    required
                  />

                  {/* Category */}
                  <Form.Group className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <Form.Label className="fw-bold required-label mb-1">
                        Category
                      </Form.Label>

                      <button
                        type="button"
                        className="btn btn-sm btn-soft-dark"
                        onClick={() => {
                          setQuickCatError("");
                          setShowQuickCat((s) => !s);
                        }}
                      >
                        + Add category
                      </button>
                    </div>

                    {/* (1) Empty-state guidance */}
                    {!hasCategoriesForType && !showQuickCat && (
                      <Alert variant="dark" className="mt-2 mb-0 small">
                        No <b>{values.type}</b> categories found. Create one to continue.
                        <div className="mt-2">
                          <Button
                            size="sm"
                            className="btn-gradient-main"
                            type="button"
                            onClick={() => setShowQuickCat(true)}
                          >
                            Create {values.type} category
                          </Button>
                        </div>
                      </Alert>
                    )}

                    {/* (2) Inline quick-create */}
                    {showQuickCat && (
                      <div className="mt-2 p-3 rounded-4" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="small text-muted">
                            New <b className="text-surface">{values.type}</b> category
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-soft-dark"
                            onClick={() => {
                              setShowQuickCat(false);
                              setQuickCatName("");
                              setQuickCatError("");
                            }}
                          >
                            Close
                          </button>
                        </div>

                        <Form.Control
                          className="dark-input"
                          placeholder="Category name (e.g. Rent, Salary)"
                          value={quickCatName}
                          onChange={(e) => setQuickCatName(e.target.value)}
                          disabled={quickCatLoading}
                        />

                        {quickCatError && (
                          <div className="text-danger small mt-2">{quickCatError}</div>
                        )}

                        <div className="d-flex gap-2 mt-3">
                          <Button
                            type="button"
                            className="btn-gradient-main"
                            size="sm"
                            disabled={quickCatLoading}
                            onClick={createCategoryInline}
                          >
                            {quickCatLoading ? "Creating..." : "Create category"}
                          </Button>

                          <Button
                            type="button"
                            className="btn-soft-dark"
                            size="sm"
                            disabled={quickCatLoading}
                            onClick={() => {
                              setShowQuickCat(false);
                              setQuickCatName("");
                              setQuickCatError("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Category dropdown */}
                    <Form.Select
                      name="categoryId"
                      value={values.categoryId}
                      onChange={handleChange}
                      isInvalid={touched.categoryId && !!errors.categoryId}
                      className="dark-input mt-2"
                      disabled={!hasCategoriesForType}
                    >
                      <option value="">
                        {hasCategoriesForType ? "Select category" : "Create a category first"}
                      </option>
                      {typeCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {errors.categoryId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Amount */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold required-label">Amount ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      step="0.01"
                      value={values.amount}
                      onChange={handleChange}
                      isInvalid={touched.amount && !!errors.amount}
                      className="dark-input"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Note */}
                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="note"
                      value={values.note}
                      onChange={handleChange}
                      className="dark-input"
                      placeholder="Optional description (e.g. Grocery run, Salary, Rent)"
                    />
                  </Form.Group>
                </Modal.Body>

                <Modal.Footer className="dark-modal-footer">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleClose}
                    className="btn-soft-dark"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    className="btn-gradient-main"
                    disabled={!hasCategoriesForType} // prevents submit when no categories exist
                  >
                    {editing ? "Save changes" : "Add transaction"}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      <DeleteConfirmation
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        deleteTarget={deleteTarget}
      />

      {/* Month cards (unchanged) */}
      {pagedMonths.map(
        ({ month, transactions, totalIncome, totalExpense, net, visibleTransactions }) => (
          <div key={month} className="transaction-card mb-4 shadow-sm">
            <div className="transaction-header d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
              <div className="d-flex flex-column">
                <h5 className="mb-0 fw-semibold text-surface">{month}</h5>
                <span className="small text-muted">
                  {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-3 text-end small">
                <div>
                  <div className="text-muted">Income</div>
                  <div className="fw-semibold text-success">${formatMoney(totalIncome)}</div>
                </div>
                <div>
                  <div className="text-muted">Expense</div>
                  <div className="fw-semibold text-danger">${formatMoney(totalExpense)}</div>
                </div>
                <div>
                  <div className="text-muted">Net</div>
                  <div className={net >= 0 ? "fw-semibold text-success" : "fw-semibold text-danger"}>
                    {net >= 0 ? "+" : "-"}${formatMoney(Math.abs(net))}
                  </div>
                </div>
              </div>
            </div>

            <div className="list-group list-group-flush transaction-list">
              {(visibleTransactions || transactions).map((tx, index, arr) => (
                <div
                  key={tx._id}
                  className={
                    "list-group-item transaction-list-item d-flex justify-content-between align-items-center px-4 " +
                    (index === arr.length - 1 ? "pb-3" : "")
                  }
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="transaction-icon-wrapper">
                      {tx.category?.icon ? (
                        <img
                          src={`data:image/*;base64,${tx.category.icon}`}
                          alt={tx.category.name}
                          className="transaction-icon"
                        />
                      ) : (
                        <div className="transaction-icon placeholder-icon" />
                      )}
                    </div>

                    <div>
                      <div className="fw-semibold text-surface">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>

                      <div className="text-muted small mb-1">
                        {tx.type === "income" ? "Income" : "Expense"} ·{" "}
                        {tx.category?.name || "Uncategorized"}
                      </div>

                      {tx.note && (
                        <div className="text-muted small">
                          <span className="fw-semibold">Note:</span> {tx.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-end d-flex flex-column align-items-end gap-2 ms-3">
                    <div className={tx.type === "income" ? "fw-semibold text-success" : "fw-semibold text-danger"}>
                      {tx.type === "income" ? "+" : "-"}${formatMoney(tx.amount)}
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="btn-soft-dark"
                        onClick={() => handleEdit(tx)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="btn-soft-danger"
                        onClick={() => confirmDelete(tx)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(visibleTransactions || transactions).length === 0 && (
                <div className="list-group-item transaction-list-item text-muted small px-4 pb-3">
                  No transactions matching the selected filters for this month.
                </div>
              )}
            </div>
          </div>
        )
      )}

      {filteredGroups.length === 0 && (
        <div className="text-center text-muted mt-5">
          <p className="mb-1">No transactions match your filters.</p>
          <p className="small">Try adjusting or clearing the filters above.</p>
        </div>
      )}

      {filteredGroups.length > 0 && totalPages > 1 && (
        <Pagination className="justify-content-center mt-3 pagination-dark">
          <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
              {p}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </Pagination>
      )}
    </>
  );
}