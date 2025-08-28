import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "./AuthCard.css";
import { useAuth } from "../Apis/auth";
import Weathericon from "../assest/weather-icon.png"

const AuthCard = () => {
  const { login, signup } = useAuth();
  const loginImage = Weathericon;

  return (
    <div className="auth-card-container">
      <Card className="auth-card shadow-lg">
        <Row className="g-0">
          {/* Left Side: Image */}
          <Col md={6} className="auth-card-image d-none d-md-block">
            <img src={loginImage} alt="Login" />
          </Col>

          {/* Right Side: Login/Signup */}
          <Col md={6} className="auth-card-content">
            <Card.Body>
              <h2 className="mb-3">Welcome to Weather App</h2>
              <p className="mb-4">
                Get real-time weather updates for multiple cities. Log in or
                sign up to continue.
              </p>
              <div className="d-flex flex-column gap-5">
                <Button
                  variant="primary"
                  onClick={login}
                >
                  Login
                </Button>
                <Button
                  variant="success"
                  onClick={signup}
                >
                  Sign Up
                </Button>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AuthCard;