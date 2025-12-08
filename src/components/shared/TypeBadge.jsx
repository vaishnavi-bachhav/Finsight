import Badge from "react-bootstrap/Badge";

export default function TypeBadge({ type }) {
  if (!type) return null;

  const isIncome = type === "income";

  return (
    <Badge
      bg={isIncome ? "success" : "danger"}
      pill
      style={{
        fontSize: "0.85rem",
        padding: "6px 12px",
        textTransform: "capitalize",
      }}
    >
      {type}
    </Badge>
  );
}