import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { PieChart, LineChart, LockKeyhole } from "lucide-react";

export default function Landing() {
    return (
        <>
            <Container
                fluid
                className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5"
            >
                {/* Hero Section */}
                <div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-5"
                >
                    <h1 className="display-4 fw-bold mb-3">Personal Finance Dashboard</h1>
                    <p className="text-secondary fs-5 mb-4">
                        Track your expenses, manage budgets, and achieve your financial goals — all in one place.
                    </p>
                    <Button variant="primary" size="lg" className="px-4 py-2">
                        Get Started
                    </Button>
                </div>

                {/* Feature Cards */}
                <Row className="g-4 mt-4 w-100" style={{ maxWidth: "1100px" }}>
                    <Col xs={12} md={4}>
                        <Card className="shadow-sm rounded-4 text-center p-4">
                            <PieChart size={48} className="mx-auto mb-3" />
                            <h4 className="fw-semibold mb-2">Smart Analytics</h4>
                            <p className="text-secondary">
                                Visualize your spending habits with beautiful charts.
                            </p>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="shadow-sm rounded-4 text-center p-4">
                            <LineChart size={48} className="mx-auto mb-3" />
                            <h4 className="fw-semibold mb-2">Track Progress</h4>
                            <p className="text-secondary">
                                Monitor your goals and savings trends over time.
                            </p>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="shadow-sm rounded-4 text-center p-4">
                            <LockKeyhole size={48} className="mx-auto mb-3" />
                            <h4 className="fw-semibold mb-2">Secure Access</h4>
                            <p className="text-secondary">
                                Login securely using Google Auth or email.
                            </p>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}