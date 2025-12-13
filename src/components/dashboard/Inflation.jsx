import { useState } from "react";
import useSWR from "swr";
import { Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { fetchInflation } from "../../api/inflationApi";

const COUNTRIES = [
  { code: "USA", label: "United States" },
  { code: "IND", label: "India" },
  { code: "GBR", label: "United Kingdom" },
  { code: "CAN", label: "Canada" },
  { code: "AUS", label: "Australia" },
  { code: "JPN", label: "Japan" },
];

export default function InflationCard() {
  const [country, setCountry] = useState("USA");

  const { data, error, isLoading } = useSWR(
    ["inflation", country],
    () => fetchInflation(country),
    { revalidateOnFocus: false }
  );

  const latest = data?.latest;

  return (
    <Card className="dashboard-card shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="small text-muted mb-1">Inflation Insights</div>
            <div className="fw-semibold text-surface">Consumer Price Inflation</div>
            <div className="small text-muted mt-1">
              Latest available year from World Bank
            </div>
          </div>

          <Form.Select
            size="sm"
            className="dark-input"
            style={{ maxWidth: 220 }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="mt-3">
          {isLoading && <div className="text-muted small">Loading inflation…</div>}
          {error && <div className="text-danger small">Failed to load inflation</div>}

          {!isLoading && !error && latest && (
            <div className="d-flex align-items-end justify-content-between">
              <div>
                <div className="display-6 fw-bold text-surface mb-0">
                  {latest.value.toFixed(2)}%
                </div>
                <div className="small text-muted">Year: {latest.year}</div>
              </div>

              <div className="small text-muted text-end">
                Tip: Use this to interpret your “real” spending power.
              </div>
            </div>
          )}

          {!isLoading && !error && !latest && (
            <div className="text-muted small">
              No inflation data found for this country.
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
