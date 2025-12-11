// src/components/Landing.jsx
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
    useUser,
} from "@clerk/clerk-react";

import {
    PieChart,
    LineChart,
    LockKeyhole,
    ArrowRight,
    ArrowLeftRight,
    WalletCards,
    Sparkles,
} from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
    const { user } = useUser();
    const navigate = useNavigate();
    useEffect(() => {
        if (user) navigate("/dashboard");
    }, [user]);

    return (
        <div className="landing-root d-flex flex-column min-vh-100">
            {/* ---------------- Top Nav ---------------- */}
            <header className="landing-nav border-bottom">
                <Container className="d-flex align-items-center justify-content-between py-3">
                    <div
                        className="d-flex align-items-center gap-2 brand"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        <div className="brand-logo">
                            <WalletCards size={18} />
                        </div>
                        <div>
                            <span className="fw-bold fs-5 brand-name">FinSight</span>
                            <div className="brand-sub">Control every dollar, every month</div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted d-none d-md-inline small">
                            Smart personal finance dashboard
                        </span>

                        <SignedOut>
                            <SignInButton mode="modal" redirectUrl="/dashboard">
                                <button className="btn-gradient-main">Sign in</button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <div className="d-flex align-items-center gap-2">
                                <div className="text-end d-none d-md-block small">
                                    <div className="fw-semibold text-surface">
                                        {user?.firstName || "Welcome"}
                                    </div>
                                    <div className="text-muted">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </div>
                                </div>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                    </div>
                </Container>
            </header>

            {/* ---------------- Hero Section ---------------- */}
            <main className="flex-grow-1">
                <Container className="py-5 landing-main">
                    <Row className="align-items-center gy-5">
                        {/* Hero text */}
                        <Col md={6}>
                            <div className="mb-3">
                                <Badge
                                    bg="dark"
                                    text="light"
                                    className="border rounded-pill hero-pill-main"
                                >
                                    <Sparkles size={16} className="me-1 text-warning" />
                                    Take control of your money
                                </Badge>
                            </div>

                            <h1 className="display-5 fw-bold mb-3 landing-heading">
                                See your money clearly.
                                <br />
                                <span className="hero-accent">Plan smarter, live better.</span>
                            </h1>

                            <p className="landing-subtitle fs-5 mb-4">
                                FinSight helps you track expenses, visualize your cashflow,
                                and understand your financial habits with clean, interactive
                                dashboards.
                            </p>

                            <div className="d-flex flex-wrap gap-3 mb-4">
                                <SignedOut>
                                    <SignInButton mode="modal" redirectUrl="/dashboard">
                                        <button className="btn-gradient-main btn-lg d-flex align-items-center">
                                            Get started free
                                            <ArrowRight size={18} className="ms-2" />
                                        </button>
                                    </SignInButton>
                                </SignedOut>

                                <SignedIn>
                                    <button
                                        className="btn-gradient-main btn-lg d-flex align-items-center"
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        Go to Dashboard
                                        <ArrowRight size={18} className="ms-2" />
                                    </button>
                                </SignedIn>

                                <Button
                                    variant="outline-secondary"
                                    size="lg"
                                    className="btn-outline-darkglass"
                                    onClick={() =>
                                        document
                                            .getElementById("how-it-works")
                                            ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                >
                                    How it works
                                </Button>
                            </div>

                            <Row className="gy-3 text-muted small hero-checklist">
                                <Col xs={6} md={4}>
                                    ✅ Google sign-in
                                </Col>
                                <Col xs={6} md={4}>
                                    ✅ Secure by Clerk
                                </Col>
                                <Col xs={12} md={4}>
                                    ✅ Real-time charts
                                </Col>
                            </Row>
                        </Col>

                        {/* Hero preview card */}
                        <Col md={6}>
                            <Card className="shadow-lg border-0 landing-preview-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-3">
                                        <div>
                                            <div className="small text-muted mb-1">
                                                This month&apos;s overview
                                            </div>
                                            <div className="fw-bold text-surface">
                                                Cashflow Snapshot
                                            </div>
                                        </div>
                                        <div className="text-end small">
                                            <div className="text-success fw-semibold">
                                                + $2,340.50
                                            </div>
                                            <div className="text-muted">Net this month</div>
                                        </div>
                                    </div>

                                    <Row className="gy-3 mb-3">
                                        <Col xs={6}>
                                            <Card className="border-0 stat-card stat-card-income">
                                                <Card.Body className="py-2">
                                                    <div className="small text-muted">Income</div>
                                                    <div className="fw-semibold text-success">
                                                        $4,500.00
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col xs={6}>
                                            <Card className="border-0 stat-card stat-card-expense">
                                                <Card.Body className="py-2">
                                                    <div className="small text-muted">Expense</div>
                                                    <div className="fw-semibold text-danger">
                                                        $2,159.50
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row className="gy-3">
                                        <Col md={6} className="d-flex align-items-center">
                                            <div className="d-flex flex-column gap-2 w-100">
                                                <div className="d-flex justify-content-between small">
                                                    <span>Housing</span>
                                                    <span className="text-danger">$900</span>
                                                </div>
                                                <div className="progress glass-progress">
                                                    <div
                                                        className="progress-bar bg-danger"
                                                        style={{ width: "60%" }}
                                                    ></div>
                                                </div>

                                                <div className="d-flex justify-content-between small">
                                                    <span>Groceries</span>
                                                    <span className="text-danger">$420</span>
                                                </div>
                                                <div className="progress glass-progress">
                                                    <div
                                                        className="progress-bar bg-warning"
                                                        style={{ width: "40%" }}
                                                    ></div>
                                                </div>

                                                <div className="d-flex justify-content-between small">
                                                    <span>Investments</span>
                                                    <span className="text-success">$750</span>
                                                </div>
                                                <div className="progress glass-progress">
                                                    <div
                                                        className="progress-bar bg-success"
                                                        style={{ width: "50%" }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col
                                            md={6}
                                            className="d-flex flex-column align-items-center justify-content-center"
                                        >
                                            <PieChart size={54} className="mb-2 text-primary" />
                                            <div className="small text-muted text-center">
                                                See where every dollar goes with clear visual breakdowns.
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* ---------------- Feature Cards ---------------- */}
                    <section className="mt-5 pt-4">
                        <Row className="g-4">
                            <Col xs={12} md={4}>
                                <Card className="shadow-sm rounded-4 h-100 landing-feature-card">
                                    <Card.Body>
                                        <PieChart size={36} className="mb-3 text-primary" />
                                        <h5 className="fw-bold mb-2 text-surface">
                                            Smart Analytics
                                        </h5>
                                        <p className="text-muted mb-0">
                                            Visualize spending patterns by category, month, and type.
                                            Spot trends instantly with bar, line, and donut charts.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={4}>
                                <Card className="shadow-sm rounded-4 h-100 landing-feature-card">
                                    <Card.Body>
                                        <ArrowLeftRight size={36} className="mb-3 text-success" />
                                        <h5 className="fw-bold mb-2 text-surface">
                                            Transactions, Simplified
                                        </h5>
                                        <p className="text-muted mb-0">
                                            Quickly add, edit, and categorize income or expenses.
                                            Month-wise grouping keeps your history tidy and easy to scan.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} md={4}>
                                <Card className="shadow-sm rounded-4 h-100 landing-feature-card">
                                    <Card.Body>
                                        <LockKeyhole size={36} className="mb-3 text-danger" />
                                        <h5 className="fw-bold mb-2 text-surface">
                                            Secure by Design
                                        </h5>
                                        <p className="text-muted mb-0">
                                            Clerk handles authentication with Google sign-in, secure
                                            sessions, and protected routes for your financial data.
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </section>

                    {/* ---------------- How It Works ---------------- */}
                    <section id="how-it-works" className="mt-5 pt-4">
                        <Row className="g-4 align-items-center">
                            <Col md={6}>
                                <h3 className="fw-bold mb-3 text-surface">
                                    How FinSight works
                                </h3>
                                <p className="text-muted mb-4">
                                    In just a few minutes, you can start tracking your finances
                                    and gain insight into your cashflow, savings, and habits.
                                </p>

                                <ol className="ps-3 text-muted">
                                    <li className="mb-2">
                                        <strong>Sign in securely</strong> with your Google account using
                                        Clerk.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Create categories</strong> like Housing, Groceries, Salary,
                                        Investments, and more.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Add transactions</strong> with date, type, amount, category,
                                        and optional notes.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Explore dashboards</strong> showing monthly income vs
                                        expense, net worth trends, and category breakdowns.
                                    </li>
                                    <li>
                                        <strong>Track progress</strong> toward financial goals and adjust
                                        your habits based on real data.
                                    </li>
                                </ol>
                            </Col>

                            <Col md={6}>
                                <Card className="shadow-sm border-0 landing-feature-card">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <LineChart size={32} className="me-2 text-primary" />
                                            <div>
                                                <div className="fw-semibold text-surface">
                                                    Live dashboards
                                                </div>
                                                <div className="text-muted small">
                                                    Updated automatically as you add transactions.
                                                </div>
                                            </div>
                                        </div>

                                        <Row className="gy-3">
                                            <Col xs={6}>
                                                <div className="border rounded-3 p-3 h-100 glass-tile">
                                                    <div className="small text-muted mb-1">
                                                        Monthly net worth
                                                    </div>
                                                    <div className="h5 text-success mb-0">+18.4%</div>
                                                    <div className="text-muted small">
                                                        last 6 months trend
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className="border rounded-3 p-3 h-100 glass-tile">
                                                    <div className="small text-muted mb-1">
                                                        Biggest category
                                                    </div>
                                                    <div className="h5 mb-0 text-surface">Housing</div>
                                                    <div className="text-muted small">
                                                        Track and rebalance your spend.
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="mt-4 d-flex justify-content-between align-items-center">
                                            <div className="text-muted small">
                                                Ready to explore your finances?
                                            </div>
                                            <SignedOut>
                                                <SignInButton mode="modal" redirectUrl="/dashboard">
                                                    <button className="btn-gradient-main btn-sm">
                                                        Start now
                                                    </button>
                                                </SignInButton>
                                            </SignedOut>
                                            <SignedIn>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="btn-outline-darkglass"
                                                    onClick={() => navigate("/dashboard")}
                                                >
                                                    Open Dashboard
                                                </Button>
                                            </SignedIn>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </section>
                </Container>
            </main>

            {/* ---------------- Footer ---------------- */}
            <footer className="landing-footer border-top mt-4">
                <Container className="py-3 d-flex justify-content-between flex-wrap gap-2 small text-muted">
                    <span>
                        © {new Date().getFullYear()} FinSight. Built for learning & personal
                        finance.
                    </span>
                    <span>Clerk Auth · MongoDB · Express · React · Vite</span>
                </Container>
            </footer>
        </div>
    );
}
