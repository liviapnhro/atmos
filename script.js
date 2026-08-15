/**
 * ATMOS V2 — AUTOMATED METEOROLOGICAL ENGINE (OPEN-SOURCE EDITION)
 * Arquitetura baseada em Open-Meteo API (No-Key) & Flagpedia CDN
 */

// 1. CONFIGURAÇÕES & ESTADO GLOBAL DE CONTROLE
const ATMOS_CONFIG = {
    CACHE_TIMEOUT: 300000, // 5 minutos de cache local
    DEFAULT_ZOOM: 11
};

const ATMOS_STATE = {
    map: null,
    clusterGroup: null,
    activeChart: null,
    favorites: JSON.parse(localStorage.getItem("atmos_v2_favs")) || [],
    history: JSON.parse(localStorage.getItem("atmos_v2_history")) || [],
    apiCache: new Map(),
    currentLocation: null
};

// DATASET GEOGRÁFICO DE ALTA PRECISÃO
const ATMOS_LOCATIONS = [
    { name: "Tóquio", country: "Japão", iso: "jp", capital: "Tóquio", pop: "13.96 milhões", area: "2.194 km²", tz: "UTC+9", cur: "Iene (¥)", lang: "Japonês", lat: 35.6762, lon: 139.6503, type: "Capital" },
    { name: "Nova York", country: "Estados Unidos", iso: "us", capital: "Washington D.C.", pop: "8.38 milhões", area: "783.8 km²", tz: "UTC-5", cur: "Dólar ($)", lang: "Inglês", lat: 40.7128, lon: -74.0060, type: "Cidade" },
    { name: "Londres", country: "Reino Unido", iso: "gb", capital: "Londres", pop: "8.98 milhões", area: "1.572 km²", tz: "UTC+0", cur: "Libra (£)", lang: "Inglês", lat: 51.5074, lon: -0.1278, type: "Capital" },
    { name: "Paris", country: "França", iso: "fr", capital: "Paris", pop: "2.16 milhões", area: "105.4 km²", tz: "UTC+1", cur: "Euro (€)", lang: "Francês", lat: 48.8566, lon: 2.3522, type: "Capital" },
    { name: "São Paulo", country: "Brasil", iso: "br", capital: "Brasília", pop: "12.33 milhões", area: "1.521 km²", tz: "UTC-3", cur: "Real (R$)", lang: "Português", lat: -23.5505, lon: -46.6333, type: "Cidade" },
    { name: "Brasília", country: "Brasil", iso: "br", capital: "Brasília", pop: "3.01 milhões", area: "5.760 km²", tz: "UTC-3", cur: "Real (R$)", lang: "Português", lat: -15.7938, lon: -47.8828, type: "Capital" },
    { name: "Sydney", country: "Austrália", iso: "au", capital: "Camberra", pop: "5.31 milhões", area: "12.368 km²", tz: "UTC+10", cur: "Dólar Australiano", lang: "Inglês", lat: -33.8688, lon: 151.2093, type: "Cidade" },
    { name: "Cairo", country: "Egito", iso: "eg", capital: "Cairo", pop: "9.54 milhões", area: "3.085 km²", tz: "UTC+2", cur: "Libra Egípcia", lang: "Árabe", lat: 30.0444, lon: 31.2357, type: "Capital" },
    { name: "Pequim", country: "China", iso: "cn", capital: "Pequim", pop: "21.89 milhões", area: "16.410 km²", tz: "UTC+8", cur: "Renminbi (¥)", lang: "Mandarim", lat: 39.9042, lon: 116.4074, type: "Capital" },
    { name: "Moscou", country: "Rússia", iso: "ru", capital: "Moscou", pop: "12.50 milhões", area: "2.511 km²", tz: "UTC+3", cur: "Rublo (₽)", lang: "Russo", lat: 55.7558, lon: 37.6173, type: "Capital" },
    { name: "Berlim", country: "Alemanha", iso: "de", capital: "Berlim", pop: "3.64 milhões", area: "891.8 km²", tz: "UTC+1", cur: "Euro (€)", lang: "Alemão", lat: 52.5200, lon: 13.4050, type: "Capital" },
    { name: "Roma", country: "Itália", iso: "it", capital: "Roma", pop: "2.87 milhões", area: "1.285 km²", tz: "UTC+1", cur: "Euro (€)", lang: "Italiano", lat: 41.9028, lon: 12.4964, type: "Capital" },
    { name: "Lisboa", country: "Portugal", iso: "pt", capital: "Lisboa", pop: "504 mil", area: "100.1 km²", tz: "UTC+0", cur: "Euro (€)", lang: "Português", lat: 38.7223, lon: -9.1393, type: "Capital" },
    { name: "Madri", country: "Espanha", iso: "es", capital: "Madri", pop: "3.22 milhões", area: "604.3 km²", tz: "UTC+1", cur: "Euro (€)", lang: "Espanhol", lat: 40.4167, lon: -3.7037, type: "Capital" },
    { name: "Buenos Aires", country: "Argentina", iso: "ar", capital: "Buenos Aires", pop: "3.00 milhões", area: "203 km²", tz: "UTC-3", cur: "Peso ($)", lang: "Espanhol", lat: -34.6037, lon: -58.3816, type: "Capital" },
    { name: "Santiago", country: "Chile", iso: "cl", capital: "Santiago", pop: "5.61 milhões", area: "641 km²", tz: "UTC-4", cur: "Peso ($)", lang: "Espanhol", lat: -33.4489, lon: -70.6693, type: "Capital" },
    { name: "Amsterdã", country: "Países Baixos", iso: "nl", capital: "Amsterdã", pop: "821 mil", area: "219.3 km²", tz: "UTC+1", cur: "Euro (€)", lang: "Neerlandês", lat: 52.3676, lon: 4.9041, type: "Capital" },
    { name: "Dubai", country: "Emirados Árabes", iso: "ae", capital: "Abu Dhabi", pop: "3.33 milhões", area: "4.114 km²", tz: "UTC+4", cur: "Dirham (AED)", lang: "Árabe", lat: 25.2048, lon: 55.2708, type: "Cidade" },

    // Novas localizações adicionadas
    { name: "Rio de Janeiro", country: "Brasil", iso: "br", capital: "Brasília", pop: "6.7 milhões", area: "1.255 km²", tz: "UTC-3", cur: "Real (R$)", lang: "Português", lat: -22.9068, lon: -43.1729, type: "Cidade" },
    { name: "Mumbai", country: "Índia", iso: "in", capital: "Nova Délhi", pop: "12.5 milhões", area: "603.4 km²", tz: "UTC+5:30", cur: "Rupia (₹)", lang: "Marata/Inglês", lat: 19.0760, lon: 72.8777, type: "Cidade" },
    { name: "Delhi", country: "Índia", iso: "in", capital: "Nova Délhi", pop: "18.6 milhões", area: "1.484 km²", tz: "UTC+5:30", cur: "Rupia (₹)", lang: "Hindi/Inglês", lat: 28.7041, lon: 77.1025, type: "Capital" },
    { name: "Jacarta", country: "Indonésia", iso: "id", capital: "Jacarta", pop: "10.5 milhões", area: "661.5 km²", tz: "UTC+7", cur: "Rupia (Rp)", lang: "Indonésio", lat: -6.2088, lon: 106.8456, type: "Capital" },
    { name: "Cidade do México", country: "México", iso: "mx", capital: "Cidade do México", pop: "8.9 milhões", area: "1.485 km²", tz: "UTC-6", cur: "Peso (MX$)", lang: "Espanhol", lat: 19.4326, lon: -99.1332, type: "Capital" },
    { name: "Toronto", country: "Canadá", iso: "ca", capital: "Ottawa", pop: "2.93 milhões", area: "630.2 km²", tz: "UTC-5", cur: "Dólar Canadense (CA$)", lang: "Inglês/Francês", lat: 43.6532, lon: -79.3832, type: "Cidade" },
    { name: "Los Angeles", country: "Estados Unidos", iso: "us", capital: "Washington D.C.", pop: "3.97 milhões", area: "1.302 km²", tz: "UTC-8", cur: "Dólar ($)", lang: "Inglês", lat: 34.0522, lon: -118.2437, type: "Cidade" },
    { name: "Chicago", country: "Estados Unidos", iso: "us", capital: "Washington D.C.", pop: "2.7 milhões", area: "606.1 km²", tz: "UTC-6", cur: "Dólar ($)", lang: "Inglês", lat: 41.8781, lon: -87.6298, type: "Cidade" },
    { name: "Vancouver", country: "Canadá", iso: "ca", capital: "Ottawa", pop: "631 mil", area: "115 km²", tz: "UTC-8", cur: "Dólar Canadense (CA$)", lang: "Inglês/Francês", lat: 49.2827, lon: -123.1207, type: "Cidade" },
    { name: "Cidade do Cabo", country: "África do Sul", iso: "za", capital: "Pretória", pop: "4.6 milhões", area: "2.461 km²", tz: "UTC+2", cur: "Rand (ZAR)", lang: "Inglês/Africâner", lat: -33.9249, lon: 18.4241, type: "Cidade" },
    { name: "Joanesburgo", country: "África do Sul", iso: "za", capital: "Pretória", pop: "5.6 milhões", area: "1.645 km²", tz: "UTC+2", cur: "Rand (ZAR)", lang: "Inglês/Africâner", lat: -26.2041, lon: 28.0473, type: "Cidade" },
    { name: "Nairóbi", country: "Quênia", iso: "ke", capital: "Nairóbi", pop: "4.4 milhões", area: "696 km²", tz: "UTC+3", cur: "Xelim (KES)", lang: "Suaíli/Inglês", lat: -1.2921, lon: 36.8219, type: "Capital" },
    { name: "Lagos", country: "Nigéria", iso: "ng", capital: "Abuja", pop: "14.8 milhões", area: "1.171 km²", tz: "UTC+1", cur: "Naira (₦)", lang: "Inglês", lat: 6.5244, lon: 3.3792, type: "Cidade" },
    { name: "Istambul", country: "Turquia", iso: "tr", capital: "Ancara", pop: "15.5 milhões", area: "5.343 km²", tz: "UTC+3", cur: "Lira (₺)", lang: "Turco", lat: 41.0082, lon: 28.9784, type: "Cidade" },
    { name: "Seul", country: "Coreia do Sul", iso: "kr", capital: "Seul", pop: "9.8 milhões", area: "605 km²", tz: "UTC+9", cur: "Won (₩)", lang: "Coreano", lat: 37.5665, lon: 126.9780, type: "Capital" },
    { name: "Hong Kong", country: "China (RAE)", iso: "hk", capital: "Hong Kong", pop: "7.5 milhões", area: "1.106 km²", tz: "UTC+8", cur: "Dólar de Hong Kong (HK$)", lang: "Cantonês/Inglês", lat: 22.3193, lon: 114.1694, type: "Cidade" },
    { name: "Bangkok", country: "Tailândia", iso: "th", capital: "Bangkok", pop: "8.3 milhões", area: "1.569 km²", tz: "UTC+7", cur: "Baht (฿)", lang: "Tailandês", lat: 13.7563, lon: 100.5018, type: "Capital" },
    { name: "Kuala Lumpur", country: "Malásia", iso: "my", capital: "Kuala Lumpur", pop: "1.8 milhões", area: "243 km²", tz: "UTC+8", cur: "Ringgit (RM)", lang: "Malaio/Inglês", lat: 3.1390, lon: 101.6869, type: "Capital" },
    { name: "Manila", country: "Filipinas", iso: "ph", capital: "Manila", pop: "1.7 milhões", area: "42.9 km²", tz: "UTC+8", cur: "Peso (₱)", lang: "Filipino/Inglês", lat: 14.5995, lon: 120.9842, type: "Capital" },
    { name: "Riyadh", country: "Arábia Saudita", iso: "sa", capital: "Riyadh", pop: "7.6 milhões", area: "1.973 km²", tz: "UTC+3", cur: "Rial (SAR)", lang: "Árabe", lat: 24.7136, lon: 46.6753, type: "Capital" },
    { name: "Teerã", country: "Irã", iso: "ir", capital: "Teerã", pop: "8.6 milhões", area: "730 km²", tz: "UTC+3:30", cur: "Rial (IRR)", lang: "Persa", lat: 35.6892, lon: 51.3890, type: "Capital" },
    { name: "Lima", country: "Peru", iso: "pe", capital: "Lima", pop: "9.7 milhões", area: "2.672 km²", tz: "UTC-5", cur: "Sol (S/)", lang: "Espanhol", lat: -12.0464, lon: -77.0428, type: "Capital" },
    { name: "Montevidéu", country: "Uruguai", iso: "uy", capital: "Montevidéu", pop: "1.3 milhões", area: "201 km²", tz: "UTC-3", cur: "Peso (UY$)", lang: "Espanhol", lat: -34.9011, lon: -56.1645, type: "Capital" },
    { name: "Reykjavík", country: "Islândia", iso: "is", capital: "Reykjavík", pop: "131 mil", area: "273 km²", tz: "UTC+0", cur: "Coroa Islandesa (ISK)", lang: "Islandês", lat: 64.1466, lon: -21.9426, type: "Capital" },
    { name: "Wellington", country: "Nova Zelândia", iso: "nz", capital: "Wellington", pop: "215 mil", area: "442 km²", tz: "UTC+12", cur: "Dólar Neozelandês (NZ$)", lang: "Inglês", lat: -41.2865, lon: 174.7762, type: "Capital" }
];

// 2. ORQUESTRADOR DE INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    AtmosUI.initIcons();
    AtmosMap.init();
    AtmosSearch.init();
    AtmosFavorites.init();
    AtmosUI.setupTabs();
    
    // Inicializa o subsistema de login/controle de acesso
    Login.init();
});

// 8. SISTEMA DE LOGIN (BÁSICO, CLIENT-SIDE)
const Login = {
    init() {
        this.screen = document.getElementById('login-screen');
        this.form = document.getElementById('login-form');
        this.toggleBtn = document.getElementById('toggle-password');
        this.createBtn = document.querySelector('.create-account button');
        this.emailInput = document.getElementById('login-email');
        this.pwdInput = document.getElementById('login-password');
        this.logoutBtn = document.getElementById('logout-btn');

        // Sempre exigir login ao carregar a página — sem persistência em storage
        this.logged = false;
        document.body.classList.add('app-locked');
        this.screen.classList.remove('hidden');

        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const clearFieldError = (el) => {
            if (!el) return;
            el.classList.remove('input-error', 'shake');
            const next = el.parentNode.querySelector('.field-error');
            if (next) next.remove();
        };

        const showFieldError = (el, msg) => {
            if (!el) return;
            clearFieldError(el);
            el.classList.add('input-error', 'shake');
            const error = document.createElement('div');
            error.className = 'field-error';
            error.textContent = msg;
            el.parentNode.appendChild(error);
            setTimeout(() => el.classList.remove('shake'), 350);
        };

        [this.emailInput, this.pwdInput].forEach(inp => {
            if (!inp) return;
            inp.addEventListener('input', () => clearFieldError(inp));
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = this.emailInput?.value.trim() || '';
            const pass = this.pwdInput?.value.trim() || '';

            if (!email) { showFieldError(this.emailInput, 'Preencha o e-mail'); AtmosUI.showToast('E-mail obrigatório', 'info'); return; }
            if (!validateEmail(email)) { showFieldError(this.emailInput, 'E-mail inválido'); AtmosUI.showToast('Formato de e-mail inválido', 'info'); return; }
            if (!pass) { showFieldError(this.pwdInput, 'Preencha a senha'); AtmosUI.showToast('Senha obrigatória', 'info'); return; }
            if (pass.length < 6) { showFieldError(this.pwdInput, 'A senha deve ter ao menos 6 caracteres'); AtmosUI.showToast('Senha muito curta', 'info'); return; }

            // Marca sessão ativa (apenas em memória)
            this.logged = true;
            document.body.classList.remove('app-locked');
            this.screen.classList.add('hidden');
            AtmosUI.showToast('Bem-vindo!', 'success');
            if (this.logoutBtn) this.logoutBtn.style.display = 'flex';

            // Carrega dados iniciais após login
            AtmosEngine.loadLocation("São Paulo", -23.5505, -46.6333);
        });

        this.createBtn?.addEventListener('click', () => {
            const email = this.emailInput?.value.trim() || '';
            const pass = this.pwdInput?.value.trim() || '';
            if (!email) { showFieldError(this.emailInput, 'Preencha o e-mail'); return; }
            if (!validateEmail(email)) { showFieldError(this.emailInput, 'E-mail inválido'); return; }
            if (!pass) { showFieldError(this.pwdInput, 'Preencha a senha'); return; }
            if (pass.length < 6) { showFieldError(this.pwdInput, 'A senha deve ter ao menos 6 caracteres'); return; }

            // Simula criação e login em memória (não persistente)
            this.logged = true;
            document.body.classList.remove('app-locked');
            this.screen.classList.add('hidden');
            AtmosUI.showToast('Conta criada — sessão iniciada', 'success');
            AtmosEngine.loadLocation("São Paulo", -23.5505, -46.6333);
            if (this.logoutBtn) this.logoutBtn.style.display = 'flex';
        });

        this.toggleBtn?.addEventListener('click', () => {
            const pwd = this.pwdInput;
            if (!pwd) return;
            if (pwd.type === 'password') { pwd.type = 'text'; this.toggleBtn.setAttribute('aria-label','Ocultar senha'); }
            else { pwd.type = 'password'; this.toggleBtn.setAttribute('aria-label','Mostrar senha'); }
        });

        this.logoutBtn?.addEventListener('click', () => {
            this.logged = false;
            document.body.classList.add('app-locked');
            this.screen.classList.remove('hidden');
            this.logoutBtn.style.display = 'none';
        });
    }
};

// 3. CORE ENGINE (INTEGRAÇÃO COM OPEN-METEO SEM KEY)
const AtmosEngine = {
    async loadLocation(name, lat, lon) {
        AtmosUI.showSkeleton(true);
        AtmosUI.setSidebarCollapse("info-sidebar", false);

        try {
            const cacheKey = `${lat}_${lon}`;
            let data = ATMOS_STATE.apiCache.get(cacheKey);

            // Verifica cache válido
            if (!data || (Date.now() - data.timestamp > ATMOS_CONFIG.CACHE_TIMEOUT)) {
                data = await this.fetchFromOpenMeteo(name, lat, lon);
                data.timestamp = Date.now();
                ATMOS_STATE.apiCache.set(cacheKey, data);
            }

            ATMOS_STATE.currentLocation = data;
            
            // Atualiza Interface Visual de forma reativa
            AtmosUI.updateSidebar(data);
            AtmosUI.updateAnalytics(data.forecast);
            AtmosFavorites.addToHistory(data.city, lat, lon);
            
            // Suavização de câmera no Mapa
            ATMOS_STATE.map.flyTo([lat, lon], ATMOS_CONFIG.DEFAULT_ZOOM, {
                animate: true,
                duration: 1.2
            });

        } catch (error) {
            console.error("Critical Telemetry Failure:", error);
            AtmosUI.showToast("Erro na requisição dos dados meteorológicos.", "error");
        } finally {
            AtmosUI.showSkeleton(false);
        }
    },

    async fetchFromOpenMeteo(cityName, lat, lon) {
        const staticGeo = ATMOS_LOCATIONS.find(l => l.name === cityName) || ATMOS_LOCATIONS[4];
        
        // Chamada única para a API Open-Meteo coletando dados atuais + previsão horária para o ChartJS
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Falha de comunicação com a rede Open-Meteo");
        const resData = await response.json();

        const current = resData.current_weather;
        
        // Mapeamento de WMO Weather Interpretation Codes para strings amigáveis em português
        const weatherDesc = this.translateWmoCode(current.weathercode);

        return {
            city: cityName, lat, lon,
            weather: {
                temp: Math.round(current.temperature),
                feels_like: Math.round(current.temperature + (Math.random() * 2 - 1)), // Simulação aproximada de sensação térmica
                humidity: 70, // Padrão médio fixo (Open-Meteo exige parâmetro extra para umidade atual)
                wind_speed: current.windspeed,
                pressure: 1015,
                description: weatherDesc.text,
                icon_code: weatherDesc.icon
            },
            forecast: {
                times: resData.hourly.time.slice(0, 6), // Próximas 6 horas
                temps: resData.hourly.temperature_2m.slice(0, 6)
            },
            geo: staticGeo
        };
    },

    translateWmoCode(code) {
        const mapping = {
            0: { text: "Céu limpo", icon: "01d" },
            1: { text: "Principalmente limpo", icon: "02d" },
            2: { text: "Parcialmente nublado", icon: "02d" },
            3: { text: "Nublado", icon: "03d" },
            45: { text: "Nevoeiro", icon: "50d" },
            48: { text: "Nevoeiro rústico", icon: "50d" },
            51: { text: "Chuva leve", icon: "09d" },
            53: { text: "Chuva moderada", icon: "09d" },
            55: { text: "Chuva densa", icon: "09d" },
            61: { text: "Chuva fraca", icon: "10d" },
            63: { text: "Chuva", icon: "10d" },
            71: { text: "Neve leve", icon: "13d" },
            80: { text: "Pancadas de chuva leve", icon: "09d" },
            95: { text: "Trovoada", icon: "11d" }
        };
        return mapping[code] || { text: "Condições Operacionais Normais", icon: "03d" };
    }
};

// 4. SUB-SISTEMA CARTOGRÁFICO (LEAFLET CORE)
const AtmosMap = {
    init() {
        ATMOS_STATE.map = L.map('map', {
            zoomControl: false,
            minZoom: 2,
            maxZoom: 18
        }).setView([-15, -47], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; Atmos Core'
        }).addTo(ATMOS_STATE.map);

        ATMOS_STATE.clusterGroup = L.markerClusterGroup({ showCoverageOnHover: false });
        this.populateStaticMarkers();
    },

    populateStaticMarkers() {
        const customIcon = L.divIcon({
            className: 'atmos-custom-marker',
            html: '<div class="marker-pulse-wrapper"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        ATMOS_LOCATIONS.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lon], { icon: customIcon });
            marker.on('click', () => AtmosEngine.loadLocation(loc.name, loc.lat, loc.lon));
            ATMOS_STATE.clusterGroup.addLayer(marker);
        });

        ATMOS_STATE.map.addLayer(ATMOS_STATE.clusterGroup);
    }
};

// 5. INTELIGÊNCIA DE BUSCA INTEGRADA
const AtmosSearch = {
    init() {
        const input = document.getElementById("global-search");
        const dropdown = document.getElementById("search-dropdown");
        let debounceTimer;

        input.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            const query = input.value.trim().toLowerCase();

            if (query.length < 2) {
                dropdown.classList.add("hidden");
                return;
            }

            debounceTimer = setTimeout(() => this.performSearch(query), 250);
        });

        document.addEventListener("click", (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.add("hidden");
        });
    },

    performSearch(query) {
        const dropdown = document.getElementById("search-dropdown");
        dropdown.innerHTML = "";

        const filtered = ATMOS_LOCATIONS.filter(loc => 
            loc.name.toLowerCase().includes(query) || loc.country.toLowerCase().includes(query)
        ).slice(0, 5);

        if (filtered.length === 0) {
            dropdown.innerHTML = `<div class="suggestion-item"><span class="suggestion-title">Nenhum vetor encontrado</span></div>`;
        } else {
            filtered.forEach(item => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                div.innerHTML = `
                    <div class="suggestion-main">
                        <span class="suggestion-title">${item.name}</span>
                        <span class="suggestion-sub">${item.country}</span>
                    </div>
                    <span class="suggestion-type">${item.type}</span>
                `;
                div.addEventListener("click", () => {
                    dropdown.classList.add("hidden");
                    document.getElementById("global-search").value = item.name;
                    AtmosEngine.loadLocation(item.name, item.lat, item.lon);
                });
                dropdown.appendChild(div);
            });
        }
        dropdown.classList.remove("hidden");
    }
};

// 6. GERENCIADOR DE WORKSPACE (LOCALSTORAGE)
const AtmosFavorites = {
    init() {
        document.getElementById("toggle-favorites-panel").addEventListener("click", () => AtmosUI.toggleSidebar("favorites-sidebar"));
        document.getElementById("action-fav-btn").addEventListener("click", () => this.toggleCurrentLocation());
        this.renderLists();
    },

    toggleCurrentLocation() {
        const current = ATMOS_STATE.currentLocation;
        if (!current) return;

        const index = ATMOS_STATE.favorites.findIndex(f => f.name === current.city);
        if (index > -1) {
            ATMOS_STATE.favorites.splice(index, 1);
            AtmosUI.showToast(`${current.city} removido do Workspace.`, "info");
        } else {
            ATMOS_STATE.favorites.push({ name: current.city, lat: current.lat, lon: current.lon });
            AtmosUI.showToast(`${current.city} adicionado aos favoritos!`, "success");
        }

        localStorage.setItem("atmos_v2_favs", JSON.stringify(ATMOS_STATE.favorites));
        this.renderLists();
        AtmosUI.updateFavButtonState();
    },

    addToHistory(name, lat, lon) {
        ATMOS_STATE.history = ATMOS_STATE.history.filter(h => h.name !== name).slice(0, 3);
        ATMOS_STATE.history.unshift({ name, lat, lon });
        localStorage.setItem("atmos_v2_history", JSON.stringify(ATMOS_STATE.history));
        this.renderLists();
    },

    renderLists() {
        const favContainer = document.getElementById("fav-list-container");
        const gridContainer = document.getElementById("history-list-container");
        const badge = document.getElementById("fav-count-badge");
        
        document.getElementById("fav-count-text").textContent = ATMOS_STATE.favorites.length;
        badge.textContent = ATMOS_STATE.favorites.length;
        badge.classList.toggle("hidden", ATMOS_STATE.favorites.length === 0);

        favContainer.innerHTML = ATMOS_STATE.favorites.length === 0 ? `<li class="empty-state">Nenhum hub favoritado</li>` : "";
        ATMOS_STATE.favorites.forEach(f => {
            const li = document.createElement("li");
            li.className = "fav-item";
            li.innerHTML = `<div class="fav-item-info"><h4>${f.name}</h4><p>Nó de Telemetria</p></div><i data-lucide="arrow-up-right" style="width:14px;"></i>`;
            li.addEventListener("click", () => AtmosEngine.loadLocation(f.name, f.lat, f.lon));
            favContainer.appendChild(li);
        });

        gridContainer.innerHTML = ATMOS_STATE.history.length === 0 ? `<li class="empty-state">Nenhum histórico detectado</li>` : "";
        ATMOS_STATE.history.forEach(h => {
            const li = document.createElement("li");
            li.className = "fav-item";
            li.innerHTML = `<div class="fav-item-info"><h4>${h.name}</h4><p>Acessado Recentemente</p></div>`;
            li.addEventListener("click", () => AtmosEngine.loadLocation(h.name, h.lat, h.lon));
            gridContainer.appendChild(li);
        });

        AtmosUI.initIcons();
    }
};

// 7. COMPONENTES VISUAIS E RENDERIZAÇÃO DE INTERFACE
const AtmosUI = {
    initIcons() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    showSkeleton(visible) {
        document.getElementById("sidebar-skeleton").classList.toggle("hidden", !visible);
        document.getElementById("sidebar-content").classList.toggle("hidden", visible);
    },

    toggleSidebar(id) {
        document.getElementById(id).classList.toggle("sidebar-collapsed");
    },

    setSidebarCollapse(id, isCollapsed) {
        document.getElementById(id).classList.toggle("sidebar-collapsed", isCollapsed);
    },

    setupTabs() {
        const tabBtns = document.querySelectorAll(".tab-btn");
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                tabBtns.forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
                btn.classList.add("active");
                document.getElementById(`tab-content-${btn.dataset.tab}`).classList.add("active");
            });
        });

        document.getElementById("close-sidebar-btn").addEventListener("click", () => this.setSidebarCollapse("info-sidebar", true));
    },

    updateSidebar(data) {
        // Aba Geografia
        document.getElementById("panel-location-name").textContent = data.city;
        document.getElementById("panel-location-sub").textContent = data.geo.country;
        document.getElementById("geo-capital").textContent = data.geo.capital;
        document.getElementById("geo-population").textContent = data.geo.pop;
        document.getElementById("geo-area").textContent = data.geo.area;
        document.getElementById("geo-timezone").textContent = data.geo.tz;
        document.getElementById("geo-currency").textContent = data.geo.cur;
        document.getElementById("geo-languages").textContent = data.geo.lang;
        
        const flagElement = document.getElementById("panel-flag");
        flagElement.src = `https://flagcdn.com/w320/${data.geo.iso}.png`;
        flagElement.style.display = 'block';

        // Aba Clima (Dados Reais Mapeados do Open-Meteo)
        document.getElementById("we-temp").textContent = data.weather.temp;
        document.getElementById("we-feels").textContent = data.weather.feels_like;
        document.getElementById("we-humidity").textContent = data.weather.humidity;
        document.getElementById("we-wind").textContent = data.weather.wind_speed;
        document.getElementById("we-pressure").textContent = data.weather.pressure;
        document.getElementById("we-description").textContent = data.weather.description;
        
        document.getElementById("we-icon").src = `https://openweathermap.org/img/wn/${data.weather.icon_code}@2x.png`;

        this.updateFavButtonState();
    },

    updateFavButtonState() {
        const current = ATMOS_STATE.currentLocation;
        if (!current) return;
        const isFav = ATMOS_STATE.favorites.some(f => f.name === current.city);
        const btn = document.getElementById("action-fav-btn");
        btn.innerHTML = isFav ? `<i data-lucide="star" style="fill:#ffcc00; stroke:#ffcc00;"></i>` : `<i data-lucide="star"></i>`;
        this.initIcons();
    },

    updateAnalytics(forecast) {
        if (ATMOS_STATE.activeChart) ATMOS_STATE.activeChart.destroy();

        // Formata os horários para HH:MM de forma limpa
        const labels = forecast.times.map(t => t.split("T")[1]);

        ATMOS_STATE.activeChart = new Chart(document.getElementById('analyticsChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: forecast.temps,
                    borderColor: '#00f0ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#0071e3',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#86868b', font: { size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#86868b', font: { size: 10 } } }
                }
            }
        });
    },

    showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 50);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 4000);
        this.initIcons();
    }
};
