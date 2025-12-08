import { Container, Row, Col, ListGroup } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <Container fluid>
            <Row>
                {/* ---------------- Sidebar ---------------- */}
                <Col md={2} className="bg-light border-end min-vh-100">
                    <h6 className="fw-bold mb-4 mt-3">Personal Finance Dashboard</h6>

                    <ListGroup variant="flush">
                        <ListGroup.Item action as={NavLink} to="/">🏠 Home</ListGroup.Item>
                        <ListGroup.Item action as={NavLink} to="/transactions">📄 Transactions</ListGroup.Item>
                        <ListGroup.Item action as={NavLink} to="/category">📁 Category</ListGroup.Item>
                    </ListGroup>
                </Col>

                {/* ---------------- Main Content ---------------- */}
                <Col md={10} className="p-4">
                    {/* This will render different page content */}
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
}
