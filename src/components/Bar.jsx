// src/components/Bar.jsx (or adjust path as needed)
import React, { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useSWR from "swr";
import { fetchTransactions } from "../api/transactionApi.js"; // <-- adjust path if needed

const swrFetcher = async () => await fetchTransactions();

export default function Bar() {
  const {
    data: grouped = [],
    isLoading,
    error,
  } = useSWR("transactions", swrFetcher);

  // -----------------------------
  // Detect "no data" cases
  // -----------------------------
  const noData =
    !grouped ||
    grouped.length === 0 ||
    grouped.every(
      (m) => (m.totalIncome || 0) === 0 && (m.totalExpense || 0) === 0
    );

  // -----------------------------
  // Precompute category sums per month
  // monthCategorySummary = {
  //   "Dec 2025": {
  //      income: { Salary: 500, Bonus: 100 },
  //      expense: { Grocery: 40, Fuel: 12 }
  //   },
  //   ...
  // }
  // -----------------------------
  const { chartData, monthCategorySummary } = useMemo(() => {
    const summary = {};
    const rows = [];

    (grouped || []).forEach((monthObj) => {
      const monthLabel = monthObj.month;
      const incomeTotal = Number(monthObj.totalIncome || 0);
      const expenseTotal = Number(monthObj.totalExpense || 0);

      rows.push({
        month: monthLabel,
        income: incomeTotal,
        expense: expenseTotal,
      });

      const incomeCats = {};
      const expenseCats = {};

      (monthObj.transactions || []).forEach((tx) => {
        const cname = tx.category?.name || "Uncategorized";
        const amt = Number(tx.amount || 0);

        if (tx.type === "income") {
          incomeCats[cname] = (incomeCats[cname] || 0) + amt;
        } else if (tx.type === "expense") {
          expenseCats[cname] = (expenseCats[cname] || 0) + amt;
        }
      });

      summary[monthLabel] = {
        income: incomeCats,
        expense: expenseCats,
      };
    });

    return { chartData: rows, monthCategorySummary: summary };
  }, [grouped]);

  // -----------------------------
  // Build chart options
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
        {
          type: "category",
          position: "bottom",
          title: { text: "Month" },
        },
        {
          type: "number",
          position: "left",
          title: { text: "Amount ($)" },
          label: {
            formatter: ({ value }) =>
              `$${Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`,
          },
        },
      ],

      legend: { position: "bottom" },

      tooltip: {
        renderer: ({ datum, yKey, yName }) => {
          const month = datum.month;
          const typeKey = yKey === "income" ? "income" : "expense";
          const total = Number(datum[yKey] || 0);

          const cats =
            monthCategorySummary[month] &&
            monthCategorySummary[month][typeKey]
              ? monthCategorySummary[month][typeKey]
              : {};

          const lines = Object.entries(cats)
            .sort((a, b) => b[1] - a[1]) // show largest first
            .map(
              ([catName, amt]) =>
                `${catName}: $${amt.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
            );

          const totalLine = `${yName} total: $${total.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`;

          const content = lines.length
            ? `${lines.join("\n")}\n----------------\n${totalLine}`
            : totalLine;

          return {
            title: month,
            content,
          };
        },
      },
    };
  }, [noData, chartData, monthCategorySummary]);

  // -----------------------------
  // Render
  // -----------------------------
  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p className="text-danger">Failed to load chart</p>;

  if (noData || !options) {
    return (
      <div className="text-center text-muted py-4">
        <h6>No transactions found</h6>
        <p className="small mb-0">
          Add some income or expense transactions to see your cashflow chart.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 350 }}>
      <AgCharts options={options} />
    </div>
  );
}
