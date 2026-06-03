// Initialize Lucide icons
lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
    // ─── Toggles & Controls ──────────────────────────────────────────────────
    const toggleCoords = document.getElementById("toggle-coords");
    const toggleAddress = document.getElementById("toggle-address");
    const toggleMapTile = document.getElementById("toggle-maptile");
    const toggleWeather = document.getElementById("toggle-weather");
    const selectDate = document.getElementById("select-date");
    const selectTime = document.getElementById("select-time");

    // Mockup card elements
    const mockupCard = document.getElementById("mockup-watermark");
    const mockupMap = document.getElementById("mockup-map-container");
    const mockupCoords = document.getElementById("mockup-coords");
    const mockupAltAcc = document.getElementById("mockup-alt-acc");
    const mockupCity = document.getElementById("mockup-city");
    const mockupSub = document.getElementById("mockup-sub");
    const mockupWeather = document.getElementById("mockup-weather");

    // Simulator card elements
    const simCard = document.getElementById("sim-watermark-card");
    const simMap = document.getElementById("sim-map-tile");
    const simCoords = document.getElementById("sim-coords");
    const simAltAcc = document.getElementById("sim-alt-acc");
    const simCity = document.getElementById("sim-city");
    const simSub = document.getElementById("sim-sub");
    const simWeather = document.getElementById("sim-weather");

    // ─── Apply Customizations ────────────────────────────────────────────────
    function updateWatermarks() {
        const showCoords = toggleCoords.checked;
        const showAddress = toggleAddress.checked;
        const showMap = toggleMapTile.checked;
        const showWeather = toggleWeather.checked;

        // Coordinates visibility
        const coordsDisplay = showCoords ? "block" : "none";
        mockupCoords.style.display = coordsDisplay;
        mockupAltAcc.style.display = coordsDisplay;
        simCoords.style.display = coordsDisplay;
        simAltAcc.style.display = coordsDisplay;

        // Address visibility
        const addressDisplay = showAddress ? "block" : "none";
        mockupCity.style.display = addressDisplay;
        mockupSub.style.display = addressDisplay;
        simCity.style.display = addressDisplay;
        simSub.style.display = addressDisplay;

        // Map Tile visibility
        const mapDisplay = showMap ? "block" : "none";
        mockupMap.style.display = mapDisplay;
        simMap.style.display = mapDisplay;

        // Weather visibility
        const weatherDisplay = showWeather ? "block" : "none";
        mockupWeather.style.display = weatherDisplay;
        simWeather.style.display = weatherDisplay;
    }

    // Connect listeners
    [toggleCoords, toggleAddress, toggleMapTile, toggleWeather].forEach(toggle => {
        toggle.addEventListener("change", updateWatermarks);
    });

    // ─── Ticking Clock Simulator ──────────────────────────────────────────────
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function getFormattedDateTime() {
        const now = new Date();
        const dateFmt = selectDate.value;
        const timeFmt = selectTime.value;

        // Date string builder
        let dateStr = "";
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const monthLong = months[now.getMonth()];
        const year = now.getFullYear();

        if (dateFmt === "dd/MM/yyyy") {
            dateStr = `${day}/${month}/${year}`;
        } else if (dateFmt === "MM/dd/yyyy") {
            dateStr = `${month}/${day}/${year}`;
        } else if (dateFmt === "yyyy-MM-dd") {
            dateStr = `${year}-${month}-${day}`;
        } else if (dateFmt === "dd MMM yyyy") {
            dateStr = `${day} ${monthLong} ${year}`;
        }

        // Time string builder
        let timeStr = "";
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";

        if (timeFmt === "12h") {
            const h12 = hours % 12 || 12;
            timeStr = `${String(h12).padStart(2, "0")}:${minutes} ${ampm}`;
        } else {
            timeStr = `${String(hours).padStart(2, "0")}:${minutes}`;
        }

        const weekday = weekdays[now.getDay()];
        return `${weekday} ${dateStr} ${timeStr} GMT+05:30`;
    }

    function tickClock() {
        const formatted = getFormattedDateTime();
        document.getElementById("mockup-datetime").textContent = formatted;
        document.getElementById("sim-datetime").textContent = formatted;
    }

    // Start clock interval
    setInterval(tickClock, 1000);
    tickClock(); // initial run

    // Format listeners
    selectDate.addEventListener("change", tickClock);
    selectTime.addEventListener("change", tickClock);

    // Initial setup run
    updateWatermarks();
});
