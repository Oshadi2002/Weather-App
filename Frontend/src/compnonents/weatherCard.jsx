import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "./WeatherCard.css";

const WeatherCard = ({
  city,
  country,
  time,
  condition,
  temperature,
  tempMin,
  tempMax,
  pressure,
  humidity,
  visibility,
  sunrise,
  sunset,
  icon
}) => {
  // Function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get weather icon URL
  const getWeatherIcon = (iconCode) => {
    return iconCode 
      ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
      : 'https://openweathermap.org/img/wn/01d@2x.png';
  };

  return (
    <Col xl={0} lg={0} md={0} sm={12} className="mb-4">
      <Card className="weather-card h-100 shadow-sm">
        <Card.Body className="p-4">
          {/* Header with city and time */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title className="cardt">{city}</Card.Title>
              <small className="text-muted">{country} • {time}</small>
            </div>
            <img 
              src={getWeatherIcon(icon)} 
              alt={condition}
              className="weather-icon"
            />
          </div>

          {/* Temperature and condition */}
          <div className="text-center mb-4">
            <div className="display-4 fw-bold text-primary">{temperature}°C</div>
            <div className="text-capitalize">{capitalizeWords(condition)}</div>
            <div className="text-muted small">
              H: {tempMax}°C • L: {tempMin}°C
            </div>
          </div>

          {/* Weather details */}
          <Row className="weather-details">
            <Col xs={6} className="mb-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2 text-info"></i>
                <div>
                  <small className="text-muted d-block">Pressure</small>
                  <strong>{pressure} hPa</strong>
                </div>
              </div>
            </Col>
            <Col xs={6} className="mb-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-droplet me-2 text-info"></i>
                <div>
                  <small className="text-muted d-block">Humidity</small>
                  <strong>{humidity}%</strong>
                </div>
              </div>
            </Col>
            <Col xs={6} className="mb-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-eye me-2 text-info"></i>
                <div>
                  <small className="text-muted d-block">Visibility</small>
                  <strong>{visibility} km</strong>
                </div>
              </div>
            </Col>
            <Col xs={6} className="mb-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-sunrise me-2 text-warning"></i>
                <div>
                  <small className="text-muted d-block">Sunrise</small>
                  <strong>{sunrise}</strong>
                </div>
              </div>
            </Col>
            <Col xs={6} className="mb-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-sunset me-2 text-warning"></i>
                <div>
                  <small className="text-muted d-block">Sunset</small>
                  <strong>{sunset}</strong>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default WeatherCard;