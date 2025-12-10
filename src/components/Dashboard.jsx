import { Card, Row, Col } from "react-bootstrap";
import { useMemo } from "react";
import Bar from "./Bar";
import Donut from "./Donut";
import NetWorth from "./NetWorth";
import useTransactions from "../hooks/useTransactions";

// helper outside component so it's not recreated on each render
const formatCurrency = (value) =>
    `$${Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Dashboard() {
    const { grouped, isLoading, error } = useTransactions();

    // -----------------------------
    // Compute summary stats in ONE pass
    // -----------------------------
    const summary = useMemo(() => {
        if (!grouped?.length) {
            return {
                totalIncome: 0,
                totalExpense: 0,
                currentNetWorth: 0,
                thisMonthLabel: null,
                thisMonthNet: 0,
                lastMonthLabel: null,
                lastMonthNet: 0,
                bestMonthLabel: null,
                bestMonthNet: 0,
                worstMonthLabel: null,
                worstMonthNet: 0,
            };
        }

        // ---- PURE REDUCE (NO MUTATION) ----
        const result = grouped.reduce(
            (acc, m) => {
                const income = m.totalIncome || 0;
                const expense = m.totalExpense || 0;
                const net = income - expense;

                return {
                    totalIncome: acc.totalIncome + income,
                    totalExpense: acc.totalExpense + expense,
                    currentNetWorth: acc.currentNetWorth + net,

                    // Track best month
                    bestMonthNet:
                        net > acc.bestMonthNet ? net : acc.bestMonthNet,
                    bestMonthLabel:
                        net > acc.bestMonthNet ? m.month : acc.bestMonthLabel,

                    // Track worst month
                    worstMonthNet:
                        net < acc.worstMonthNet ? net : acc.worstMonthNet,
                    worstMonthLabel:
                        net < acc.worstMonthNet ? m.month : acc.worstMonthLabel,

                    monthNets: [...acc.monthNets, { month: m.month, net }],
                };
            },
            {
                totalIncome: 0,
                totalExpense: 0,
                currentNetWorth: 0,
                bestMonthNet: Number.NEGATIVE_INFINITY,
                bestMonthLabel: null,
                worstMonthNet: Number.POSITIVE_INFINITY,
                worstMonthLabel: null,
                monthNets: [],
            }
        );

        // Extract this month and last month
        const lastIndex = result.monthNets.length - 1;
        const thisMonth = result.monthNets[lastIndex];
        const lastMonth = result.monthNets[lastIndex - 1];

        return {
            totalIncome: result.totalIncome,
            totalExpense: result.totalExpense,
            currentNetWorth: result.currentNetWorth,

            thisMonthLabel: thisMonth?.month || null,
            thisMonthNet: thisMonth?.net || 0,

            lastMonthLabel: lastMonth?.month || null,
            lastMonthNet: lastMonth?.net || 0,

            bestMonthLabel: result.bestMonthLabel,
            bestMonthNet: result.bestMonthNet,

            worstMonthLabel: result.worstMonthLabel,
            worstMonthNet: result.worstMonthNet,
        };
    }, [grouped]);


    const {
        totalIncome,
        totalExpense,
        currentNetWorth,
        thisMonthLabel,
        thisMonthNet,
        lastMonthLabel,
        lastMonthNet,
        bestMonthLabel,
        bestMonthNet,
        worstMonthLabel,
        worstMonthNet,
    } = summary;

    // -----------------------------
    // Loading / Error
    // -----------------------------
    if (isLoading) return <p>Loading dashboard...</p>;
    if (error) return <p className="text-danger">Failed to load dashboard.</p>;

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <>
            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="text-muted small mb-1">Total Income</div>
                            <div className="h4 text-success">{formatCurrency(totalIncome)}</div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="text-muted small mb-1">Total Expense</div>
                            <div className="h4 text-danger">{formatCurrency(totalExpense)}</div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <div className="text-muted small mb-1">Current Net Worth</div>
                            <div
                                className={`h4 ${currentNetWorth >= 0 ? "text-success" : "text-danger"
                                    }`}
                            >
                                {currentNetWorth >= 0 ? "+" : "-"}
                                {formatCurrency(Math.abs(currentNetWorth))}
                            </div>

                            {/* This month vs last month */}
                            {thisMonthLabel && (
                                <div className="small mt-2">
                                    This Month ({thisMonthLabel}):{" "}
                                    <strong
                                        className={
                                            thisMonthNet >= 0 ? "text-success" : "text-danger"
                                        }
                                    >
                                        {thisMonthNet >= 0 ? "+" : "-"}
                                        {formatCurrency(Math.abs(thisMonthNet))}
                                    </strong>
                                    {lastMonthLabel && (
                                        <div className="text-muted">
                                            vs {lastMonthLabel}:{" "}
                                            <strong
                                                className={
                                                    lastMonthNet >= 0 ? "text-success" : "text-danger"
                                                }
                                            >
                                                {lastMonthNet >= 0 ? "+" : "-"}
                                                {formatCurrency(Math.abs(lastMonthNet))}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Best & Worst */}
                            {bestMonthLabel && (
                                <div className="small mt-2">
                                    Best Month:{" "}
                                    <strong>{bestMonthLabel}</strong>{" "}
                                    <span className="text-success">
                                        (+{formatCurrency(bestMonthNet)})
                                    </span>
                                </div>
                            )}
                            {worstMonthLabel && (
                                <div className="small">
                                    Worst Month:{" "}
                                    <strong>{worstMonthLabel}</strong>{" "}
                                    <span className="text-danger">
                                        (-{formatCurrency(Math.abs(worstMonthNet))})
                                    </span>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5>Cashflow</h5>
                    <Bar />
                </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5>Net Worth</h5>
                    <NetWorth />
                </Card.Body>
            </Card>

            <Row>
                <Col md={6}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Income Breakdown</h5>
                            <Donut type="income" />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Expense Breakdown</h5>
                            <Donut type="expense" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}