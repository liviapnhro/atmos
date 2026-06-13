const WEATHER_API =
  "5d925fb1befab307b64caa3321d983d2";

const map = L.map("map", {

  zoomControl:false,
  scrollWheelZoom:false,
  doubleClickZoom:false

}).setView([20,0],2);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:""
  }
).addTo(map);

map.dragging.disable();

const floatingCard =
  document.getElementById("floatingCard");

const closeCard =
  document.getElementById("closeCard");

const countryName =
  document.getElementById("countryName");

const capital =
  document.getElementById("capital");

const population =
  document.getElementById("population");

const region =
  document.getElementById("region");

const temperature =
  document.getElementById("temperature");

const weather =
  document.getElementById("weather");

const flag =
  document.getElementById("flag");

const places = [

  {
    name:"Brasil",
    country:"Brazil",
    lat:-15.77972,
    lon:-47.92972
  },

  {
    name:"Estados Unidos",
    country:"United States",
    lat:38.8977,
    lon:-77.0365
  },

  {
    name:"Japão",
    country:"Japan",
    lat:35.6762,
    lon:139.6503
  },

  {
    name:"França",
    country:"France",
    lat:48.8566,
    lon:2.3522
  },

  {
    name:"Canadá",
    country:"Canada",
    lat:45.4215,
    lon:-75.6972
  },

  {
    name:"Austrália",
    country:"Australia",
    lat:-33.8688,
    lon:151.2093
  },

  {
    name:"China",
    country:"China",
    lat:39.9042,
    lon:116.4074
  },

  {
    name:"Rússia",
    country:"Russia",
    lat:55.7558,
    lon:37.6173
  },

  {
    name:"Alemanha",
    country:"Germany",
    lat:52.5200,
    lon:13.4050
  },

  {
    name:"Argentina",
    country:"Argentina",
    lat:-34.6037,
    lon:-58.3816
  },

  {
    name:"México",
    country:"Mexico",
    lat:19.4326,
    lon:-99.1332
  },

  {
    name:"Itália",
    country:"Italy",
    lat:41.9028,
    lon:12.4964
  },

  {
    name:"Coreia do Sul",
    country:"South Korea",
    lat:37.5665,
    lon:126.9780
  },

  {
    name:"Índia",
    country:"India",
    lat:28.6139,
    lon:77.2090
  },

  {
    name:"Egito",
    country:"Egypt",
    lat:30.0444,
    lon:31.2357
  },

  {
    name:"Espanha",
    country:"Spain",
    lat:40.4168,
    lon:-3.7038
  },

  {
    name:"Portugal",
    country:"Portugal",
    lat:38.7223,
    lon:-9.1393
  },

  {
    name:"Chile",
    country:"Chile",
    lat:-33.4489,
    lon:-70.6693
  },

  {
    name:"Colômbia",
    country:"Colombia",
    lat:4.7110,
    lon:-74.0721
  },

  {
    name:"Peru",
    country:"Peru",
    lat:-12.0464,
    lon:-77.0428
  },

  {
    name:"África do Sul",
    country:"South Africa",
    lat:-25.7479,
    lon:28.2293
  },

  {
    name:"Turquia",
    country:"Turkey",
    lat:39.9334,
    lon:32.8597
  },

  {
    name:"Arábia Saudita",
    country:"Saudi Arabia",
    lat:24.7136,
    lon:46.6753
  },

  {
    name:"Noruega",
    country:"Norway",
    lat:59.9139,
    lon:10.7522
  },

  {
    name:"Suécia",
    country:"Sweden",
    lat:59.3293,
    lon:18.0686
  },

  {
    name:"Finlândia",
    country:"Finland",
    lat:60.1699,
    lon:24.9384
  },

  {
    name:"Nova Zelândia",
    country:"New Zealand",
    lat:-41.2865,
    lon:174.7762
  },

  {
    name:"Indonésia",
    country:"Indonesia",
    lat:-6.2088,
    lon:106.8456
  },

  {
    name:"Tailândia",
    country:"Thailand",
    lat:13.7563,
    lon:100.5018
  },

  {
    name:"Grécia",
    country:"Greece",
    lat:37.9838,
    lon:23.7275
  }

];

async function loadInfo(place){

  floatingCard.classList.add("active");

  try{

    const countryRes = await fetch(
  `https://restcountries.com/v3.1/name/${encodeURIComponent(place.country)}`
);

const countryData = await countryRes.json();

const data = countryData[0];

    countryName.innerText =
      data.name.common;

    capital.innerText =
      data.capital?.[0] || "N/A";

    population.innerText =
      data.population.toLocaleString();

    region.innerText =
      data.region;

    flag.src =
      data.flags.png;

    const weatherRes =
      await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${place.lat}&lon=${place.lon}&appid=${WEATHER_API}&units=metric&lang=pt_br`
      );

    const weatherData =
      await weatherRes.json();

    console.log(weatherData);

    if(weatherData.cod == 200){

      temperature.innerText =
        Math.round(
          weatherData.main.temp
        ) + "°C";

      weather.innerText =
        weatherData.weather[0].description;

    }else{

      temperature.innerText =
        "Erro";

      weather.innerText =
        "API inválida";

    }

  }catch(error){

    console.log(error);

  }

}

places.forEach(place => {

  const modernIcon = L.divIcon({

    className:"custom-pin",

    html:`
      <div class="pin-glow"></div>
      <div class="pin-core"></div>
    `,

    iconSize:[28,28],

    iconAnchor:[14,14]

  });

  const marker = L.marker(
    [place.lat, place.lon],
    {
      icon:modernIcon
    }
  ).addTo(map);

  marker.on("click", ()=>{

    loadInfo(place);

  });

});

closeCard.addEventListener("click", ()=>{

  floatingCard.classList.remove("active");

});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => console.log("Service Worker registrado"));
}
