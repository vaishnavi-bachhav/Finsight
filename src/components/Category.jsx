import { useState } from 'react';
import { profiles } from '../data/data.js';
import CategoryTable from './CategoryTable.jsx';
import DeleteConfirmation from './DeleteConfirmation.jsx';
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Formik } from "formik";
import * as Yup from "yup";
import CONSTANTS from '../data/constant.js';

export default function Category() {
    const [show, setShow] = useState(false);
    const [people, setPeople] = useState(profiles);
    const [icon, setIcon] = useState('');
    const [editingProfile, setEditingProfile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // -----------------------------
    // Yup Validation Schema
    // -----------------------------
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required("Name is required")
            .test("unique-name", "Name must be unique", function (value) {
                if (!value) return false;
                const match = people.some(
                    p =>
                        p.name.toLowerCase() === value.toLowerCase() &&
                        (!editingProfile || p.id !== editingProfile.id)
                );
                return !match;
            }),
        type: Yup.string()
            .oneOf(["income", "expense"], "Type is required")
            .required("Type is required"),
    });

    // -----------------------------
    // Utility: open/close modals
    // -----------------------------
    const handleClose = () => {
        setShow(false);
        setEditingProfile(null);
        setIcon('');
    };

    const handleEdit = (category) => {
        setEditingProfile(category);
        setIcon(category.icon || '');
        setShow(true);
    };

    // -----------------------------
    // Delete Confirmation Logic
    // -----------------------------
    const confirmDelete = (person) => {
        setDeleteTarget(person);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        setPeople(ps => ps.filter(p => p.id !== deleteTarget.id));
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    // -----------------------------
    // Handle Icon Upload (to base64)
    // -----------------------------
    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setIcon('');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // reader.result = "data:image/...;base64,AAAA..."
            const base64 = reader.result.split(',')[1];
            setIcon(base64);
        };
        reader.readAsDataURL(file);
    };

    // -----------------------------
    // Form Submit via Formik
    // -----------------------------
    const handleFormSubmit = (values, { resetForm }) => {
        const iconToSave =
            icon ||
            editingProfile?.icon ||
            CONSTANTS.DEFAULT_CATEGORY_IMAGE;

        if (editingProfile) {
            // Update category
            setPeople(ps =>
                ps.map(p =>
                    p.id === editingProfile.id
                        ? { ...p, name: values.name, type: values.type, icon: iconToSave }
                        : p
                )
            );
        } else {
            // Add new category
            const newCategory = {
                id: people.length ? Math.max(...people.map(p => p.id)) + 1 : 1,
                name: values.name,
                type: values.type,
                icon: iconToSave,
                likes: 0
            };
            setPeople(ps => [...ps, newCategory]);
        }

        resetForm();
        handleClose();
    };

    return (
        <>
            <Button variant="primary" onClick={() => setShow(true)}>
                Add Category
            </Button>

            {/* Modal */}
            <Modal show={show} onHide={handleClose}>
                <Formik
                    initialValues={{
                        name: editingProfile ? editingProfile.name : "",
                        type: editingProfile ? editingProfile.type || "income" : "income",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleFormSubmit}
                    enableReinitialize
                >
                    {({
                        handleSubmit,
                        handleChange,
                        values,
                        errors,
                        touched,
                        setFieldValue,
                    }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    {editingProfile ? 'Edit Category' : 'Add Category'}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <p>
                                    {editingProfile
                                        ? "Update the category details below."
                                        : "Fill out the form below to add a new category."}
                                </p>

                                {/* Name */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Name</Form.Label>

                                    <Form.Control
                                        name="name"
                                        type="text"
                                        value={values.name}
                                        placeholder="Enter category name"
                                        onChange={handleChange}
                                        isInvalid={touched.name && !!errors.name}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Type – pill toggle buttons (Formik-controlled) */}
                                <Form.Group className="mb-3" controlId="formType">
                                    <Form.Label className="fw-bold d-block mb-2">Type</Form.Label>

                                    {/* keep this if you ever use FormData on the raw form */}
                                    <input type="hidden" name="type" value={values.type} />

                                    <div className="d-flex gap-2">

                                        {/* Income Button */}
                                        <Button
                                            type="button"
                                            variant={values.type === "income" ? "outline-success" : "outline-secondary"}
                                            className="rounded-pill d-flex align-items-center px-3 py-1"
                                            onClick={() => setFieldValue("type", "income")}
                                            style={{
                                                borderWidth: values.type === "income" ? 2 : 1,
                                                backgroundColor: values.type === "income" ? "rgba(25, 135, 84, 0.1)" : "",
                                            }}
                                        >
                                            <span
                                                className="me-2 d-inline-flex justify-content-center align-items-center"
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: "2px solid #198754",
                                                    backgroundColor: "rgba(25, 135, 84, 0.08)",
                                                    color: "#198754",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ↑
                                            </span>
                                            Income
                                        </Button>

                                        {/* Expense Button */}
                                        <Button
                                            type="button"
                                            variant={values.type === "expense" ? "outline-danger" : "outline-secondary"}
                                            className="rounded-pill d-flex align-items-center px-3 py-1"
                                            onClick={() => setFieldValue("type", "expense")}
                                            style={{
                                                borderWidth: values.type === "expense" ? 2 : 1,
                                                backgroundColor: values.type === "expense" ? "rgba(220, 53, 69, 0.1)" : "",
                                            }}
                                        >
                                            <span
                                                className="me-2 d-inline-flex justify-content-center align-items-center"
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: "50%",
                                                    border: "2px solid #dc3545",
                                                    backgroundColor: "rgba(220, 53, 69, 0.08)",
                                                    color: "#dc3545",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                ↓
                                            </span>
                                            Expense
                                        </Button>

                                    </div>

                                    {touched.type && errors.type && (
                                        <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                                            {errors.type}
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Icon (optional) */}
                                <Form.Group className="mb-3" controlId="formIcon">
                                    <Form.Label className='fw-bold'>Icon (optional)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconChange}
                                    />
                                    {icon && (
                                        <div className="mt-2">
                                            <span className="d-block mb-1">Preview:</span>
                                            <img
                                                src={`data:image/*;base64,${icon}`}
                                                alt="Icon preview"
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>

                                <Button variant="primary" type="submit">
                                    {editingProfile ? "Update" : "Save"}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirmation
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                deleteTarget={deleteTarget?.name}
            />

            {/* Table (pass onEdit if you want edit from grid) */}
            <CategoryTable
                category={people}
                onDelete={confirmDelete}
                onEdit={handleEdit}
            />
        </>
    );
}
