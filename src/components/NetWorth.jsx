import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions";

export default function NetWorth() {
  const { grouped, isLoading, error } = useTransactions();

  const data = useMemo(() => {
    if (!grouped?.length) return [];

    return grouped.reduce((acc, m) => {
      const previousNet = acc.length > 0 ? acc[acc.length - 1].net : 0;

      const net =
        previousNet + (m.totalIncome || 0) - (m.totalExpense || 0);

      acc.push({
        month: m.month,
        net,
      });

      return acc;
    }, []);
  }, [grouped]);

  const noData = !data.length;

  const options = !noData
    ? {
        // Dark theme + overrides (same idea as Bar chart)
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
                    color: "#e5e7eb",
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
          fill: "#020617",
        },

        title: { text: "Cumulative Net Worth" },
        subtitle: { text: "Income - Expense over time" },

        data,

        series: [
          {
            type: "line",
            xKey: "month",
            yKey: "net",
            stroke: "#22c55e", // green line to match theme
            strokeWidth: 3,
            marker: {
              size: 6,
              fill: "#22c55e",
              stroke: "#22c55e",
            },
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
                `$${Number(value).toLocaleString()}`,
            },
          },
        ],
      }
    : null;

  if (isLoading) return <p>Loading net worth...</p>;
  if (error)
    return (
      <p className="text-danger">Failed to load net worth chart</p>
    );

  if (noData || !options) {
    return (
      <div className="text-center text-muted py-4">
        <h6>No transactions found</h6>
        <p className="small mb-0">
          Add some income or expenses to see your net worth trend.
        </p>
      </div>
    );
  }

  return <AgCharts options={options} />;
}
