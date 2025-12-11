import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions.js";

export default function Donut({ type }) {
  // type = "income" or "expense"
  const { grouped, isLoading, error } = useTransactions();

  // -----------------------
  // Build category totals
  // -----------------------
  const { chartData } = useMemo(() => {
    const categoryTotals = {};
    let total = 0;

    (grouped || []).forEach((monthObj) => {
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
  // AG Charts Donut Options (dark theme)
  // -----------------------
  const options = {
    theme: {
      baseTheme: "ag-default-dark",
      overrides: {
        polar: {
          title: {
            color: "#e5e7eb",
            fontSize: 16,
          },
          legend: {
            item: {
              label: {
                color: "#e5e7eb",
              },
            },
          },
        },
      },
    },

    background: {
      fill: "#020617",
    },

    title: {
      text: type === "income" ? "Income Breakdown" : "Expense Breakdown",
    },

    data: chartData,

    series: [
      {
        type: "donut",
        angleKey: "amount",
        calloutLabelKey: "asset",

        // category labels
        calloutLabel: {
          color: "#e5e7eb",
          fontSize: 12,
        },

        // LABELS AS PERCENTAGE ON SLICES
        sectorLabelKey: "percentage",
        sectorLabel: {
          formatter: ({ value }) => `${value.toFixed(1)}%`,
          fontSize: 13,
          color: "#ffffff",
        },

        innerRadiusRatio: 0.65,

        // Colors for slices
        fills:
          type === "income"
            ? ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"]
            : ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"],
        strokes: ["#020617"],
      },
    ],

    legend: {
      position: "right",
    },

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
