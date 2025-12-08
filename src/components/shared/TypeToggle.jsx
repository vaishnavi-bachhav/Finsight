import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export default function TypeToggle({ label = "Type", name, formik }) {
    const value = formik.values[name];

    const TYPES = [
        {
            key: "income",
            label: "Income",
            color: "#198754",
            icon: "↑",
        },
        {
            key: "expense",
            label: "Expense",
            color: "#dc3545",
            icon: "↓",
        },
    ];

    return (
        <Form.Group className="mb-3">
            <Form.Label className="fw-bold d-block mb-2">{label}</Form.Label>

            {/* Hidden input for Formik / FormData compatibility */}
            <input type="hidden" name={name} value={value} />

            <div className="d-flex gap-2">
                {TYPES.map((type) => {
                    const isActive = value === type.key;

                    return (
                        <Button
                            key={type.key}
                            type="button"
                            variant={isActive ? `outline-${type.key === "income" ? "success" : "danger"}` : "outline-secondary"}
                            className="rounded-pill d-flex align-items-center px-3 py-1"
                            onClick={() => formik.setFieldValue(name, type.key)}
                            style={{
                                borderWidth: isActive ? 2 : 1,
                                backgroundColor: isActive ? `${type.color}18` : "",
                            }}
                        >
                            <span
                                className="me-2 d-inline-flex justify-content-center align-items-center"
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    border: `2px solid ${type.color}`,
                                    backgroundColor: `${type.color}22`,
                                    color: type.color,
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                {type.icon}
                            </span>

                            {type.label}
                        </Button>
                    );
                })}
            </div>

            {formik.touched[name] && formik.errors[name] && (
                <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                    {formik.errors[name]}
                </div>
            )}
        </Form.Group>
    );
}