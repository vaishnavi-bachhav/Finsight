import { useState, useMemo } from "react";
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
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi.js";

// SWR fetcher for categories
const swrFetcher = async () => await fetchCategories();

/** Builds validation schema dynamically */
function buildValidationSchema(people, editingProfile) {
  return Yup.object({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .test("unique-name", "Name must be unique", function (value) {
        const v = (value || "").trim().toLowerCase();
        if (!v) return true;

        if (!Array.isArray(people)) return true;

        return !people.some((p) => {
          const sameEditing =
            editingProfile &&
            ((p.id && editingProfile.id && p.id === editingProfile.id) ||
              (p._id && editingProfile._id && p._id === editingProfile._id));

          if (sameEditing) return false;

          return ((p.name || "").trim().toLowerCase() === v);
        });
      }),
    type: Yup.string()
      .oneOf(["income", "expense"], "Type is required")
      .required("Type is required"),
  });
}

export default function Category() {
  const [show, setShow] = useState(false);
  const [icon, setIcon] = useState("");
  const [editingProfile, setEditingProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load categories with SWR
  const { data: people = [], error, isLoading } = useSWR("categories", swrFetcher);

  // Build validation schema with current state
  const validationSchema = useMemo(
    () => buildValidationSchema(people, editingProfile),
    [people, editingProfile]
  );

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

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id || deleteTarget.id);
      mutate("categories"); // refresh SWR cache
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Convert selected file to base64
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

  const handleFormSubmit = async (values, { resetForm }) => {
    const iconToSave =
      icon || editingProfile?.icon || CONSTANTS.DEFAULT_CATEGORY_IMAGE;

    try {
      if (editingProfile) {
        await updateCategory(editingProfile._id || editingProfile.id, {
          name: values.name.trim(),
          type: values.type,
          icon: iconToSave,
        });
      } else {
        await addCategory({
          name: values.name.trim(),
          type: values.type,
          icon: iconToSave,
        });
      }

      mutate("categories"); // refresh categories
      resetForm();
      handleClose();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Loading & error states
  if (isLoading) return <p>Loading categories...</p>;
  if (error) return <p className="text-danger">Failed to load categories.</p>;

  return (
    <>
      {/* Top bar with title and add button */}
      <div className="d-flex align-items-center mb-4 flex-wrap gap-3">
        <div className="me-auto">
          <h4 className="mb-0 fw-semibold text-surface">Categories</h4>
          <small className="text-muted">
            Organize your income and expenses into clear, meaningful groups.
          </small>
        </div>

        <Button
          variant="primary"
          className="btn-gradient-main ms-auto"
          onClick={() => {
            setEditingProfile(null);
            setIcon("");
            setShow(true);
          }}
        >
          + New Category
        </Button>
      </div>

      {/* Category form modal */}
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="dark-modal"
        backdrop="static"
      >
        <Formik
          initialValues={{
            name: editingProfile?.name || "",
            type: editingProfile?.type || "income",
          }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ handleSubmit, handleChange, values, errors, touched, setFieldValue }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton className="dark-modal-header">
                <Modal.Title className="text-surface">
                  {editingProfile ? "Edit Category" : "Create New Category"}
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="dark-modal-body">
                <p className="small text-muted mb-3">
                  {editingProfile
                    ? "Update your category details to keep your records clean."
                    : "Create a new category to better organize your finances."}
                </p>

                {/* Name input */}
                <FormInput
                  label="Name"
                  name="name"
                  placeholder="Enter category name"
                  formik={{ values, errors, touched, handleChange }}
                  required
                  inputClassName="dark-input"
                  labelClassName="required-label fw-bold"
                />

                {/* Type toggle */}
                <TypeToggle
                  name="type"
                  formik={{ values, errors, touched, setFieldValue }}
                  required
                />

                {/* Icon upload */}
                <Form.Group className="mb-0 mt-3">
                  <Form.Label className="fw-bold text-surface">
                    Icon <span className="text-muted small">(optional)</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="dark-input"
                  />

                  {(icon || editingProfile?.icon) && (
                    <div className="mt-3 d-flex align-items-center gap-3">
                      <div className="small text-muted">Preview:</div>
                      <img
                        src={`data:image/*;base64,${icon || editingProfile?.icon}`}
                        alt="Icon preview"
                        className="img-thumbnail"
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                      />
                    </div>
                  )}
                </Form.Group>
              </Modal.Body>

              <Modal.Footer className="dark-modal-footer">
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={handleClose}
                  className="btn-soft-dark"
                >
                  Close
                </Button>

                <Button
                  variant="primary"
                  type="submit"
                  className="btn-gradient-main"
                >
                  {editingProfile ? "Save Changes" : "Create Category"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        deleteTarget={deleteTarget}
      />

      {/* Categories list table */}
      <CategoryTable
        category={people}
        onDelete={confirmDelete}
        onEdit={handleEdit}
      />
    </>
  );
}