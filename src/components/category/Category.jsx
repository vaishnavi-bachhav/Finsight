import { useState } from "react";
import useSWR, { mutate } from "swr";
import CategoryTable from "./CategoryTable.jsx";
import DeleteConfirmation from "../shared/DeleteConfirmation.jsx";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Formik } from "formik";
import * as Yup from "yup";
import CONSTANTS from "../../data/constant.js";
import FormInput from "../shared/FormInput.jsx";
import TypeToggle from "../shared/TypeToggle.jsx";
import { fetchCategories } from "../../api/categoryApi.jsx";

// SWR fetcher
const swrFetcher = async () => await fetchCategories();

export default function Category() {
    const [show, setShow] = useState(false);
    const [icon, setIcon] = useState("");
    const [editingProfile, setEditingProfile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // -----------------------------
    // Load categories using SWR
    // -----------------------------
    const { data: people = [], error, isLoading } = useSWR("categories", swrFetcher);

    // -----------------------------
    // Validation Schema
    // -----------------------------
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required("Name is required")
            .test("unique-name", "Name must be unique", function (value) {
                if (!value) return false;

                return !people.some((p) => {
                    const isSameRecord =
                        editingProfile &&
                        (p.id === editingProfile.id || p._id === editingProfile._id);

                    if (isSameRecord) return false;

                    return p.name.toLowerCase() === value.toLowerCase();
                });
            }),
        type: Yup.string()
            .oneOf(["income", "expense"], "Type is required")
            .required("Type is required"),
    });


    const handleClose = () => {
        setShow(false);
        setIcon("");
        setEditingProfile(null);
    };

    const handleEdit = (category) => {
        setEditingProfile(category);
        setIcon(category.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE);
        setShow(true);
    };

    const confirmDelete = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        // Local update for now — can be replaced with API
        const updated = people.filter((p) => p.id !== deleteTarget.id);

        mutate("categories", updated, false); // update local cache instantly
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    // Convert icon to base64
    const handleIconChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return setIcon("");

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            setIcon(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleFormSubmit = (values, { resetForm }) => {
        const iconToSave = icon || editingProfile?.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE;

        let updatedList;

        if (editingProfile) {
            updatedList = people.map((p) =>
                p.id === editingProfile.id
                    ? { ...p, name: values.name, type: values.type, icon: iconToSave }
                    : p
            );
        } else {
            const newCategory = {
                id: people.length ? Math.max(...people.map((p) => p.id)) + 1 : 1,
                name: values.name,
                type: values.type,
                icon: iconToSave,
                likes: 0,
            };

            updatedList = [...people, newCategory];
        }

        // Update local SWR cache instantly
        mutate("categories", updatedList, false);

        resetForm();
        handleClose();
    };

    // -----------------------------
    // Loading & Error States
    // -----------------------------
    if (isLoading) return <p>Loading categories...</p>;
    if (error) return <p className="text-danger">Failed to load categories.</p>;

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingProfile(null);
                        setIcon("");
                        setShow(true);
                    }}
                >
                    + New Category
                </Button>
            </div>

            {/* Category Form Modal */}
            <Modal show={show} onHide={handleClose}>
                <Formik
                    initialValues={{
                        name: editingProfile?.name || "",
                        type: editingProfile?.type || "income",
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
                                    {editingProfile ? "Edit Category" : "Create New Category"}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {editingProfile
                                    ? "Update your category details and keep your records clean."
                                    : "Create a new category to better organize your finances."}

                                <FormInput
                                    label="Name"
                                    name="name"
                                    placeholder="Enter category name"
                                    formik={{ values, errors, touched, handleChange }}
                                    required
                                />

                                <TypeToggle
                                    name="type"
                                    formik={{
                                        values,
                                        errors,
                                        touched,
                                        setFieldValue,
                                    }}
                                    required
                                />

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Icon</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleIconChange} />

                                    {icon && (
                                        <div className="mt-2">
                                            <span className="d-block mb-1">Preview:</span>
                                            <img
                                                src={`data:image/*;base64,${icon}`}
                                                alt="Icon preview"
                                                className="img-thumbnail"
                                                style={{ width: 48, height: 48 }}
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
                                    {editingProfile ? "Save Changes" : "Create Category"}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>

            <DeleteConfirmation
                show={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                deleteTarget={deleteTarget}
            />

            <CategoryTable category={people} onDelete={confirmDelete} onEdit={handleEdit} />
        </>
    );
}
