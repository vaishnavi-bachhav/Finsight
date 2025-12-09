import { useState } from "react";
import useSWR, { mutate } from "swr";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Formik } from "formik";
import * as Yup from "yup";

import TypeToggle from "../shared/TypeToggle.jsx";
import DeleteConfirmation from "../shared/DeleteConfirmation.jsx";

import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../api/transactionApi.js";

const swrFetcher = async () => await fetchTransactions();

export default function Transaction() {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: transactions = [], isLoading, error } = useSWR("transactions", swrFetcher);

  // --------------------
  // Validation Schema
  // --------------------
  const validationSchema = Yup.object({
    date: Yup.date().required("Date is required"),
    type: Yup.string().oneOf(["income", "expense"]).required(),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Amount is required")
      .min(0.01, "Amount must be greater than 0"),
    note: Yup.string().optional(),
  });

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
    await deleteTransaction(deleteTarget._id);
    mutate("transactions");
    setShowDeleteModal(false);
  };

  const handleSubmit = async (values, { resetForm }) => {
    if (editing) {
      await updateTransaction(editing._id, values);
    } else {
      await addTransaction(values);
    }
    mutate("transactions");
    resetForm();
    handleClose();
  };

  // ---------------------
  // Group by month
  // ---------------------
  const groups = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = d.toLocaleString("default", { month: "short", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  const sortedGroups = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Failed to load transactions.</p>;

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={() => setShow(true)}>+ New Transaction</Button>
      </div>

      {/* --------------------
          Modal Form
      -------------------- */}
      <Modal show={show} onHide={handleClose}>
        <Formik
          initialValues={{
            date: editing?.date || "",
            type: editing?.type || "expense",
            amount: editing?.amount || "",
            note: editing?.note || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, handleChange, values, errors, touched, setFieldValue }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {editing ? "Edit Transaction" : "Add Transaction"}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={values.date}
                    onChange={handleChange}
                    isInvalid={touched.date && !!errors.date}
                  />
                  <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                </Form.Group>

                <TypeToggle
                  name="type"
                  formik={{ values, errors, touched, setFieldValue }}
                  required
                />

                <Form.Group className="mb-3">
                  <Form.Label>Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    step="0.01"
                    value={values.amount}
                    onChange={handleChange}
                    isInvalid={touched.amount && !!errors.amount}
                  />
                  <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="note"
                    rows={3}
                    value={values.note}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editing ? "Save Changes" : "Add Transaction"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* --------------------
          Delete Modal
      -------------------- */}
      <DeleteConfirmation
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        deleteTarget={deleteTarget}
      />

      {/* --------------------
          Transactions Display
      -------------------- */}
      {sortedGroups.map((month) => (
        <div key={month} className="mb-4">
          <h4>{month}</h4>

          {groups[month].map((tx) => (
            <div
              key={tx._id}
              className="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <div>
                <strong>{new Date(tx.date).toLocaleDateString()}</strong>
                <div>{tx.type === "income" ? "Income" : "Expense"} · {tx.note || "—"}</div>
              </div>

              <div>
                <span
                  className={tx.type === "income" ? "text-success" : "text-danger"}
                >
                  {tx.type === "income" ? "+" : "-"}${tx.amount}
                </span>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="ms-3"
                  onClick={() => handleEdit(tx)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline-danger"
                  className="ms-2"
                  onClick={() => confirmDelete(tx)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
