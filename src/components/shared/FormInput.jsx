// src/components/shared/FormInput.jsx
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
 * - required: boolean (optional) → adds required-label class
 * - inputClassName: extra classes for Form.Control (optional)
 * - labelClassName: extra classes for Form.Label (optional)
 * - groupClassName: extra classes for Form.Group (optional)
 */

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  formik,
  required = false,
  inputClassName = "",
  labelClassName = "",
  groupClassName = "",
}) {
  const { values, errors, touched, handleChange } = formik;

  const showError = touched[name] && !!errors[name];

  return (
    <Form.Group className={`mb-3 ${groupClassName}`}>
      {label && (
        <Form.Label
          className={`fw-bold text-surface ${
            required ? "required-label" : ""
          } ${labelClassName}`}
        >
          {label}
        </Form.Label>
      )}

      <Form.Control
        name={name}
        type={type}
        placeholder={placeholder}
        value={values[name]}
        onChange={handleChange}
        isInvalid={showError}
        className={`dark-input ${inputClassName}`}
      />

      <Form.Control.Feedback type="invalid">
        {errors[name]}
      </Form.Control.Feedback>
    </Form.Group>
  );
}
