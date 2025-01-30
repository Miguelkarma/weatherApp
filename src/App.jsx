import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import * as bootstrap from 'bootstrap';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';

function GfGWeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        loading: false,
        data: {},
        error: false,
    });
    const [history, setHistory] = useState([]);  // Added state for history

    useEffect(() => {
        // Fetch weather history on component mount
        axios.get("http://localhost:5000/weather-history")
            .then((response) => {
                setHistory(response.data);  // Update the history state with the response data
            })
            .catch((error) => {
                console.error("Error fetching weather history:", error);
            });
    }, []);

    const toDateFunction = () => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const WeekDays = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
        ];
        const currentDate = new Date();
        const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
        return date;
    };

    const search = async (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            event.preventDefault();
            setWeather({ ...weather, loading: true });

            const url = 'https://api.openweathermap.org/data/2.5/weather';
            const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

            try {
                const res = await axios.get(url, {
                    params: {
                        q: input,
                        units: 'metric',
                        appid: api_key,
                    },
                });

                setWeather({ data: res.data, loading: false, error: false });

                // Log weather data to the backend
                await axios.post("http://localhost:5000/log-weather", res.data)
                    .then((response) => {
                        console.log("Weather data logged:", response.data);
                    })
                    .catch((error) => {
                        console.error("Error logging weather data:", error);
                    });

            } catch (error) {
                setWeather({ ...weather, data: {}, error: true });
                setInput('');
                console.log('Error:', error);
            }
        }
    };

    return (
        <>
            <nav className="navbar fixed-top">
                <div className="container">
                    <a className="navbar-brand text-white fs-1" href="#">WeatherApp</a>
                    <button className="navbar-toggler bg-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="offcanvas offcanvas-start" tabindex="1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">WeatherApp</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="#">Home</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="App">
                <h1 className="app-name">Weather App</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        className="city-search"
                        placeholder="Enter City Name.."
                        name="query"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyPress={search}
                    />
                    <button className="search-button" onClick={search}>Search</button>
                </div>

                {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}
                {weather.error && <span className="error-message"><FontAwesomeIcon icon={faFrown} /><span style={{ fontSize: '20px' }}>City not found</span></span>}

                {weather && weather.data && weather.data.main && (
                    <div>
                        <div className="city-name">
                            <h2>{weather.data.name}, <span>{weather.data.sys.country}</span></h2>
                        </div>
                        <div className="date">
                            <span>{toDateFunction()}</span>
                        </div>
                        <div className="icon-temp">
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                                alt={weather.data.weather[0].description}
                            />
                            {Math.round(weather.data.main.temp)}
                            <sup className="deg">°C</sup>
                        </div>
                        <div className="des-wind">
                            <p>{weather.data.weather[0].description.toUpperCase()}</p>
                            <p>Wind Speed: {weather.data.wind.speed}m/s</p>
                        </div>

                        <h2>Weather History</h2>
                        {history && history.length > 0 ? (
                            <ul>
                                {history.map((entry) => (
                                    <li>
                                        <h3>{entry.name} ({entry.sys.country})</h3>
                                        <p>{Math.round(entry.main.temp)}°C</p>
                                        <p>{entry.weather[0].description}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No weather history available.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default GfGWeatherApp;
