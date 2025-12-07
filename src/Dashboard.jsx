import { Card, Row, Col } from "react-bootstrap";
import Bar from "./Bar";
import Donut from "./Donut";

export default function Dashboard() {
    return (
        <>
            {/* Cashflow Section */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5>Cashflow</h5>
                    </div>
                    <Bar />
                </Card.Body>
            </Card>

            {/* Income + Expense */}
            <Row>
                <Col md={6}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Income</h5>
                            <Donut/>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h5>Expense</h5>
                            <Donut/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
