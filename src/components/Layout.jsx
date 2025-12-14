// src/components/Layout.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Offcanvas,
  Button,
} from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Shapes,
  WalletCards,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

// ✅ Move this component OUTSIDE Layout
function SidebarContent({
  collapsed,
  setCollapsed,
  firstName,
  onNavigate,
}) {
  return (
    <>
      <div className="sidebar-header px-3 py-3 border-bottom-dark">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 brand">
            <div className="brand-logo">
              <WalletCards size={18} />
            </div>

            {!collapsed && (
              <div>
                <span className="fw-bold fs-5 brand-name">FinSight</span>
                <div className="brand-sub">Control every dollar, every month</div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <Button
            variant="link"
            className="p-0 text-muted d-none d-md-inline-flex align-items-center"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <hr className="my-3" />

        <SignedIn>
          <div className="d-flex align-items-center gap-2 sidebar-user">
            <UserButton
              appearance={{
                elements: { userButtonOuterIdentifier: "d-none" },
              }}
            />

            {!collapsed && (
              <div className="small">
                <div className="fw-semibold text-surface">
                  {firstName || "Welcome"}
                </div>
              </div>
            )}
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

      <div className="flex-grow-1 mt-3">
        <ListGroup variant="flush" className="sidebar-list">
          <ListGroup.Item
            as={NavLink}
            to="/dashboard"
            end
            className="sidebar-item"
            onClick={onNavigate}
          >
            <LayoutDashboard size={18} className="me-2" />
            {!collapsed && "Dashboard"}
          </ListGroup.Item>

          <ListGroup.Item
            as={NavLink}
            to="/transactions"
            className="sidebar-item"
            onClick={onNavigate}
          >
            <ArrowLeftRight size={18} className="me-2" />
            {!collapsed && "Transactions"}
          </ListGroup.Item>

          <ListGroup.Item
            as={NavLink}
            to="/category"
            className="sidebar-item"
            onClick={onNavigate}
          >
            <Shapes size={18} className="me-2" />
            {!collapsed && "Category"}
          </ListGroup.Item>
        </ListGroup>
      </div>
    </>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  // If you want the name without useUser(), you can remove this
  // and just show "Welcome".
  // But since you already use Clerk, keep this:
  // (This hook is fine inside Layout)
  const { user } = useUser();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setShowMobile(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Container fluid className="layout-root">
      <Row>
        {/* Desktop sidebar */}
        <Col
          md={collapsed ? 1 : 2}
          className="sidebar-dark d-none d-md-flex flex-column p-0 min-vh-100 sidebar-desktop"
        >
          <SidebarContent
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            firstName={user?.firstName}
            onNavigate={undefined}
          />
        </Col>

        {/* Main content */}
        <Col md={collapsed ? 11 : 10} className="content-area p-4">
          {/* Mobile top bar */}
          <div className="d-md-none d-flex align-items-center justify-content-between mb-3">
            <button
              className="btn-soft-dark btn btn-sm d-inline-flex align-items-center gap-2"
              onClick={() => setShowMobile(true)}
            >
              <Menu size={16} />
              Menu
            </button>

            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-surface">FinSight</span>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: { userButtonOuterIdentifier: "d-none" },
                  }}
                />
              </SignedIn>
            </div>
          </div>

          <Outlet />
        </Col>
      </Row>

      {/* Mobile sidebar drawer */}
      <Offcanvas
        show={showMobile}
        onHide={() => setShowMobile(false)}
        placement="start"
        className="dark-offcanvas"
      >
        <Offcanvas.Header closeButton className="dark-modal-header">
          <Offcanvas.Title className="text-surface">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 sidebar-dark">
          <SidebarContent
            collapsed={false} // on mobile, always expanded
            setCollapsed={setCollapsed}
            firstName={user?.firstName}
            onNavigate={() => setShowMobile(false)}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
