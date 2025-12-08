import { useState } from 'react';
import { profiles } from '../../data/data.js';
import CategoryTable from './CategoryTable.jsx';
import DeleteConfirmation from '../shared/DeleteConfirmation.jsx';
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Formik } from "formik";
import * as Yup from "yup";
import CONSTANTS from '../../data/constant.js';
import FormInput from '../shared/FormInput.jsx';
import TypeToggle from '../shared/TypeToggle.jsx';

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
        setIcon(category.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE);
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
            <div className="d-flex justify-content-end mb-3">
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingProfile(null);
                        setIcon('');
                        setShow(true);
                    }}
                >
                    + Add Category
                </Button>
            </div>

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
                                <p className='mb-2'>
                                    {editingProfile
                                        ? "Update your category details and keep your records clean."
                                        : "Create a new category to better organize your finances."}
                                </p>

                                {/* Name */}
                                <FormInput
                                    label="Name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter category name"
                                    formik={{ values, errors, touched, handleChange }}
                                    required={true}
                                />

                                {/* Type – pill toggle buttons */}
                                <TypeToggle
                                    name="type"
                                    formik={{
                                        values,
                                        errors,
                                        touched,
                                        setFieldValue,
                                    }}
                                    required={true}
                                />

                                {/* Icon (optional) */}
                                <Form.Group className="mb-3" controlId="formIcon">
                                    <Form.Label className='fw-bold'>Icon</Form.Label>
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
                deleteTarget={deleteTarget}
            />

            <CategoryTable
                category={people}
                onDelete={confirmDelete}
                onEdit={handleEdit}
            />
        </>
    );
}
