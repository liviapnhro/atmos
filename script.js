const WEATHER_API = "5d925fb1befab307b64caa3321d983d2";

const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([20, 0], 2);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: ""
  }
).addTo(map);

const floatingCard = document.getElementById("floatingCard");
const closeCard = document.getElementById("closeCard");

const countryName = document.getElementById("countryName");
const capital = document.getElementById("capital");
const population = document.getElementById("population");
const region = document.getElementById("region");
const temperature = document.getElementById("temperature");
const weather = document.getElementById("weather");
const flag = document.getElementById("flag");

const places = [
  { name:"Brasil", country:"Brazil", lat:-15.77972, lon:-47.92972 },
  { name:"Estados Unidos", country:"United States", lat:38.8977, lon:-77.0365 },
  { name:"Canadá", country:"Canada", lat:45.4215, lon:-75.6972 },
  { name:"México", country:"Mexico", lat:19.4326, lon:-99.1332 },
  { name:"Argentina", country:"Argentina", lat:-34.6037, lon:-58.3816 },
  { name:"Reino Unido", country:"United Kingdom", lat:51.5072, lon:-0.1276 },
  { name:"França", country:"France", lat:48.8566, lon:2.3522 },
  { name:"Alemanha", country:"Germany", lat:52.5200, lon:13.4050 },
  { name:"Espanha", country:"Spain", lat:40.4168, lon:-3.7038 },
  { name:"Itália", country:"Italy", lat:41.9028, lon:12.4964 },
  { name:"Portugal", country:"Portugal", lat:38.7223, lon:-9.1393 },
  { name:"Rússia", country:"Russia", lat:55.7558, lon:37.6173 },
  { name:"China", country:"China", lat:39.9042, lon:116.4074 },
  { name:"Japão", country:"Japan", lat:35.6762, lon:139.6503 },
  { name:"Coreia do Sul", country:"South Korea", lat:37.5665, lon:126.9780 },
  { name:"Índia", country:"India", lat:28.6139, lon:77.2090 },
  { name:"Austrália", country:"Australia", lat:-33.8688, lon:151.2093 },
  { name:"Nova Zelândia", country:"New Zealand", lat:-41.2866, lon:174.7756 },
  { name:"África do Sul", country:"South Africa", lat:-25.7479, lon:28.2293 },
  { name:"Egito", country:"Egypt", lat:30.0444, lon:31.2357 }
];

async function loadInfo(place) {

  try {

    floatingCard.classList.add("active");

    countryName.innerText = "Carregando...";
    capital.innerText = "...";
    population.innerText = "...";
    region.innerText = "...";
    temperature.innerText = "...";
    weather.innerText = "...";

    const countryRes = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(place.country)}`
    );

    if (!countryRes.ok) {
      throw new Error("Erro REST Countries");
    }

    const countryData = await countryRes.json();

    const data = countryData[0];

    countryName.innerText = data.name?.common || place.name;
    capital.innerText = data.capital?.[0] || "N/A";
    population.innerText = data.population
      ? data.population.toLocaleString("pt-BR")
      : "N/A";
    region.innerText = data.region || "N/A";

    flag.src = data.flags?.png || "";
    flag.alt = data.name?.common || "";

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${place.lat}&lon=${place.lon}&appid=${WEATHER_API}&units=metric&lang=pt_br`
    );

    const weatherData = await weatherRes.json();

    if (weatherData.main) {

      temperature.innerText =
        Math.round(weatherData.main.temp) + "°C";

      weather.innerText =
        weatherData.weather[0].description;

    } else {

      temperature.innerText = "N/A";
      weather.innerText = "Sem dados";

    }

    map.flyTo([place.lat, place.lon], 4, {
      duration: 1.5
    });

  catch(error){

  alert(error.message);

  console.error(error);

  countryName.innerText = "Erro ao carregar";

}

}

const pinIcon = L.divIcon({
  className: "custom-pin",
  html: `
    <div class="pin-wrapper">
      <div class="pin-glow"></div>
      <div class="pin-core"></div>
    </div>
  `,
  iconSize: [24,24],
  iconAnchor: [12,12]
});

places.forEach(place => {

  const marker = L.marker(
    [place.lat, place.lon],
    { icon: pinIcon }
  ).addTo(map);

  marker.on("click", () => {
    loadInfo(place);
  });

});

document
.getElementById("searchInput")
.addEventListener("keyup", (e) => {

  const value = e.target.value.toLowerCase();

  const found = places.find(place =>
    place.name.toLowerCase().includes(value)
  );

  if(found && value.length > 2){
    loadInfo(found);
  }

});

closeCard.addEventListener("click", () => {
  floatingCard.classList.remove("active");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}