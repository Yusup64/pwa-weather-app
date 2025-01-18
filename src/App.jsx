import React, { useEffect, useState } from "react";
import { fetchWeather } from "./api/fetchWeather";
import "./main.css";

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(localStorage.getItem("isCelsius") === "true");

  const [localStorageCities, setLocalStorageCities] = useState(JSON.parse(localStorage.getItem("cityName")) || []);

  const fetchData = async (cityName) => {
    setLoading(true);
    try {
      const data = await fetchWeather(cityName);
      setWeatherData(data);
      setCityName("");
      setError(null);
      saveToLocalStorage(cityName);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (!cityName) {
        setError("Please enter a city name");
        return;
      }
      fetchData(cityName);
    }
  }


  const saveToLocalStorage = (cityName) => {
    const newCities = localStorageCities.includes(cityName) ? localStorageCities : [cityName, ...localStorageCities];
    setLocalStorageCities(newCities);
    localStorage.setItem("cityName", JSON.stringify(newCities));
  }

  useEffect(() => {
    // by default, get the first city from localStorageCities
    if (localStorageCities.length > 0) {
      fetchData(localStorageCities[0]);
    }
  }, [localStorageCities]);

  return (
    <>
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="container p-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Enter city name..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="btn btn-danger ms-2" onClick={() => {
            setIsCelsius(!isCelsius);
            localStorage.setItem("isCelsius", !isCelsius);
          }}>Celsius/Fahrenheit</button>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {
          localStorageCities?.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-3">Recent Searches</h2>
              <ul className="list-group">
                {localStorageCities.map((city) => (
                  <li key={city}
                    className={`list-group-item cursor-pointer ${city.toLowerCase() === weatherData?.location?.name?.toLowerCase() ? "active" : ""}`}
                    onClick={() => {
                      fetchData(city);
                    }
                    }>{city}</li>
                ))}
              </ul>
            </div>
          )
        }
        {weatherData && (
          <div className="mt-5 p-3 rounded-3 bg-light shadow-sm">
            <h2>
              {weatherData.location.name}, {weatherData.location.region},{" "}
              {weatherData.location.country}
            </h2>
            <p>
              Temperature: <strong>{isCelsius ? weatherData.current.temp_c : weatherData.current.temp_f} °{isCelsius ? "C" : "F"}</strong>
            </p>
            <p>Condition: <strong>{weatherData.current.condition.text}</strong></p>
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
            />
            <p>Humidity: <strong>{weatherData.current.humidity}</strong></p>
            <p>Pressure: <strong>{weatherData.current.pressure_mb}</strong></p>
            <p>Visibility: <strong>{weatherData.current.vis_km}</strong></p>
          </div>
        )}
      </div>
    </>

  );
};

export default App;
