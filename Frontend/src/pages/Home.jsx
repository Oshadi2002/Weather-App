import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import './WeatherApp.css';
import { useAuth } from '../Apis/auth';
import AuthCard from '../compnonents/AuthCard';
import WeatherCard from '../compnonents/weatherCard';
import { getWeather } from '../Apis/weather';

function Home() {
  const { isAuthenticated, isLoading, getToken, logout } = useAuth();
  const [weatherData, setWeatherData] = useState([]);
  const [tokenAcquired, setTokenAcquired] = useState(false);

  // Fetch weather data when authenticated
  useEffect(() => {
    const initializeWeatherData = async () => {
      try {
        const token = await getToken();
        if (token) {
          setTokenAcquired(true);
          const weatherRes = await getWeather(token);
          setWeatherData(weatherRes.data);
        }
      } catch (err) {
        console.error('Failed to initialize weather data:', err);
      }
    };

    if (isAuthenticated) {
      initializeWeatherData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setTokenAcquired(false);
    setWeatherData([]);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const showWeather = isAuthenticated && tokenAcquired;

  return (
    <div className="weather-app-container">
      {/* Header with Logout Button */}
      {isAuthenticated && (
        <nav className="app-header">
          <Container fluid className="d-flex justify-content-between align-items-center py-3">
            <h2 className="text-white mb-0 center-text">Weather App</h2>
            <Button 
              variant="glass" 
              onClick={handleLogout}
              className="logout-btn"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </Button>
          </Container>
        </nav>
      )}
      
      <div className={`weather-app ${!showWeather ? 'blurred' : ''}`}>
        <Container fluid className="py-4 px-md-4">
          {showWeather ? (
            <div className="weather-dashboard">
              <Row className="g-4">
                {weatherData.length > 0 ? (
                  weatherData.map((data) => (
                    <Col key={data.cityCode} xs={12} sm={6} lg={4} xl={3}>
                      <WeatherCard
                        city={data.cityName}
                        country={data.country || 'Unknown'}
                        time={new Date(data.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        condition={data.weather.description}
                        temperature={Math.round(data.temperature.current)}
                        tempMin={Math.round(data.temperature.min)}
                        tempMax={Math.round(data.temperature.max)}
                        pressure={data.pressure}
                        humidity={data.humidity}
                        visibility={(data.visibility / 1000).toFixed(1)}
                        sunrise="--"
                        sunset="--"
                        icon={data.weather.icon}
                      />
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <div className="text-center text-white py-5">
                      <i className="bi bi-cloud-slash-fill display-4 d-block mb-3"></i>
                      <h4>No weather data available</h4>
                      <p className="text-white-50">Try refreshing the page</p>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          ) : isAuthenticated ? (
            <div className="spinner-container">
              <Spinner animation="border" variant="light" size="lg" />
              <h4 className="text-white mt-3">Setting up your dashboard...</h4>
            </div>
          ) : (
            <div className="welcome-content">
              <i className="bi bi-cloud-sun display-1 mb-4"></i>
              <h4>Welcome to Weather Dashboard</h4>
              <p>Access real-time weather information for cities worldwide</p>
            </div>
          )}
          
          {isAuthenticated && (
            <footer className="text-center mt-5">
              <p className="text-white-50">
                © {new Date().getFullYear()} Weather Dashboard. All rights reserved.
              </p>
            </footer>
          )}
        </Container>
      </div>

      {/* Centered Auth Card with Animation */}
      {!isAuthenticated && (
        <div className="auth-overlay">
          <div className="auth-container">
            <AuthCard />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;