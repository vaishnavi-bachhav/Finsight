import { useState } from "react";
import useSWR, { mutate } from "swr";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import TypeToggle from "../shared/TypeToggle.jsx";
import DeleteConfirmation from "../shared/DeleteConfirmation.jsx";

import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../api/transactionApi.js";

import { fetchCategories } from "../../api/categoryApi.js";

// SWR fetchers
const txFetcher = async () => await fetchTransactions();
const catFetcher = async () => await fetchCategories();

export default function Transaction() {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Transactions come grouped from backend:
  // [{ month, transactions, totalIncome, totalExpense, net }, ...]
  const {
    data: grouped = [],
    isLoading,
    error,
  } = useSWR("transactions", txFetcher);

  // Categories (for dropdown)
  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useSWR("categories", catFetcher);

  // -----------------------------
  // Validation Schema
  // -----------------------------
  const validationSchema = Yup.object({
    date: Yup.date().required("Date is required"),
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

  // -----------------------------
  // Helpers
  // -----------------------------
  const handleClose = () => {
    setEditing(null);
    setShow(false);
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    setShow(true);
  };

  const confirmDelete = (tx) => {
    setDeleteTarget(tx);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTransaction(deleteTarget._id);
      mutate("transactions");
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
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

  const getCategoriesByType = (type) =>
    categories.filter((c) => c.type === type);

  // -----------------------------
  // Loading / Error
  // -----------------------------
  if (isLoading || catLoading) return <p>Loading...</p>;
  if (error || catError)
    return <p className="text-danger">Failed to load data.</p>;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <>
      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-semibold">Transactions</h4>
          <small className="text-muted">
            Track your income and expenses month by month.
          </small>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShow(true);
          }}
        >
          + New Transaction
        </Button>
      </div>

      {/* Modal Form */}
      <Modal show={show} onHide={handleClose}>
        <Formik
          initialValues={{
            date: editing
              ? new Date(editing.date).toISOString().slice(0, 10)
              : "",
            type: editing?.type || "expense",
            amount: editing?.amount ?? "",
            note: editing?.note || "",
            categoryId:
              editing?.categoryId?.toString() || editing?.category?._id || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldValue,
          }) => {
            const typeCategories = getCategoriesByType(values.type);

            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                  <Modal.Title>
                    {editing ? "Edit Transaction" : "Add Transaction"}
                  </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  {/* Date */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Date</Form.Label>
                    {/* <Form.Control
                      type="date"
                      name="date"
                      value={values.date}
                      onChange={handleChange}
                      isInvalid={touched.date && !!errors.date}
                    /> */}

                    <DatePicker
  selected={values.date ? new Date(values.date) : null}
  onChange={(date) =>
    setFieldValue("date", date.toISOString().slice(0, 10))
  }
  className="form-control"
  placeholderText="Select date"
/>

                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Type toggle */}
                  <TypeToggle
                    name="type"
                    formik={{ values, errors, touched, setFieldValue }}
                    required
                  />

                  {/* Category */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Category</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={values.categoryId}
                      onChange={handleChange}
                      isInvalid={touched.categoryId && !!errors.categoryId}
                    >
                      <option value="">Select category</option>
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
                    <Form.Label className="fw-bold">Amount ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      step="0.01"
                      value={values.amount}
                      onChange={handleChange}
                      isInvalid={touched.amount && !!errors.amount}
                    />
                  </Form.Group>

                  {/* Note */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="note"
                      value={values.note}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit">
                    {editing ? "Save Changes" : "Add Transaction"}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>

      {/* Delete modal */}
      <DeleteConfirmation
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        deleteTarget={deleteTarget}
      />

      {/* Month cards */}
      {grouped.map(({ month, transactions, totalIncome, totalExpense, net }) => (
        <div
          key={month}
          className="card mb-4 shadow-sm border-0 transaction-month"
        >
          {/* Card header */}
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0 fw-semibold">{month}</h5>
            </div>

            <div className="d-flex flex-wrap gap-3 text-end small">
              <div>
                <div className="text-muted">Income</div>
                <div className="fw-semibold text-success">
                  $
                  {Number(totalIncome).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted">Expense</div>
                <div className="fw-semibold text-danger">
                  $
                  {Number(totalExpense).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted">Net</div>
                <div
                  className={
                    net >= 0 ? "fw-semibold text-success" : "fw-semibold text-danger"
                  }
                >
                  {net >= 0 ? "+" : "-"}$
                  {Math.abs(net).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card body: transactions list */}
          <div className="list-group list-group-flush">
            {transactions.map((tx, index) => (
              <div
                key={tx._id}
                className={
                  "list-group-item d-flex justify-content-between align-items-center px-4 " +
                  (index === transactions.length - 1 ? "pb-3" : "")
                }
              >
                {/* LEFT: icon + text */}
                <div className="d-flex align-items-start gap-3">
                  {/* Icon */}
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
                    {/* Date */}
                    <div className="fw-semibold">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>

                    {/* Type · Category */}
                    <div className="text-muted small mb-1">
                      {tx.type === "income" ? "Income" : "Expense"} ·{" "}
                      {tx.category?.name || "Uncategorized"}
                    </div>

                    {/* Note */}
                    {tx.note && (
                      <div className="text-muted small">
                        <span className="fw-semibold">Note:</span> {tx.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: amount + actions */}
                <div className="text-end d-flex flex-column align-items-end gap-2 ms-3">
                  <div
                    className={
                      tx.type === "income"
                        ? "fw-semibold text-success"
                        : "fw-semibold text-danger"
                    }
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {Number(tx.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleEdit(tx)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => confirmDelete(tx)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="list-group-item text-muted small px-4 pb-3">
                No transactions recorded for this month yet.
              </div>
            )}
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <div className="text-center text-muted mt-5">
          <p className="mb-1">No transactions yet.</p>
          <p className="small">
            Click <strong>“New Transaction”</strong> to start tracking your money.
          </p>
        </div>
      )}
    </>
  );
}
