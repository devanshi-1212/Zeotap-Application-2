import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  // bool variable to display result for 6 cities when website is loaded.
  const [init, setInit] = useState(0);

  // array of string to maintain which cities' result is being displayed.
  const [city, setCity] = useState("");

  // array of object to store result received from server about each city.
  const [result, setResult] = useState([]);

  // array of integer to maintain temperature of each city because user can do temperature conversions,
  // so temp. conversions are also updated here.
  const [temp, setTemp] = useState([]);

  // array of string to maintain which unit user wants to change temp. to.
  const [selectedTempOption, setSelectedTempOption] = useState([]);
  const [showTempOption, setShowTempOption] = useState([]);

  // array of string to maintain temp. threshold options (1. Below threshold 2. Above threshold).
  const [tempThresOption, setTempThresOption] = useState([]);

  // array of integer to maintain what temp. threshold user entered
  const [tempThres, setTempThres] = useState([]);

  // array of object with attributes (1. threshold 2. option) to maintain alerts set by user for each city
  // when clicked on Set Alert button.
  const [tempAlert, setTempAlert] = useState([]);

  // array to store details for the city.
  const [details, setDetails] = useState([]);

  // array of strings whose results we always want on screen.
  const cities = [
    "Delhi",
    "Mumbai",
    "Chennai",
    "Bangalore",
    "Kolkata",
    "Hyderabad",
  ];

  // options for user to choose from to convert temperature.
  const options = [
    { value: "Choose", label: "Choose" },
    { value: "Fahrenheit", label: "Fahrenheit" },
    { value: "Celcius", label: "Celcius" },
    { value: "Kelvin", label: "Kelvin" },
  ];

  // this function is called only once to display weather details on the screen for the 6 cities mentioned
  // in the assignment. user can add more cities apart from these 6 cities.
  const initialise = async () => {
    // get initial results
    for (let i = 0; i < cities.length; i++) {
      const c = cities[i];

      try {
        const response = await axios.get(`http://localhost:5000/chk?city=${c}`);

        setResult((result) => [...result, response.data]);
        setTemp((temp) => [...temp, response.data.temp]);
        setCity("");
        setSelectedTempOption((selectedTempOption) => [
          ...selectedTempOption,
          "Kelvin",
        ]);
        setShowTempOption((showTempOption) => [...showTempOption, "Choose"]);
        setTempAlert((tempAlert) => [
          ...tempAlert,
          { threshold: 0, option: "Below threshold" },
        ]);
        setDetails((prev) => [...prev, [0, 0, 0, "-"]]);
      } catch (err) {
        console.log("error fetching data.", err);
      }
    }

    setInit(1);
  };

  // initialise() function is called only once by setting setInit to 1.
  if (init === 0) {
    initialise();
    setInit(1);
  }

  // function to display weather details for user entered city.
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(city);

    if (!city) return;

    const existIndex = result.findIndex((data) => data.location === city);
    if (existIndex !== -1) {
      console.log("city exists");
      alert("City already exists.");
      setCity("");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/chk?city=${city}`
      );

      setResult((result) => [...result, response.data]);
      setTemp((temp) => [...temp, response.data.temp]);
      setCity("");
      setSelectedTempOption((selectedTempOption) => [
        ...selectedTempOption,
        "Kelvin",
      ]);
      setShowTempOption((showTempOption) => [...showTempOption, "Choose"]);
      setTempAlert([...tempAlert, { threshold: 0, option: "Below threshold" }]);
      setDetails((prev) => [...prev, [0, 0, 0, "-"]]);
    } catch (err) {
      console.log("error fetching data.", err);
    }
  };

  // fetch real-time data every 5 minutes.
  useEffect(() => {
    const realTimeData = async () => {
      if (result.length === 0) return;

      const weatherPromises = result.map(async (data) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/chk?city=${data.location}`
          );
          return response.data;
        } catch (err) {
          console.error("Error fetching weather for", data.location, err);
          return null;
        }
      });

      const updatedResult = await Promise.all(weatherPromises);

      for (let i = 0; i < updatedResult.length; i++) {
        const currentTemp = (updatedResult[i].temp - 273.15).toFixed(2);
        const prevTemp = (Number(result[i].temp) - 273.15).toFixed(2);

        if (
          tempAlert[i].option === "Below threshold" &&
          currentTemp < tempAlert[i].threshold &&
          prevTemp < tempAlert[i].threshold
        )
          console.log(
            "Temperature went below threshold for city " +
              updatedResult[i].location
          );
        else if (
          tempAlert[i].option === "Above threshold" &&
          currentTemp > tempAlert[i].threshold &&
          prevTemp > tempAlert[i].threshold
        )
          console.log(
            "Temperature went above threshold for city " +
              updatedResult[i].location
          );
      }

      setResult(updatedResult.filter((data) => data));
      setSelectedTempOption(Array(updatedResult.length).fill("Kelvin"));
      setShowTempOption(Array(updatedResult.length).fill("Choose"));
      setTemp(
        updatedResult.map((data) => {
          return data.temp;
        })
      );
    };

    const fetchSummary = async () => {
      if (result.length === 0) return;

      for (let i = 0; i < result.length; i++) {
        const c = result[i].location;

        try {
          const curdate = new Date().toLocaleDateString();
          const date = format(new Date(curdate), "dd/MM/yyyy");

          await axios
            .get(`http://localhost:5000/avg_temp?city=${c}&date=${date}`)
            .then((response) => {
              const updatedDetails = [...details];
              updatedDetails[i][0] = response.data[0].Avg_Temp;
              setDetails(updatedDetails);
            })
            .catch((err) => console.log(err));

          await axios
            .get(`http://localhost:5000/min_temp?city=${c}&date=${date}`)
            .then((response) => {
              const updatedDetails = [...details];
              updatedDetails[i][1] = response.data[0].Min_Temp;
              setDetails(updatedDetails);
            })
            .catch((err) => console.log(err));

          await axios
            .get(`http://localhost:5000/max_temp?city=${c}&date=${date}`)
            .then((response) => {
              const updatedDetails = [...details];
              updatedDetails[i][2] = response.data[0].Max_Temp;
              setDetails(updatedDetails);
            })
            .catch((err) => console.log(err));

          await axios
            .get(
              `http://localhost:5000/dominant_weather?city=${c}&date=${date}`
            )
            .then((response) => {
              const updatedDetails = [...details];
              updatedDetails[i][3] = response.data[0].Main;
              setDetails(updatedDetails);
            })
            .catch((err) => console.log(err));
        } catch (err) {
          console.log(err);
        }
      }
    };

    const intervalId = setInterval(() => {
      realTimeData();
      fetchSummary();
    }, 5 * 1000);

    return () => clearInterval(intervalId);
  }, [result]);

  // function for temperature conversion.
  const handleTempOptionChange = (e, index) => {
    if (e.target.value === "Celcius") {
      if (selectedTempOption[index] === "Kelvin")
        temp[index] = Number(temp[index] - 273.15).toFixed(2);
      else if (selectedTempOption[index] === "Fahrenheit")
        temp[index] = Number(((temp[index] - 32) * 5) / 9).toFixed(2);
    } else if (e.target.value === "Fahrenheit") {
      if (selectedTempOption[index] === "Kelvin")
        temp[index] = Number(((temp[index] - 273.15) * 9) / 5 + 32).toFixed(2);
      else if (selectedTempOption[index] === "Celcius")
        temp[index] = Number((temp[index] * 9) / 5 + 32).toFixed(2);
    } else if (e.target.value === "Kelvin") {
      if (selectedTempOption[index] === "Fahrenheit")
        temp[index] = Number(((temp[index] - 32) * 5) / 9 + 273.15).toFixed(2);
      else if (selectedTempOption[index] === "Celcius")
        temp[index] = Number(temp[index]) + 273.15;
    }

    if (e.target.value !== selectedTempOption[index]) {
      const p = [...selectedTempOption];
      p[index] = e.target.value;
      setSelectedTempOption(p);

      const q = [...showTempOption];
      q[index] = e.target.value;
      setShowTempOption(q);
    }
  };

  // function to handle change in temperature threshold input.
  const handleTempThres = (e, index) => {
    const updatedResult = [...tempThres];
    updatedResult[index] = e.target.value;
    setTempThres(updatedResult);
  };

  // function to handle change in temperature threshold option.
  const handleTempThresOption = (e, index) => {
    const updatedResult = [...tempThresOption];
    updatedResult[index] = e.target.value;
    setTempThresOption(updatedResult);
  };

  // function to maintain alerts for each city.
  const handleSetAlert = (index) => {
    if (tempThresOption[index] === undefined || tempThres[index] === undefined)
      return;

    const updatedResult = [...tempAlert];
    updatedResult[index].threshold = tempThres[index];
    updatedResult[index].option = tempThresOption[index];
    setTempAlert(updatedResult);
  };

  return (
    <div className="body">
      <h3>Enter city name:</h3>

      <input
        className="city-input"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button className="city-submit-btn" onClick={(e) => handleSubmit(e)}>
        Submit
      </button>

      <div>
        {result.length > 0 &&
          result.map((data, index) => {
            return (
              <div className="contain">
                <div className="city-item" key={index}>
                  <p>
                    {index + 1}. {data.location}:
                  </p>

                  <ul>
                    <li className="list-item">main = {data.main}</li>
                    <li className="list-item">
                      <p>
                        temp = {temp[index]} {selectedTempOption[index]}
                      </p>

                      <div className="temp-change">
                        <p>Change temperature to: </p>

                        <select
                          className="tempunit-option-select"
                          value={showTempOption[index]}
                          onChange={(e) => handleTempOptionChange(e, index)}
                        >
                          {options.map((option, opindex) => (
                            <option key={opindex} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                    <li className="list-item">
                      feels_like = {data.feels_like}
                    </li>
                    <li className="list-item">dt = {data.dt}</li>
                    <li className="list-item">time={data.time}</li>
                  </ul>

                  <div>
                    <p>
                      Receive temperature alerts for this city by entering
                      temperature threshold{" "}
                    </p>
                    <p>(in Degree Celsius):</p>

                    <input
                      className="thres-input"
                      type="text"
                      placeholder="eg. 35.3"
                      onChange={(e) => handleTempThres(e, index)}
                    />

                    <select
                      className="thres-option-select"
                      value={tempThresOption[index]}
                      onChange={(e) => handleTempThresOption(e, index)}
                    >
                      <option>Choose</option>
                      <option>Below threshold</option>
                      <option>Above threshold</option>
                    </select>

                    <button
                      className="alert-btn"
                      onClick={() => handleSetAlert(index)}
                    >
                      Set alert
                    </button>
                  </div>
                </div>

                <div>
                  <p>Daily Summary:</p>

                  <ol>
                    <li>
                      Average Temperature: {details[index][0]?.toFixed(2)}
                    </li>
                    <li>
                      Minimum Temperature: {details[index][1]?.toFixed(2)}
                    </li>
                    <li>
                      Maximum Temperature: {details[index][2]?.toFixed(2)}
                    </li>
                    <li>Dominant Weather: {details[index][3]}</li>
                  </ol>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
