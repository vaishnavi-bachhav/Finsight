import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions.js";

export default function Bar() {
  const { grouped, isLoading, error } = useTransactions();

  // -----------------------------
  // Detect no data
  // -----------------------------
  const noData = !grouped?.length || grouped.every(m =>
    (m.totalIncome ?? 0) === 0 && (m.totalExpense ?? 0) === 0
  );

  // -----------------------------
  // Compute chart + category summaries in ONE PASS
  // -----------------------------
  const {
    chartData,
    monthCategorySummary,
    topIncomeCats,
    topExpenseCats
  } = useMemo(() => {
    if (noData) {
      return {
        chartData: [],
        incomeCategories: {},
        expenseCategories: {},
        monthCategorySummary: {},
        topIncomeCats: [],
        topExpenseCats: []
      };
    }

    const rows = [];
    const monthlyBreakdown = {};
    const incomeCatTotals = {};
    const expenseCatTotals = {};

    grouped.forEach(monthObj => {
      const m = monthObj.month;

      // Prepare monthly row for bar chart
      const income = Number(monthObj.totalIncome || 0);
      const expense = Number(monthObj.totalExpense || 0);
      rows.push({ month: m, income, expense });

      const incMap = {};
      const expMap = {};

      (monthObj.transactions || []).forEach(tx => {
        const category = tx.category?.name || "Uncategorized";
        const amount = Number(tx.amount || 0);

        if (tx.type === "income") {
          incMap[category] = (incMap[category] || 0) + amount;
          incomeCatTotals[category] = (incomeCatTotals[category] || 0) + amount;
        } else {
          expMap[category] = (expMap[category] || 0) + amount;
          expenseCatTotals[category] = (expenseCatTotals[category] || 0) + amount;
        }
      });

      monthlyBreakdown[m] = { income: incMap, expense: expMap };
    });

    // Top 5 categories
    const sortTop = obj =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
      chartData: rows,
      incomeCategories: incomeCatTotals,
      expenseCategories: expenseCatTotals,
      monthCategorySummary: monthlyBreakdown,
      topIncomeCats: sortTop(incomeCatTotals),
      topExpenseCats: sortTop(expenseCatTotals),
    };
  }, [grouped, noData]);

  // -----------------------------
  // Chart options
  // -----------------------------
  const options = useMemo(() => {
    if (noData) return null;

    return {
      title: { text: "Monthly Income vs Expense" },
      subtitle: { text: "Overview of your cashflow" },
      data: chartData,

      series: [
        {
          type: "bar",
          xKey: "month",
          yKey: "income",
          yName: "Income",
          fill: "#16a34a",
          stroke: "#16a34a",
        },
        {
          type: "bar",
          xKey: "month",
          yKey: "expense",
          yName: "Expense",
          fill: "#dc2626",
          stroke: "#dc2626",
        },
      ],

      axes: [
        { type: "category", position: "bottom" },
        {
          type: "number",
          position: "left",
          label: {
            formatter: ({ value }) => `$${value.toLocaleString()}`,
          },
        },
      ],

      tooltip: {
        renderer: ({ datum, yKey, yName }) => {
          const month = datum.month;
          const total = datum[yKey] || 0;
          const typeKey = yKey === "income" ? "income" : "expense";
          const cats = monthCategorySummary[month]?.[typeKey] || {};

          const body = Object.entries(cats)
            .map(
              ([name, amt]) =>
                `${name}: $${amt.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}`
            )
            .join("\n");

          return {
            title: month,
            content:
              body.length > 0
                ? `${body}\n──────\nTotal ${yName}: $${total.toLocaleString()}`
                : `Total ${yName}: $${total.toLocaleString()}`,
          };
        },
      },
    };
  }, [noData, chartData, monthCategorySummary]);

  // -----------------------------
  // UI Rendering
  // -----------------------------
  if (isLoading) return <p>Loading chart…</p>;
  if (error) return <p className="text-danger">Failed to load chart.</p>;

  if (noData || !options) {
    return (
      <div className="text-center text-muted py-4">
        <h6>No transactions found</h6>
        <p className="small mb-0">
          Add some income or expenses to view charts.
        </p>
      </div>
    );
  }

  return (
    <div>
      <AgCharts options={options} />

      <hr />

      <div className="row">
        <div className="col-md-6">
          <h6 className="fw-semibold">Top Income Categories</h6>
          <ul className="list-unstyled">
            {topIncomeCats.map(([name, amt]) => (
              <li key={name} className="d-flex justify-content-between">
                <span>{name}</span>
                <span className="text-success">${amt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6">
          <h6 className="fw-semibold">Top Expense Categories</h6>
          <ul className="list-unstyled">
            {topExpenseCats.map(([name, amt]) => (
              <li key={name} className="d-flex justify-content-between">
                <span>{name}</span>
                <span className="text-danger">${amt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
