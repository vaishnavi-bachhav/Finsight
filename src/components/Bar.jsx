import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions.js";

export default function Bar() {
  const { grouped, isLoading, error } = useTransactions();

  // -----------------------------
  // Detect no data
  // -----------------------------
  const noData =
    !grouped?.length ||
    grouped.every(
      (m) => (m.totalIncome ?? 0) === 0 && (m.totalExpense ?? 0) === 0
    );

  // -----------------------------
  // Compute chart + category summaries in ONE PASS
  // -----------------------------
  const { chartData, topIncomeCats, topExpenseCats } = useMemo(() => {
    if (noData) {
      return {
        chartData: [],
        incomeCategories: {},
        expenseCategories: {},
        monthCategorySummary: {},
        topIncomeCats: [],
        topExpenseCats: [],
      };
    }

    const rows = [];
    const incomeCatTotals = {};
    const expenseCatTotals = {};

    grouped.forEach((monthObj) => {
      const m = monthObj.month;

      const income = Number(monthObj.totalIncome || 0);
      const expense = Number(monthObj.totalExpense || 0);
      rows.push({ month: m, income, expense });

      (monthObj.transactions || []).forEach((tx) => {
        const category = tx.category?.name || "Uncategorized";
        const amount = Number(tx.amount || 0);

        if (tx.type === "income") {
          incomeCatTotals[category] =
            (incomeCatTotals[category] || 0) + amount;
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
  }, [grouped, noData]);

  // -----------------------------
  // Chart options (DARK THEME)
  // -----------------------------
  const options = useMemo(() => {
    if (noData) return null;

    return {
      // base dark theme + overrides for text colors
      theme: {
        baseTheme: "ag-default-dark",
        overrides: {
          cartesian: {
            title: {
              color: "#e5e7eb",
              fontSize: 18,
            },
            subtitle: {
              color: "#9ca3af",
            },
            legend: {
              item: {
                label: {
                  color: "#e5e7eb", // legend text
                },
              },
            },
            axes: {
              category: {
                label: {
                  color: "#e5e7eb", // x-axis labels
                },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
              },
              number: {
                label: {
                  color: "#e5e7eb", // y-axis labels
                },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
                gridLine: { stroke: "#111827" },
              },
            },
          },
        },
      },

      background: {
        fill: "#020617", // match app background
      },

      title: { text: "Monthly Income vs Expense" },
      subtitle: { text: "Overview of your cashflow" },

      data: chartData,

      series: [
        {
          type: "bar",
          xKey: "month",
          yKey: "income",
          yName: "Income",
          fill: "#22c55e",
          stroke: "#22c55e",
        },
        {
          type: "bar",
          xKey: "month",
          yKey: "expense",
          yName: "Expense",
          fill: "#ef4444",
          stroke: "#ef4444",
        },
      ],

      axes: [
        {
          type: "category",
          position: "bottom",
          label: {
            color: "#e5e7eb",
          },
        },
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

      legend: {
        position: "bottom",
      },
    };
  }, [noData, chartData]);

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

      <hr className="border-secondary" />

      <div className="row">
        <div className="col-md-6">
          <h6 className="fw-semibold text-light">Top Income Categories</h6>
          <ul className="list-unstyled text-muted">
            {topIncomeCats.map(([name, amt]) => (
              <li key={name} className="d-flex justify-content-between">
                <span>{name}</span>
                <span className="text-success">
                  ${amt.toLocaleString()}
                </span>
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
                <span className="text-danger">
                  ${amt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
