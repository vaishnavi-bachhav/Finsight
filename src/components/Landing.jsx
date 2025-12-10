// src/components/Landing.jsx
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { PieChart, LineChart, LockKeyhole } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function Landing() {
      const { isSignedIn } = useUser();

  const navigate = useNavigate();
  useEffect(() => {
    if (isSignedIn) navigate("/dashboard");
  }, [isSignedIn]);

  return (
    <>
      {/* Top header bar */}
      <header className="w-100 py-2 px-3 d-flex justify-content-end align-items-center border-bottom bg-white position-fixed top-0 start-0">
        <SignedOut>
          <SignInButton mode="modal" redirectUrl="/dashboard">
            <Button variant="outline-primary" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="d-flex align-items-center gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </header>

      <Container
        fluid
        className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5"
        style={{ paddingTop: "70px" }} // offset for fixed header
      >
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Personal Finance Dashboard</h1>
          <p className="text-secondary fs-5 mb-4">
            Track your expenses, manage budgets, and achieve your financial goals — all in one place.
          </p>

          {/* Signed-out: Get Started = Sign in */}
          <SignedOut>
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <Button variant="primary" size="lg" className="px-4 py-2">
                Get Started
              </Button>
            </SignInButton>
          </SignedOut>

          {/* Signed-in: Go straight to dashboard */}
          <SignedIn>
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-2"
              onClick={() => navigate("/dashboard")}
            >
              Go to your Dashboard
            </Button>
          </SignedIn>
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
  );
}
