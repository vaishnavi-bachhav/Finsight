import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import Bar from "./Bar";
import Donut from "./Donut";

export default function Dashboard() {
    return (
        <Container fluid>
            <Row>
                {/* ---------------- Sidebar ---------------- */}
                <Col md={2} className="bg-light border-end">
                    <h6 className="fw-bold mb-4">Personal Finance Dashboard</h6>

                    <ListGroup variant="flush">
                        <ListGroup.Item action>🏠 Home</ListGroup.Item>
                        <ListGroup.Item action>📄 Transactions</ListGroup.Item>
                        <ListGroup.Item action>📁 Category</ListGroup.Item>
                    </ListGroup>
                </Col>

                {/* ---------------- Main Content ---------------- */}
                <Col md={10} className="p-4">

                    {/* Cashflow Section */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5>Cashflow</h5>
                            </div>

                            {/* Chart Placeholder */}
                            <div><Bar /></div>
                        </Card.Body>
                    </Card>

                    {/* Income + Expense */}
                    <Row>
                        {/* Income */}
                        <Col md={6}>
                            <Card className="shadow-sm mb-4">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <h5>Income</h5>
                                    </div>

                                    <div>
                                        <Donut />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Expense */}
                        <Col md={6}>
                            <Card className="shadow-sm mb-4">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <h5>Expense</h5>
                                    </div>

                                    <div>
                                        <Donut />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}
