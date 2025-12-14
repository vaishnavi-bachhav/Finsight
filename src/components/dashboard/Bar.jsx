import { useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../../hooks/useTransactions.js";

// Helper: convert "Dec 2023" -> Date object
const monthLabelToDate = (label) => {
  const d = new Date(`${label} 1`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function Bar() {
  const { grouped, isLoading, error } = useTransactions();

  const [range, setRange] = useState("all"); // Filter range: all | 3 | 6 | 12 months

  // Apply range filter to grouped data
  const filteredGrouped = useMemo(() => {
    if (!grouped?.length) return [];
    if (range === "all") return grouped;

    const months = Number(range);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - (months - 1)); // include current month
    cutoff.setHours(0, 0, 0, 0);

    return grouped.filter((m) => {
      const md = monthLabelToDate(m.month);
      if (!md) return true;
      return md >= new Date(cutoff.getFullYear(), cutoff.getMonth(), 1);
    });
  }, [grouped, range]);

  // Detect if filtered data has no income/expense
  const noData =
    !filteredGrouped?.length ||
    filteredGrouped.every(
      (m) => (m.totalIncome ?? 0) === 0 && (m.totalExpense ?? 0) === 0
    );

  // Compute chart data and top categories
  const { chartData, topIncomeCats, topExpenseCats } = useMemo(() => {
    if (noData) return { chartData: [], topIncomeCats: [], topExpenseCats: [] };

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

  // Chart configuration (dark theme)
  const options = useMemo(() => {
    if (noData) return null;

    return {
      theme: { baseTheme: "ag-default-dark" },
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
              `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          },
        },
      ],
      legend: { position: "bottom" },
    };
  }, [noData, chartData, range]);

  // ---------------- UI ----------------
  if (isLoading) return <p>Loading chart…</p>;
  if (error) return <p className="text-danger">Failed to load chart.</p>;

  return (
    <div>
      {/* Range filter dropdown */}
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

          {/* Top categories */}
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