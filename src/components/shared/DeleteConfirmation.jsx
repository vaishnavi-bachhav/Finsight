// src/components/shared/DeleteConfirmation.jsx
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function DeleteConfirmation({
  show,
  onCancel,
  onConfirm,
  deleteTarget,
}) {
  if (!deleteTarget) return null;

  // Detect category vs transaction
  const isCategory = !("amount" in deleteTarget);

  // Transaction summary (only if transaction)
  const transactionSummary =
    !isCategory &&
    `${deleteTarget.type === "income" ? "Income" : "Expense"} · ${
      deleteTarget.category?.name || "Uncategorized"
    } · $${Number(deleteTarget.amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const dateLabel =
    !isCategory &&
    deleteTarget.date &&
    new Date(deleteTarget.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Modal show={show} onHide={onCancel} centered className="dark-modal">
      <Modal.Header closeButton className="dark-modal-header">
        <Modal.Title className="text-surface">
          {isCategory ? "Delete category?" : "Delete transaction?"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="dark-modal-body">
        <p className="mb-2">
          Are you sure you want to permanently delete this{" "}
          {isCategory ? "category" : "transaction"}?
        </p>

        {/* Category-specific warning */}
        {isCategory && (
          <div className="alert alert-warning py-2 px-3 small mb-2">
            ⚠️ Transactions using this category will be shown as{" "}
            <strong>Uncategorized</strong>.
          </div>
        )}

        {/* Transaction details */}
        {!isCategory && (transactionSummary || dateLabel) && (
          <div className="small text-muted">
            {transactionSummary}
            {dateLabel && ` · ${dateLabel}`}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="dark-modal-footer">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          className="btn-soft-dark"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          className="btn-soft-danger"
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
