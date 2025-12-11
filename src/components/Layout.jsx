// src/components/Layout.jsx
import { Container, Row, Col, ListGroup } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useUser,
} from "@clerk/clerk-react";
import { LayoutDashboard, ArrowLeftRight, Shapes, WalletCards } from "lucide-react";

export default function Layout() {
  const { user } = useUser();

  return (
    <Container fluid className="layout-root">
      <Row>
        {/* ---------------- Sidebar ---------------- */}
        <Col
          md={2}
          className="sidebar-dark d-flex flex-column p-0 min-vh-100"
        >
          {/* App title + user profile */}
          <div className="sidebar-header px-3 py-3 border-bottom-dark">
            <div
                        className="d-flex align-items-center gap-2 brand"
                        style={{ cursor: "pointer" }}
                       // onClick={() => navigate("/")}
                    >
                        <div className="brand-logo">
                            <WalletCards size={18} />
                        </div>
                        <div>
                            <span className="fw-bold fs-5 brand-name">FinSight</span>
                            <div className="brand-sub">Control every dollar, every month</div>
                        </div>
                    </div>
                    <hr />

            <SignedIn>
              <div className="d-flex align-items-center gap-2 sidebar-user">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonOuterIdentifier: "d-none", // hide extra text
                    },
                  }}
                />

                <div className="small">
                  <div className="fw-semibold text-surface">
                    {user?.firstName || "Welcome"}
                  </div>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal" redirectUrl="/dashboard">
                <button className="btn-gradient-main btn-sm w-100 mt-2">
                  Sign in to continue
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Navigation links */}
          <div className="flex-grow-1 mt-3">
            <ListGroup variant="flush" className="sidebar-list">
              <ListGroup.Item
                as={NavLink}
                to="/dashboard"
                end
                className="sidebar-item"
              >
                <LayoutDashboard size={18} className="me-2" /> Dashboard
              </ListGroup.Item>

              <ListGroup.Item
                as={NavLink}
                to="/transactions"
                className="sidebar-item"
              >
                <ArrowLeftRight size={18} className="me-2" /> Transactions
              </ListGroup.Item>

              <ListGroup.Item
                as={NavLink}
                to="/category"
                className="sidebar-item"
              >
                <Shapes size={18} className="me-2" /> Category
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Col>

        {/* ---------------- Main Content ---------------- */}
        <Col md={10} className="content-area p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
