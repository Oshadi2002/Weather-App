import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/api/weather";

export const getWeather = async (token) => {
  console.log("Fetching weather data with token:", token);
  
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Weather data fetched:", res.data);
  return res.data;
};

