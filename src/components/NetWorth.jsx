import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import useTransactions from "../hooks/useTransactions";

export default function NetWorth() {
    const { grouped, isLoading, error } = useTransactions();

    const data = useMemo(() => {
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

    const options = {
        title: { text: "Cumulative Net Worth" },
        subtitle: { text: "Income - Expense over time" },
        data,

        series: [
            {
                type: "line",
                xKey: "month",
                yKey: "net",
                stroke: "#2563eb",
                marker: { size: 6 },
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
    };

    if (isLoading) return <p>Loading net worth...</p>;
    if (error) return <p className="text-danger">Failed to load net worth chart</p>;

    return <AgCharts options={options} />;
}
