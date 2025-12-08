import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function DeleteConfirmation({ show, onCancel, onConfirm, deleteTarget }) {
    return (
        <>
            <Modal show={show} onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are about to delete <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}