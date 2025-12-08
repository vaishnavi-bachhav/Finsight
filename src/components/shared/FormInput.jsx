import Form from "react-bootstrap/Form";

/**
 * Reusable Formik-connected Input Component
 *
 * Props:
 * - label: string
 * - name: string (required for Formik)
 * - type: text, number, email, etc.
 * - placeholder: optional
 * - formik: the Formik bag { values, errors, touched, handleChange }
 * - required: boolean (optional) → shows red asterisk if true
 */

export default function FormInput({
    label,
    name,
    type = "text",
    placeholder,
    formik,
    required = false,
}) {
    return (
        <Form.Group className="mb-3">
            {label && (
                <Form.Label className="fw-bold">
                    {label}{" "}
                    {required && <span style={{ color: "red" }}>*</span>}
                </Form.Label>
            )}

            <Form.Control
                name={name}
                type={type}
                placeholder={placeholder}
                value={formik.values[name]}
                onChange={formik.handleChange}
                isInvalid={formik.touched[name] && !!formik.errors[name]}
            />

            <Form.Control.Feedback type="invalid">
                {formik.errors[name]}
            </Form.Control.Feedback>
        </Form.Group>
    );
}
