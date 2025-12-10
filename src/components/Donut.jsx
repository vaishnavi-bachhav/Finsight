import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions.js";

export default function Donut({ type }) {
  // type = "income" or "expense"
  const { grouped, isLoading, error } = useTransactions();

  // -----------------------
  // Build category totals
  // -----------------------
  const { chartData, totalAmount } = useMemo(() => {
    const categoryTotals = {};
    let total = 0;

    grouped.forEach((monthObj) => {
      (monthObj.transactions || []).forEach((tx) => {
        if (tx.type !== type) return;

        const cat = tx.category?.name || "Uncategorized";
        const amt = Number(tx.amount || 0);

        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        total += amt;
      });
    });

    const data = Object.entries(categoryTotals).map(([asset, amount]) => ({
      asset,
      amount,
      percentage: total ? (amount / total) * 100 : 0,
    }));

    return { chartData: data, totalAmount: total };
  }, [grouped, type]);

  // -----------------------
  // Handle no data
  // -----------------------
  if (isLoading) return <p>Loading chart…</p>;
  if (error) return <p className="text-danger">Failed to load chart</p>;
  if (!chartData.length)
    return (
      <div className="text-muted text-center py-4 small">
        No {type} data found.
      </div>
    );

  // -----------------------
  // AG Charts Donut Options
  // -----------------------
  const options = {
    title: {
      text:
        type === "income" ? "Income Breakdown" : "Expense Breakdown",
      fontSize: 14,
    },

    data: chartData,

    series: [
      {
        type: "donut",
        angleKey: "amount",
        calloutLabelKey: "asset",

        // LABELS AS PERCENTAGE ON SLICES
        sectorLabelKey: "percentage",
        sectorLabel: {
          formatter: ({ value }) => `${value.toFixed(1)}%`,
          fontSize: 13,
          color: "#fff",
        },

        innerRadiusRatio: 0.65,

        // Colors for slices (optional)
        fills: type === "income"
          ? ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"]
          : ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"],
        strokes: ["#fff"],
      },
    ],

    legend: { position: "right" },

    // SHOW TOTAL IN CENTER OF DONUT
    overlays: [
      {
        type: "text",
        text: `$${totalAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
        fontSize: 20,
        fontWeight: "600",
        color: type === "income" ? "#16a34a" : "#dc2626",
        x: 0.5,
        y: 0.5,
        zIndex: 10,
      },
      {
        type: "text",
        text: type === "income" ? "Total Income" : "Total Expense",
        fontSize: 12,
        color: "#6b7280",
        x: 0.5,
        y: 0.58,
        zIndex: 10,
      },
    ],

    tooltip: {
      renderer: ({ datum }) => ({
        title: datum.asset,
        content: `$${datum.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })} (${datum.percentage.toFixed(1)}%)`,
      }),
    },
  };

  return <AgCharts options={options} />;
}
