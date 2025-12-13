import { useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../../hooks/useTransactions.js";

// helper: "Dec 2023" -> Date(2023-12-01)
const monthLabelToDate = (label) => {
  const d = new Date(`${label} 1`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function Bar() {
  const { grouped, isLoading, error } = useTransactions();

  // Filter: all | 3 | 6 | 12
  const [range, setRange] = useState("all");

  // ---- apply range filter to grouped (month-level) ----
  const filteredGrouped = useMemo(() => {
    if (!grouped?.length) return [];
    if (range === "all") return grouped;

    const months = Number(range);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - (months - 1)); // include current month
    cutoff.setHours(0, 0, 0, 0);

    return grouped.filter((m) => {
      const md = monthLabelToDate(m.month);
      if (!md) return true; // if parsing fails, keep it
      return md >= new Date(cutoff.getFullYear(), cutoff.getMonth(), 1);
    });
  }, [grouped, range]);

  // -----------------------------
  // Detect no data (after filter)
  // -----------------------------
  const noData =
    !filteredGrouped?.length ||
    filteredGrouped.every(
      (m) => (m.totalIncome ?? 0) === 0 && (m.totalExpense ?? 0) === 0
    );

  // -----------------------------
  // Compute chart + top categories based on filteredGrouped
  // -----------------------------
  const { chartData, topIncomeCats, topExpenseCats } = useMemo(() => {
    if (noData) {
      return { chartData: [], topIncomeCats: [], topExpenseCats: [] };
    }

    const rows = [];
    const incomeCatTotals = {};
    const expenseCatTotals = {};

    filteredGrouped.forEach((monthObj) => {
      const income = Number(monthObj.totalIncome || 0);
      const expense = Number(monthObj.totalExpense || 0);

      rows.push({ month: monthObj.month, income, expense });

      (monthObj.transactions || []).forEach((tx) => {
        const category = tx.category?.name || "Uncategorized";
        const amount = Number(tx.amount || 0);

        if (tx.type === "income") {
          incomeCatTotals[category] = (incomeCatTotals[category] || 0) + amount;
        } else if (tx.type === "expense") {
          expenseCatTotals[category] =
            (expenseCatTotals[category] || 0) + amount;
        }
      });
    });

    const sortTop = (obj) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
      chartData: rows,
      topIncomeCats: sortTop(incomeCatTotals),
      topExpenseCats: sortTop(expenseCatTotals),
    };
  }, [filteredGrouped, noData]);

  // -----------------------------
  // Chart options (DARK THEME)
  // -----------------------------
  const options = useMemo(() => {
    if (noData) return null;

    return {
      theme: {
        baseTheme: "ag-default-dark",
        overrides: {
          cartesian: {
            title: { color: "#e5e7eb", fontSize: 18 },
            subtitle: { color: "#9ca3af" },
            legend: { item: { label: { color: "#e5e7eb" } } },
            axes: {
              category: {
                label: { color: "#e5e7eb" },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
              },
              number: {
                label: { color: "#e5e7eb" },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
                gridLine: { stroke: "#111827" },
              },
            },
          },
        },
      },
      background: { fill: "#020617" },
      title: { text: "Monthly Income vs Expense" },
      subtitle: {
        text:
          range === "all"
            ? "Overview of your cashflow"
            : `Last ${range} months`,
      },
      data: chartData,
      series: [
        { type: "bar", xKey: "month", yKey: "income", yName: "Income", fill: "#22c55e", stroke: "#22c55e" },
        { type: "bar", xKey: "month", yKey: "expense", yName: "Expense", fill: "#ef4444", stroke: "#ef4444" },
      ],
      axes: [
        { type: "category", position: "bottom", label: { color: "#e5e7eb" } },
        {
          type: "number",
          position: "left",
          label: {
            color: "#e5e7eb",
            formatter: ({ value }) =>
              `$${Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`,
          },
        },
      ],
      legend: { position: "bottom" },
    };
  }, [noData, chartData, range]);

  // -----------------------------
  // UI
  // -----------------------------
  if (isLoading) return <p>Loading chart…</p>;
  if (error) return <p className="text-danger">Failed to load chart.</p>;

  return (
    <div>
      {/* Filter row */}
      <div className="d-flex justify-content-end mb-2">
        <select
          className="form-select form-select-sm dark-input"
          style={{ width: 180 }}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="all">All time</option>
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>

      {noData || !options ? (
        <div className="text-center text-muted py-4">
          <h6>No transactions found</h6>
          <p className="small mb-0">Add some income or expenses to view charts.</p>
        </div>
      ) : (
        <>
          <AgCharts options={options} />

          <hr className="border-secondary" />

          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-semibold text-light">Top Income Categories</h6>
              <ul className="list-unstyled text-muted">
                {topIncomeCats.map(([name, amt]) => (
                  <li key={name} className="d-flex justify-content-between">
                    <span>{name}</span>
                    <span className="text-success">${amt.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-md-6">
              <h6 className="fw-semibold text-light">Top Expense Categories</h6>
              <ul className="list-unstyled text-muted">
                {topExpenseCats.map(([name, amt]) => (
                  <li key={name} className="d-flex justify-content-between">
                    <span>{name}</span>
                    <span className="text-danger">${amt.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
