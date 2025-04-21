// ---------------------
// Theme Toggle Code
// ---------------------
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Use system preference if no theme is saved
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
    }

    themeToggle.addEventListener("click", function () {
      let currentTheme = document.documentElement.getAttribute("data-theme");
      let newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }
  
});

// ---------------------
// Sensor Data & Chart Functions
// ---------------------
// Replace with your Google Sheets published CSV URL
const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQrGVwwQ5G-LRO3T5xvQL5Gph_UkYGDV3ENDztO16C29mQ4B8FGheqXOswxZR6up5zb1e9Wfgn0ioQo/pub?gid=0&single=true&output=csv";

// Live Data Functions (used on live-data.html)
function fetchLiveData() {
  fetch(SHEET_URL)
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n").map((row) => row.split(","));
      if (rows.length < 2) return;

      // Extract the latest date from the data (skip header)
      const dateList = rows
        .slice(1)
        .map((row) => row[0]?.split(" ")[0]) // extract only the date part
        .filter(Boolean);

      const latestDate = dateList[dateList.length - 1]; // Get the most recent date

      // Filter the rows to only include those from the latest date
      const todayRows = rows.filter((row, index) => {
        if (index === 0) return true; // keep header
        return row[0]?.startsWith(latestDate);
      });

      updateLiveCharts(todayRows);
    })
    .catch((error) => console.error("Error fetching live data:", error));
}

function updateLiveCharts(data) {
  if (!data || data.length < 2) {
    console.warn("No data to display");
    return;
  }
  const labels = [];
  const tLabels = [];
  const PM10_VALUES = [];
  const PM2_5_VALUES = [];
  const O3_VALUES = [];
  const CO_VALUES = [];
  const CO2_VALUES = [];
  const CH4_VALUES = [];
  const NH3_VALUES = [];
  const VOC_VALUES = [];
  const NO2_VALUES = [];

  const TEMPERATURE_VALUES = [];
  const PRESSURE_VALUES = [];
  const HUMIDITY_VALUES = [];
  const WINDSPEED_VALUES = [];

  const AQI_O3_VALUES = [];
  const AQI_CO_VALUES = [];
  const AQI_NO2_VALUES = [];
  const AQI_PM2_5_VALUES = [];
  const AQI_PM10_VALUES = [];

  // Log the header to confirm expected columns
  console.log("Header row:", data[0]);

  // Skip header row (assumed first row)
  for (let i = 1; i < data.length; i++) {
    if (data[i].length < 6) continue;
    labels.push(data[i][1]); // Timestamp
    
    PM10_VALUES.push(parseFloat(data[i][6]));
    PM2_5_VALUES.push(parseFloat(data[i][5]));
    O3_VALUES.push(parseFloat(data[i][7]));
    CO_VALUES.push(parseFloat(data[i][9]));
    CO2_VALUES.push(parseFloat(data[i][8]));

    CH4_VALUES.push(parseFloat(data[i][10]));
    NH3_VALUES.push(parseFloat(data[i][11]));
    VOC_VALUES.push(parseFloat(data[i][12]));
    NO2_VALUES.push(parseFloat(data[i][13]));
    TEMPERATURE_VALUES.push(parseFloat(data[i][14]));
    PRESSURE_VALUES.push(parseFloat(data[i][15]));
    HUMIDITY_VALUES.push(parseFloat(data[i][16]));
    WINDSPEED_VALUES.push(parseFloat(data[i][17]));
    AQI_O3_VALUES.push(parseFloat(data[i][18]));
    AQI_CO_VALUES.push(parseFloat(data[i][19]));
    AQI_NO2_VALUES.push(parseFloat(data[i][20]));
    AQI_PM2_5_VALUES.push(parseFloat(data[i][21]));
    AQI_PM10_VALUES.push(parseFloat(data[i][22]));
  }
  tLabels.push(data[1][0]);	//Date
  console.log("Labels:", labels);
  console.log("VOC values:", VOC_VALUES);

  createOrUpdateChart("PM2_5_CHART", "PM₂.₅", labels, PM2_5_VALUES, "red", "µg/m³", tLabels);
  createOrUpdateChart("PM10_CHART", "PM₁₀", labels, PM10_VALUES, "blue", "µg/m³", tLabels);
  createOrUpdateChart("O3_CHART", "OZONE (O₃)", labels, O3_VALUES, "green", "ppm", tLabels);
  createOrUpdateChart("CO_CHART", "CARBON MONOXIDE (CO)", labels, CO_VALUES, "purple", "ppm", tLabels);
  createOrUpdateChart("CO2_CHART", "CARBON DIOXIDE (CO₂)", labels, CO2_VALUES, "orange", "ppm", tLabels);
  createOrUpdateChart("CH4_CHART", "METHANE (CH₄)", labels, CH4_VALUES, "red", "ppm", tLabels);
  createOrUpdateChart("NH3_CHART", "AMMONIA (NH₃)", labels, NH3_VALUES, "blue", "ppm", tLabels);
  createOrUpdateChart("VOC_CHART", "VOC", labels, VOC_VALUES, "green", "ppm", tLabels);
  createOrUpdateChart("NO2_CHART", "NITROGEN DI OXIDE (NO₂)", labels, NO2_VALUES, "purple", "ppm", tLabels);

  createOrUpdateChart("TEMP_CHART", "TEMPERATURE", labels, TEMPERATURE_VALUES, "orange", "°C", tLabels);
  createOrUpdateChart("PRESSURE_CHART", "PRESSURE", labels, PRESSURE_VALUES, "red", "Pa", tLabels);
  createOrUpdateChart("HUMID_CHART", "HUMIDITY", labels, HUMIDITY_VALUES, "blue", "%", tLabels);
  createOrUpdateChart("WIND_CHART", "WINDSPEED", labels, WINDSPEED_VALUES, "green", "m/s", tLabels);
}

function createOrUpdateChart(canvasId, label, labels, dataValues, color, yAxisParameter, timeLabel) {
  const canvasElem = document.getElementById(canvasId);
  if (!canvasElem) return; // Exit if the canvas is missing

  const ctx = canvasElem.getContext("2d");
  let chartInstance = window[canvasId];

  // Check if chartInstance exists and has data defined
  if (chartInstance && chartInstance.data) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = dataValues;
    chartInstance.update();
  } else {
    // Create a new chart instance if one doesn't exist or is not valid
    window[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: dataValues,
            borderColor: color,
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: ("Time" + "\t" + "(" + timeLabel + ")"),
            },
            grid: {
              color: "#ccc", // Light grid lines for visibility
            },
          },
          y: {
		  min: 0,
            title: {
              display: true,
              text: yAxisParameter,
            },
            grid: {
              color: "#ccc",
            },
          },
          // x: { title: { display: true, text: "Time" } },
          // y: { title: { display: true, text: "Value" } }
        },
      },
    });
  }
}

function fetchMultiParameterData() {
  fetch(SHEET_URL)
    .then(response => response.text())
    .then((data) => {
      const rows = data.split("\n").map(row => row.split(","));
      if (rows.length < 2) return;

      // Get the most recent date
      const dateList = rows.slice(1).map(row => row[0]?.split(" ")[0]).filter(Boolean);
      const latestDate = dateList[dateList.length - 1];
      const tLabel = [];
      // Filter only rows from latest date
      const todayRows = rows.filter((row, index) => {
        if (index === 0) return true;
        return row[0]?.startsWith(latestDate);
      });

      const header = todayRows[0];
      const labels = [];
      const parameters = {};
      PM_parameters = {};
      for (let col = 18; col < header.length; col++) {
        if(col < 21)
        parameters[col] = [];
      if(col > 20)
        PM_parameters[col] = [];
      }

      for (let i = 1; i < todayRows.length; i++) {
        if (todayRows[i].length < header.length) continue;
        labels.push(todayRows[i][1]);
        for (let col = 18; col < header.length; col++) {
          //parameters[col].push(parseFloat(todayRows[i][col]));
		   if(col < 21)
            parameters[col].push(parseFloat(todayRows[i][col]));
          if(col > 20)
            PM_parameters[col].push(parseFloat(todayRows[i][col]));
        }
      }
	    tLabel.push(todayRows[1][0]);
            const colors = ["red", "blue", "green", "purple", "orange", "brown"];
      const datasets = [];
      const PM_datasets = [];
      let colorIndex = 0;
      for (let col = 18; col < header.length; col++) {
        switch(col) {
          case 18:
          datasets.push({
            label: "AQI (O₃)", // e.g., "ParameterA"
            data: parameters[col],
            borderColor: colors[colorIndex % colors.length],
            borderWidth: 2,
            fill: false,
          });
          colorIndex++;
          break;
          case 19:
            datasets.push({
              label: "AQI (CO)", // e.g., "ParameterA"
              data: parameters[col],
              borderColor: colors[colorIndex % colors.length],
              borderWidth: 2,
              fill: false,
            });
            colorIndex++;
          break;
          case 20:
            datasets.push({
              label: "AQI (NO)", // e.g., "ParameterA"
              data: parameters[col],
              borderColor: colors[colorIndex % colors.length],
              borderWidth: 2,
              fill: false,
            });
            colorIndex++;
          break;
          case 21:
          PM_datasets.push({
            label: "PM₂.₅", // e.g., "ParameterA"
            data: PM_parameters[col],
            borderColor: colors[colorIndex % colors.length],
            borderWidth: 2,
            fill: false,
          });
          colorIndex++;
          break;
          case 22:
            PM_datasets.push({
            label: "PM₁₀", // e.g., "ParameterA"
            data: PM_parameters[col],
            borderColor: colors[colorIndex % colors.length],
            borderWidth: 2,
            fill: false,
          });
          colorIndex++;
            break;
        }
      }
      

      createMultiParameterChart("AQI_CHART", "AQI", labels, datasets, tLabel);
      createMultiParameterChart("PM_AQI_CHART", "PM_AQI", labels, PM_datasets, tLabel);
    })
    .catch(error => console.error("Error fetching multi-parameter data:", error));
}

function createMultiParameterChart(canvasId, chartTitle, labels, datasets, timeLabel) {
  const canvasElem = document.getElementById(canvasId);
  if (!canvasElem) return;
  const ctx = canvasElem.getContext("2d");

    // Check if a chart instance already exists for this canvas
    if (window[canvasId] && window[canvasId].data) {
      // Update the chart's labels and datasets
      window[canvasId].data.labels = labels;
      window[canvasId].data.datasets = datasets;
      window[canvasId].update();
    } else {
  // Create a new Chart.js line chart with multiple datasets
  window[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // X-axis labels (timestamps)
      datasets: datasets // Array of dataset objects
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: chartTitle
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: ("Time" + "\t" + "(" + timeLabel + ")"),
          }
        },
        y: {
		min: 0,
          title: {
            display: true,
            text: "Value"
          }
        }
      }
    }
  });
}
}


// If on the live-data page (detected by presence of one of the chart canvases), fetch live data
if (document.getElementById("VOC_CHART")) {
  fetchLiveData();
  fetchMultiParameterData();
  setInterval(fetchLiveData, 60000); // Auto-update every minute
}

// ---------------------
// Historical Data Functions (used on history.html)
document.addEventListener("DOMContentLoaded", function () {
  const viewHistoryBtn = document.getElementById("viewHistoryBtn");
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener("click", fetchHistoryData);
  }
});

function fetchHistoryData() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  fetch(SHEET_URL)
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n").map((row) => row.split(","));
      // Filter rows by date (assuming the timestamp is in YYYY-MM-DD format)
      const filteredRows = rows.filter((row, index) => {
        if (index === 0) return true; // keep header row
        const dateStr = row[0];
        return dateStr >= startDate && dateStr <= endDate;
      });
      updateHistoryChart(filteredRows);
    })
    .catch((error) => console.error("Error fetching history data:", error));
}

function updateHistoryChart(data) {
  if (!data || data.length < 2){
    console.warn("No data to display");
    return;
  } 
  const labels = [];
  const VOC_VALUES = [];
  // For demonstration, we'll plot only the MQ4 sensor data.
  for (let i = 1; i < data.length; i++) {
    if (data[i].length < 2) continue;
    labels.push(data[i][0]);
    VOC_VALUES.push(parseFloat(data[i][1]));
  }
  createOrUpdateChart(
    "historyChart",
    "MQ4 (Methane) History",
    labels,
    VOC_VALUES,
    "red",
    "ppm"
  );
}

// ---------------------
// (No PDF generation code is needed now since the download page uses a direct link)
