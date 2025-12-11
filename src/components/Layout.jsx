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
import { LayoutDashboard, ArrowLeftRight, Shapes } from 'lucide-react';

export default function Layout() {
  const { user } = useUser();

  return (
    <Container fluid>
      <Row>
        {/* ---------------- Sidebar ---------------- */}
        <Col
          md={2}
          className="bg-light border-end min-vh-100 d-flex flex-column"
        >
          {/* App title + user profile */}
          <div className="pt-3 pb-3 border-bottom">
            <h6 className="fw-bold mb-3">Fin Sight</h6>

            {/* Signed-in user info */}
            <SignedIn>
              <div className="d-flex align-items-center gap-2">
                {/* Avatar with dropdown (includes Sign out) */}
                <UserButton
                  appearance={{
                    elements: {
                      userButtonOuterIdentifier: "d-none", // hide email under avatar
                    },
                  }}
                />

                <div className="small">
                  <div className="fw-semibold">
                    {user?.firstName || "Welcome"}
                  </div>
                 
                </div>
              </div>
            </SignedIn>

            {/* Signed-out: show a sign-in button instead */}
            <SignedOut>
              <SignInButton mode="modal" redirectUrl="/dashboard">
                <button className="btn btn-primary btn-sm w-100 mt-2">
                  Sign in to continue
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Navigation links */}
          <div className="pt-3 flex-grow-1">
            <ListGroup variant="flush">
              <ListGroup.Item
                action
                as={NavLink}
                to="/dashboard"
                end
                className="border-0"
              >
                <LayoutDashboard/> Dashboard
              </ListGroup.Item>
              <ListGroup.Item
                action
                as={NavLink}
                to="/transactions"
                className="border-0"
              >
                <ArrowLeftRight/> Transactions
              </ListGroup.Item>
              <ListGroup.Item
                action
                as={NavLink}
                to="/category"
                className="border-0"
              >
                <Shapes/> Category
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Col>

        {/* ---------------- Main Content ---------------- */}
        <Col md={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}
