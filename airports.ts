// --- types ---

/** An international airport. `lat`/`lon` are decimal degrees (WGS84). */
export type Airport = {
  readonly name: string
  /** IATA code, e.g. `'SYD'` */
  readonly code: string
  readonly lat: number
  readonly lon: number
}

/** An `Airport` plus its great-circle distance from the query point. */
export type AirportMatch = Airport & { readonly distanceKm: number }

export type FindAirportsOptions = {
  /** How many airports to return. Default `3`. */
  limit?: number
  /** Drop airports further than this many km from the point. Default: no limit. */
  maxDistanceKm?: number
}

// --- data ---

/**
 * A curated list of major international airports (not exhaustive - roughly
 * 250 hubs across every inhabited region). Coordinates are approximate
 * airport reference points, accurate to ~100m, which is plenty for
 * "nearest airport" lookups. Append to this list to extend coverage.
 */
export const INTERNATIONAL_AIRPORTS: readonly Airport[] = [
  // --- North America ---
  { name: 'Hartsfield-Jackson Atlanta International', code: 'ATL', lat: 33.6407, lon: -84.4277 },
  { name: 'John F. Kennedy International', code: 'JFK', lat: 40.6413, lon: -73.7781 },
  { name: 'Newark Liberty International', code: 'EWR', lat: 40.6895, lon: -74.1745 },
  { name: 'Los Angeles International', code: 'LAX', lat: 33.9416, lon: -118.4085 },
  { name: 'San Francisco International', code: 'SFO', lat: 37.6213, lon: -122.379 },
  { name: "Chicago O'Hare International", code: 'ORD', lat: 41.9742, lon: -87.9073 },
  { name: 'Miami International', code: 'MIA', lat: 25.7959, lon: -80.287 },
  { name: 'Fort Lauderdale-Hollywood International', code: 'FLL', lat: 26.0726, lon: -80.1527 },
  { name: 'Tampa International', code: 'TPA', lat: 27.9755, lon: -82.5332 },
  { name: 'Orlando International', code: 'MCO', lat: 28.4312, lon: -81.3081 },
  { name: 'Dallas/Fort Worth International', code: 'DFW', lat: 32.8998, lon: -97.0403 },
  { name: 'George Bush Intercontinental Houston', code: 'IAH', lat: 29.9902, lon: -95.3368 },
  { name: 'Seattle-Tacoma International', code: 'SEA', lat: 47.4502, lon: -122.3088 },
  { name: 'Boston Logan International', code: 'BOS', lat: 42.3656, lon: -71.0096 },
  { name: 'Washington Dulles International', code: 'IAD', lat: 38.9531, lon: -77.4565 },
  { name: 'Denver International', code: 'DEN', lat: 39.8561, lon: -104.6737 },
  { name: 'Phoenix Sky Harbor International', code: 'PHX', lat: 33.4342, lon: -112.0116 },
  { name: 'Harry Reid International (Las Vegas)', code: 'LAS', lat: 36.084, lon: -115.1537 },
  { name: 'Detroit Metropolitan Wayne County', code: 'DTW', lat: 42.2162, lon: -83.3554 },
  { name: 'Minneapolis-Saint Paul International', code: 'MSP', lat: 44.8848, lon: -93.2223 },
  { name: 'Philadelphia International', code: 'PHL', lat: 39.8744, lon: -75.2424 },
  { name: 'Charlotte Douglas International', code: 'CLT', lat: 35.2144, lon: -80.9473 },
  { name: 'San Diego International', code: 'SAN', lat: 32.7338, lon: -117.1933 },
  { name: 'Portland International', code: 'PDX', lat: 45.5898, lon: -122.5951 },
  { name: 'Daniel K. Inouye International (Honolulu)', code: 'HNL', lat: 21.3187, lon: -157.9224 },
  { name: 'Ted Stevens Anchorage International', code: 'ANC', lat: 61.1743, lon: -149.9983 },
  { name: 'Toronto Pearson International', code: 'YYZ', lat: 43.6777, lon: -79.6248 },
  { name: 'Vancouver International', code: 'YVR', lat: 49.1967, lon: -123.1815 },
  { name: 'Montreal-Trudeau International', code: 'YUL', lat: 45.4706, lon: -73.7408 },
  { name: 'Calgary International', code: 'YYC', lat: 51.1139, lon: -114.0203 },
  { name: 'Edmonton International', code: 'YEG', lat: 53.3097, lon: -113.5797 },
  { name: 'Ottawa Macdonald-Cartier International', code: 'YOW', lat: 45.3225, lon: -75.6692 },
  { name: 'Halifax Stanfield International', code: 'YHZ', lat: 44.8808, lon: -63.5086 },
  { name: 'Mexico City International', code: 'MEX', lat: 19.4363, lon: -99.0721 },
  { name: 'Cancun International', code: 'CUN', lat: 21.0365, lon: -86.8771 },
  { name: 'Guadalajara International', code: 'GDL', lat: 20.5218, lon: -103.3111 },

  // --- Central America & Caribbean ---
  { name: 'Tocumen International (Panama City)', code: 'PTY', lat: 9.0714, lon: -79.3835 },
  { name: 'Juan Santamaria International (San Jose)', code: 'SJO', lat: 9.9939, lon: -84.2088 },
  { name: 'La Aurora International (Guatemala City)', code: 'GUA', lat: 14.5833, lon: -90.5275 },
  { name: 'El Salvador International', code: 'SAL', lat: 13.4409, lon: -89.0557 },
  { name: 'Luis Munoz Marin International (San Juan)', code: 'SJU', lat: 18.4394, lon: -66.0018 },
  { name: 'Lynden Pindling International (Nassau)', code: 'NAS', lat: 25.039, lon: -77.4662 },
  { name: 'Jose Marti International (Havana)', code: 'HAV', lat: 22.9892, lon: -82.4091 },
  { name: 'Norman Manley International (Kingston)', code: 'KIN', lat: 17.9357, lon: -76.7875 },
  { name: 'Sangster International (Montego Bay)', code: 'MBJ', lat: 18.5037, lon: -77.9134 },
  { name: 'Punta Cana International', code: 'PUJ', lat: 18.5674, lon: -68.3634 },
  { name: 'Las Americas International (Santo Domingo)', code: 'SDQ', lat: 18.4297, lon: -69.6689 },

  // --- South America ---
  { name: 'Sao Paulo/Guarulhos International', code: 'GRU', lat: -23.4356, lon: -46.4731 },
  { name: 'Rio de Janeiro/Galeao International', code: 'GIG', lat: -22.8099, lon: -43.2505 },
  { name: 'Brasilia International', code: 'BSB', lat: -15.8711, lon: -47.9186 },
  { name: 'Ministro Pistarini International (Buenos Aires)', code: 'EZE', lat: -34.8222, lon: -58.5358 },
  { name: 'Arturo Merino Benitez International (Santiago)', code: 'SCL', lat: -33.393, lon: -70.7858 },
  { name: 'Jorge Chavez International (Lima)', code: 'LIM', lat: -12.0219, lon: -77.1143 },
  { name: 'Alejandro Velasco Astete International (Cusco)', code: 'CUZ', lat: -13.5357, lon: -71.9388 },
  { name: 'El Dorado International (Bogota)', code: 'BOG', lat: 4.7016, lon: -74.1469 },
  { name: 'Jose Maria Cordova International (Medellin)', code: 'MDE', lat: 6.1645, lon: -75.4231 },
  { name: 'Rafael Nunez International (Cartagena)', code: 'CTG', lat: 10.4424, lon: -75.513 },
  { name: 'Mariscal Sucre International (Quito)', code: 'UIO', lat: -0.1292, lon: -78.3575 },
  { name: 'Jose Joaquin de Olmedo International (Guayaquil)', code: 'GYE', lat: -2.1574, lon: -79.8837 },
  { name: 'Simon Bolivar International (Caracas)', code: 'CCS', lat: 10.6012, lon: -66.9913 },
  { name: 'Carrasco International (Montevideo)', code: 'MVD', lat: -34.8384, lon: -56.0308 },
  { name: 'Silvio Pettirossi International (Asuncion)', code: 'ASU', lat: -25.2397, lon: -57.5199 },
  { name: 'Viru Viru International (Santa Cruz)', code: 'VVI', lat: -17.6448, lon: -63.1354 },
  { name: 'El Alto International (La Paz)', code: 'LPB', lat: -16.5133, lon: -68.1923 },
  { name: 'Johan Adolf Pengel International (Paramaribo)', code: 'PBM', lat: 5.4528, lon: -55.1878 },
  { name: 'Cheddi Jagan International (Georgetown)', code: 'GEO', lat: 6.4985, lon: -58.2541 },

  // --- Western & Northern Europe ---
  { name: 'London Heathrow', code: 'LHR', lat: 51.47, lon: -0.4543 },
  { name: 'London Gatwick', code: 'LGW', lat: 51.1537, lon: -0.1821 },
  { name: 'London Stansted', code: 'STN', lat: 51.886, lon: 0.2389 },
  { name: 'Manchester', code: 'MAN', lat: 53.3537, lon: -2.275 },
  { name: 'Birmingham', code: 'BHX', lat: 52.4539, lon: -1.748 },
  { name: 'Edinburgh', code: 'EDI', lat: 55.95, lon: -3.3725 },
  { name: 'Glasgow', code: 'GLA', lat: 55.8719, lon: -4.4331 },
  { name: 'Dublin', code: 'DUB', lat: 53.4264, lon: -6.2499 },
  { name: 'Paris Charles de Gaulle', code: 'CDG', lat: 49.0097, lon: 2.5479 },
  { name: 'Paris Orly', code: 'ORY', lat: 48.7233, lon: 2.3794 },
  { name: 'Nice Cote d\'Azur', code: 'NCE', lat: 43.6584, lon: 7.2159 },
  { name: 'Lyon-Saint Exupery', code: 'LYS', lat: 45.7256, lon: 5.0811 },
  { name: 'Marseille Provence', code: 'MRS', lat: 43.4393, lon: 5.2214 },
  { name: 'Amsterdam Schiphol', code: 'AMS', lat: 52.3105, lon: 4.7683 },
  { name: 'Brussels', code: 'BRU', lat: 50.901, lon: 4.4844 },
  { name: 'Luxembourg Findel', code: 'LUX', lat: 49.6233, lon: 6.2044 },
  { name: 'Frankfurt', code: 'FRA', lat: 50.0379, lon: 8.5622 },
  { name: 'Munich', code: 'MUC', lat: 48.3538, lon: 11.7861 },
  { name: 'Berlin Brandenburg', code: 'BER', lat: 52.3667, lon: 13.5033 },
  { name: 'Dusseldorf', code: 'DUS', lat: 51.2895, lon: 6.7668 },
  { name: 'Hamburg', code: 'HAM', lat: 53.6304, lon: 9.9882 },
  { name: 'Cologne Bonn', code: 'CGN', lat: 50.8659, lon: 7.1427 },
  { name: 'Stuttgart', code: 'STR', lat: 48.6899, lon: 9.222 },
  { name: 'Zurich', code: 'ZRH', lat: 47.4647, lon: 8.5492 },
  { name: 'Geneva', code: 'GVA', lat: 46.2381, lon: 6.1089 },
  { name: 'Vienna International', code: 'VIE', lat: 48.1103, lon: 16.5697 },
  { name: 'Copenhagen Kastrup', code: 'CPH', lat: 55.618, lon: 12.6508 },
  { name: 'Stockholm Arlanda', code: 'ARN', lat: 59.6519, lon: 17.9186 },
  { name: 'Oslo Gardermoen', code: 'OSL', lat: 60.1976, lon: 11.1004 },
  { name: 'Helsinki-Vantaa', code: 'HEL', lat: 60.3172, lon: 24.9633 },
  { name: 'Keflavik International (Reykjavik)', code: 'KEF', lat: 63.985, lon: -22.6056 },

  // --- Southern Europe ---
  { name: 'Madrid-Barajas', code: 'MAD', lat: 40.4983, lon: -3.5676 },
  { name: 'Barcelona-El Prat', code: 'BCN', lat: 41.2974, lon: 2.0833 },
  { name: 'Malaga-Costa del Sol', code: 'AGP', lat: 36.6749, lon: -4.4991 },
  { name: 'Palma de Mallorca', code: 'PMI', lat: 39.5517, lon: 2.7388 },
  { name: 'Lisbon Humberto Delgado', code: 'LIS', lat: 38.7742, lon: -9.1342 },
  { name: 'Porto Francisco Sa Carneiro', code: 'OPO', lat: 41.2481, lon: -8.6814 },
  { name: 'Rome Fiumicino', code: 'FCO', lat: 41.8003, lon: 12.2389 },
  { name: 'Milan Malpensa', code: 'MXP', lat: 45.6306, lon: 8.7281 },
  { name: 'Venice Marco Polo', code: 'VCE', lat: 45.5053, lon: 12.3519 },
  { name: 'Naples International', code: 'NAP', lat: 40.886, lon: 14.2908 },
  { name: 'Athens Eleftherios Venizelos', code: 'ATH', lat: 37.9364, lon: 23.9445 },
  { name: 'Malta International', code: 'MLA', lat: 35.8575, lon: 14.4775 },
  { name: 'Larnaca International', code: 'LCA', lat: 34.8751, lon: 33.6249 },

  // --- Eastern Europe, Caucasus & Russia ---
  { name: 'Warsaw Chopin', code: 'WAW', lat: 52.1657, lon: 20.9671 },
  { name: 'Prague Vaclav Havel', code: 'PRG', lat: 50.1008, lon: 14.26 },
  { name: 'Budapest Ferenc Liszt', code: 'BUD', lat: 47.4369, lon: 19.2556 },
  { name: 'Bucharest Henri Coanda', code: 'OTP', lat: 44.5711, lon: 26.085 },
  { name: 'Sofia', code: 'SOF', lat: 42.6952, lon: 23.4062 },
  { name: 'Belgrade Nikola Tesla', code: 'BEG', lat: 44.8184, lon: 20.3091 },
  { name: 'Zagreb Franjo Tudman', code: 'ZAG', lat: 45.7429, lon: 16.0688 },
  { name: 'Riga International', code: 'RIX', lat: 56.9236, lon: 23.9711 },
  { name: 'Vilnius International', code: 'VNO', lat: 54.6341, lon: 25.2858 },
  { name: 'Tallinn Lennart Meri', code: 'TLL', lat: 59.4133, lon: 24.8328 },
  { name: 'Istanbul Airport', code: 'IST', lat: 41.2753, lon: 28.7519 },
  { name: 'Istanbul Sabiha Gokcen', code: 'SAW', lat: 40.8986, lon: 29.3092 },
  { name: 'Tbilisi International', code: 'TBS', lat: 41.6692, lon: 44.9547 },
  { name: 'Zvartnots International (Yerevan)', code: 'EVN', lat: 40.1473, lon: 44.3959 },
  { name: 'Heydar Aliyev International (Baku)', code: 'GYD', lat: 40.4675, lon: 50.0467 },
  { name: 'Moscow Sheremetyevo', code: 'SVO', lat: 55.9726, lon: 37.4146 },
  { name: 'Moscow Domodedovo', code: 'DME', lat: 55.4088, lon: 37.9063 },
  { name: 'Saint Petersburg Pulkovo', code: 'LED', lat: 59.8003, lon: 30.2625 },
  { name: 'Yekaterinburg Koltsovo', code: 'SVX', lat: 56.7431, lon: 60.8027 },
  { name: 'Novosibirsk Tolmachevo', code: 'OVB', lat: 55.0126, lon: 82.6507 },
  { name: 'Vladivostok International', code: 'VVO', lat: 43.399, lon: 132.148 },

  // --- Middle East ---
  { name: 'Dubai International', code: 'DXB', lat: 25.2532, lon: 55.3657 },
  { name: 'Abu Dhabi Zayed International', code: 'AUH', lat: 24.433, lon: 54.6511 },
  { name: 'Hamad International (Doha)', code: 'DOH', lat: 25.2731, lon: 51.6081 },
  { name: 'King Khalid International (Riyadh)', code: 'RUH', lat: 24.9576, lon: 46.6988 },
  { name: 'King Abdulaziz International (Jeddah)', code: 'JED', lat: 21.6796, lon: 39.1565 },
  { name: 'Kuwait International', code: 'KWI', lat: 29.2266, lon: 47.9689 },
  { name: 'Bahrain International', code: 'BAH', lat: 26.2708, lon: 50.6336 },
  { name: 'Muscat International', code: 'MCT', lat: 23.5933, lon: 58.2844 },
  { name: 'Queen Alia International (Amman)', code: 'AMM', lat: 31.7226, lon: 35.9932 },
  { name: 'Ben Gurion International (Tel Aviv)', code: 'TLV', lat: 32.0114, lon: 34.8867 },
  { name: 'Beirut-Rafic Hariri International', code: 'BEY', lat: 33.8209, lon: 35.4884 },
  { name: 'Baghdad International', code: 'BGW', lat: 33.2625, lon: 44.2346 },
  { name: 'Imam Khomeini International (Tehran)', code: 'IKA', lat: 35.4161, lon: 51.1522 },

  // --- Africa ---
  { name: 'Cairo International', code: 'CAI', lat: 30.1219, lon: 31.4056 },
  { name: 'Mohammed V International (Casablanca)', code: 'CMN', lat: 33.3675, lon: -7.5898 },
  { name: 'Houari Boumediene (Algiers)', code: 'ALG', lat: 36.691, lon: 3.2154 },
  { name: 'Tunis-Carthage International', code: 'TUN', lat: 36.851, lon: 10.2272 },
  { name: 'Murtala Muhammed International (Lagos)', code: 'LOS', lat: 6.5774, lon: 3.3212 },
  { name: 'Nnamdi Azikiwe International (Abuja)', code: 'ABV', lat: 9.0068, lon: 7.2632 },
  { name: 'Kotoka International (Accra)', code: 'ACC', lat: 5.6052, lon: -0.1668 },
  { name: 'Blaise Diagne International (Dakar)', code: 'DSS', lat: 14.67, lon: -17.0733 },
  { name: 'Felix Houphouet-Boigny International (Abidjan)', code: 'ABJ', lat: 5.2614, lon: -3.9263 },
  { name: 'Bole International (Addis Ababa)', code: 'ADD', lat: 8.9779, lon: 38.7993 },
  { name: 'Jomo Kenyatta International (Nairobi)', code: 'NBO', lat: -1.3192, lon: 36.9278 },
  { name: 'Entebbe International', code: 'EBB', lat: 0.0424, lon: 32.4435 },
  { name: 'Kigali International', code: 'KGL', lat: -1.9686, lon: 30.1395 },
  { name: 'Julius Nyerere International (Dar es Salaam)', code: 'DAR', lat: -6.8781, lon: 39.2026 },
  { name: "N'djili International (Kinshasa)", code: 'FIH', lat: -4.3858, lon: 15.4446 },
  { name: 'Quatro de Fevereiro (Luanda)', code: 'LAD', lat: -8.8584, lon: 13.2312 },
  { name: 'Kenneth Kaunda International (Lusaka)', code: 'LUN', lat: -15.3308, lon: 28.4526 },
  { name: 'Robert Gabriel Mugabe International (Harare)', code: 'HRE', lat: -17.9318, lon: 31.0928 },
  { name: 'Maputo International', code: 'MPM', lat: -25.9208, lon: 32.5726 },
  { name: 'Sir Seretse Khama International (Gaborone)', code: 'GBE', lat: -24.5552, lon: 25.9182 },
  { name: 'Hosea Kutako International (Windhoek)', code: 'WDH', lat: -22.4799, lon: 17.4709 },
  { name: 'O. R. Tambo International (Johannesburg)', code: 'JNB', lat: -26.1392, lon: 28.246 },
  { name: 'Cape Town International', code: 'CPT', lat: -33.9715, lon: 18.6021 },
  { name: 'King Shaka International (Durban)', code: 'DUR', lat: -29.6144, lon: 31.1197 },
  { name: 'Ivato International (Antananarivo)', code: 'TNR', lat: -18.7969, lon: 47.4788 },
  { name: 'Sir Seewoosagur Ramgoolam International (Mauritius)', code: 'MRU', lat: -20.4302, lon: 57.6836 },
  { name: 'Seychelles International', code: 'SEZ', lat: -4.6743, lon: 55.5218 },

  // --- Central & South Asia ---
  { name: 'Indira Gandhi International (Delhi)', code: 'DEL', lat: 28.5562, lon: 77.1 },
  { name: 'Chhatrapati Shivaji Maharaj International (Mumbai)', code: 'BOM', lat: 19.0896, lon: 72.8656 },
  { name: 'Kempegowda International (Bengaluru)', code: 'BLR', lat: 13.1986, lon: 77.7066 },
  { name: 'Chennai International', code: 'MAA', lat: 12.9941, lon: 80.1709 },
  { name: 'Rajiv Gandhi International (Hyderabad)', code: 'HYD', lat: 17.2403, lon: 78.4294 },
  { name: 'Netaji Subhas Chandra Bose International (Kolkata)', code: 'CCU', lat: 22.6547, lon: 88.4467 },
  { name: 'Cochin International', code: 'COK', lat: 10.152, lon: 76.4019 },
  { name: 'Sardar Vallabhbhai Patel International (Ahmedabad)', code: 'AMD', lat: 23.0772, lon: 72.6347 },
  { name: 'Jinnah International (Karachi)', code: 'KHI', lat: 24.9065, lon: 67.1608 },
  { name: 'Allama Iqbal International (Lahore)', code: 'LHE', lat: 31.5216, lon: 74.4036 },
  { name: 'Islamabad International', code: 'ISB', lat: 33.5605, lon: 72.8495 },
  { name: 'Hazrat Shahjalal International (Dhaka)', code: 'DAC', lat: 23.8433, lon: 90.3978 },
  { name: 'Tribhuvan International (Kathmandu)', code: 'KTM', lat: 27.6966, lon: 85.3591 },
  { name: 'Bandaranaike International (Colombo)', code: 'CMB', lat: 7.1808, lon: 79.8841 },
  { name: 'Velana International (Male)', code: 'MLE', lat: 4.1918, lon: 73.529 },
  { name: 'Hamid Karzai International (Kabul)', code: 'KBL', lat: 34.5659, lon: 69.2123 },
  { name: 'Tashkent International', code: 'TAS', lat: 41.2579, lon: 69.2812 },
  { name: 'Almaty International', code: 'ALA', lat: 43.3521, lon: 77.0405 },
  { name: 'Astana Nursultan Nazarbayev International', code: 'NQZ', lat: 51.0222, lon: 71.4669 },
  { name: 'Chinggis Khaan International (Ulaanbaatar)', code: 'ULN', lat: 47.8431, lon: 106.7667 },

  // --- East Asia ---
  { name: 'Tokyo Haneda', code: 'HND', lat: 35.5494, lon: 139.7798 },
  { name: 'Tokyo Narita', code: 'NRT', lat: 35.772, lon: 140.3929 },
  { name: 'Osaka Kansai International', code: 'KIX', lat: 34.4273, lon: 135.244 },
  { name: 'Nagoya Chubu Centrair International', code: 'NGO', lat: 34.8584, lon: 136.8054 },
  { name: 'Fukuoka', code: 'FUK', lat: 33.5859, lon: 130.451 },
  { name: 'Sapporo New Chitose', code: 'CTS', lat: 42.7752, lon: 141.6923 },
  { name: 'Naha (Okinawa)', code: 'OKA', lat: 26.1958, lon: 127.6459 },
  { name: 'Seoul Incheon International', code: 'ICN', lat: 37.4602, lon: 126.4407 },
  { name: 'Seoul Gimpo International', code: 'GMP', lat: 37.5583, lon: 126.7906 },
  { name: 'Beijing Capital International', code: 'PEK', lat: 40.0801, lon: 116.5846 },
  { name: 'Beijing Daxing International', code: 'PKX', lat: 39.5098, lon: 116.4105 },
  { name: 'Shanghai Pudong International', code: 'PVG', lat: 31.1443, lon: 121.8083 },
  { name: 'Shanghai Hongqiao International', code: 'SHA', lat: 31.1979, lon: 121.3363 },
  { name: 'Guangzhou Baiyun International', code: 'CAN', lat: 23.3924, lon: 113.2988 },
  { name: 'Shenzhen Bao\'an International', code: 'SZX', lat: 22.6393, lon: 113.8107 },
  { name: 'Chengdu Shuangliu International', code: 'CTU', lat: 30.5785, lon: 103.9471 },
  { name: 'Chongqing Jiangbei International', code: 'CKG', lat: 29.7192, lon: 106.6417 },
  { name: "Xi'an Xianyang International", code: 'XIY', lat: 34.4471, lon: 108.7516 },
  { name: 'Hangzhou Xiaoshan International', code: 'HGH', lat: 30.2295, lon: 120.4344 },
  { name: 'Hong Kong International', code: 'HKG', lat: 22.308, lon: 113.9185 },
  { name: 'Macau International', code: 'MFM', lat: 22.1496, lon: 113.5915 },
  { name: 'Taiwan Taoyuan International', code: 'TPE', lat: 25.0777, lon: 121.2328 },
  { name: 'Kaohsiung International', code: 'KHH', lat: 22.5771, lon: 120.35 },

  // --- Southeast Asia ---
  { name: 'Singapore Changi', code: 'SIN', lat: 1.3644, lon: 103.9915 },
  { name: 'Kuala Lumpur International', code: 'KUL', lat: 2.7456, lon: 101.7099 },
  { name: 'Penang International', code: 'PEN', lat: 5.2971, lon: 100.277 },
  { name: 'Bangkok Suvarnabhumi', code: 'BKK', lat: 13.69, lon: 100.7501 },
  { name: 'Bangkok Don Mueang International', code: 'DMK', lat: 13.9126, lon: 100.6067 },
  { name: 'Phuket International', code: 'HKT', lat: 8.1132, lon: 98.3169 },
  { name: 'Chiang Mai International', code: 'CNX', lat: 18.7668, lon: 98.9626 },
  { name: 'Tan Son Nhat International (Ho Chi Minh City)', code: 'SGN', lat: 10.8188, lon: 106.652 },
  { name: 'Noi Bai International (Hanoi)', code: 'HAN', lat: 21.2212, lon: 105.8072 },
  { name: 'Da Nang International', code: 'DAD', lat: 16.0439, lon: 108.1992 },
  { name: 'Phnom Penh International', code: 'PNH', lat: 11.5466, lon: 104.8441 },
  { name: 'Wattay International (Vientiane)', code: 'VTE', lat: 17.9883, lon: 102.5633 },
  { name: 'Yangon International', code: 'RGN', lat: 16.9073, lon: 96.1332 },
  { name: 'Ninoy Aquino International (Manila)', code: 'MNL', lat: 14.5086, lon: 121.0198 },
  { name: 'Mactan-Cebu International', code: 'CEB', lat: 10.3075, lon: 123.9794 },
  { name: 'Soekarno-Hatta International (Jakarta)', code: 'CGK', lat: -6.1256, lon: 106.6559 },
  { name: 'Ngurah Rai International (Bali)', code: 'DPS', lat: -8.7482, lon: 115.1672 },
  { name: 'Juanda International (Surabaya)', code: 'SUB', lat: -7.3798, lon: 112.7869 },
  { name: 'Brunei International', code: 'BWN', lat: 4.9442, lon: 114.9283 },
  { name: 'Presidente Nicolau Lobato International (Dili)', code: 'DIL', lat: -8.5465, lon: 125.5247 },

  // --- Oceania ---
  { name: 'Sydney Kingsford Smith', code: 'SYD', lat: -33.9399, lon: 151.1753 },
  { name: 'Melbourne Tullamarine', code: 'MEL', lat: -37.669, lon: 144.841 },
  { name: 'Brisbane', code: 'BNE', lat: -27.3842, lon: 153.1175 },
  { name: 'Perth', code: 'PER', lat: -31.9403, lon: 115.967 },
  { name: 'Adelaide', code: 'ADL', lat: -34.945, lon: 138.5306 },
  { name: 'Cairns', code: 'CNS', lat: -16.8858, lon: 145.7553 },
  { name: 'Gold Coast', code: 'OOL', lat: -28.1644, lon: 153.5047 },
  { name: 'Canberra', code: 'CBR', lat: -35.3069, lon: 149.195 },
  { name: 'Darwin International', code: 'DRW', lat: -12.4147, lon: 130.8766 },
  { name: 'Auckland', code: 'AKL', lat: -37.0082, lon: 174.785 },
  { name: 'Wellington', code: 'WLG', lat: -41.3272, lon: 174.8053 },
  { name: 'Christchurch', code: 'CHC', lat: -43.4894, lon: 172.532 },
  { name: 'Queenstown', code: 'ZQN', lat: -45.0211, lon: 168.7392 },
  { name: 'Nadi International (Fiji)', code: 'NAN', lat: -17.7554, lon: 177.4431 },
  { name: "Faa'a International (Tahiti)", code: 'PPT', lat: -17.5537, lon: -149.6071 },
  { name: 'La Tontouta International (Noumea)', code: 'NOU', lat: -22.0146, lon: 166.2129 },
  { name: 'Jacksons International (Port Moresby)', code: 'POM', lat: -9.4434, lon: 147.22 },
  { name: 'Antonio B. Won Pat International (Guam)', code: 'GUM', lat: 13.4834, lon: 144.796 },
  { name: 'Faleolo International (Samoa)', code: 'APW', lat: -13.83, lon: -172.0083 },
  { name: 'Fua\'amotu International (Tonga)', code: 'TBU', lat: -21.2412, lon: -175.1499 },
  { name: 'Honiara International', code: 'HIR', lat: -9.428, lon: 160.0548 },
  { name: 'Rarotonga International', code: 'RAR', lat: -21.2027, lon: -159.8058 },
]

// --- helpers ---

const EARTH_RADIUS_KM = 6371.0088
const _rad = (deg: number): number => (deg * Math.PI) / 180

/** Great-circle (haversine) distance in km between two lat/lon points. */
export const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = _rad(lat2 - lat1)
  const dLon = _rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(_rad(lat1)) * Math.cos(_rad(lat2)) * Math.sin(dLon / 2) ** 2
  // clamp guards against float error pushing `a` fractionally above 1 for antipodes
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

// --- search ---

/**
 * Find the closest international airports to a point anywhere on Earth.
 *
 * ```ts
 * findNearestAirports(-33.86, 151.21)                       // 3 nearest to Sydney CBD
 * findNearestAirports(48.1, 11.5, { limit: 5 })             // 5 nearest to Munich
 * findNearestAirports(0, -140, { maxDistanceKm: 500 })      // mid-Pacific: likely []
 * ```
 *
 * Results are sorted nearest-first and carry `distanceKm`. With a
 * `maxDistanceKm`, fewer than `limit` (or zero) results may be returned.
 *
 * @param lat Latitude in degrees, -90..90
 * @param lon Longitude in degrees, -180..180
 * @param airports Override the dataset (defaults to `INTERNATIONAL_AIRPORTS`)
 * @throws RangeError if the coordinates or options are invalid
 */
export const findNearestAirports = (
  lat: number,
  lon: number,
  options: FindAirportsOptions = {},
  airports: readonly Airport[] = INTERNATIONAL_AIRPORTS,
): AirportMatch[] => {
  const { limit = 3, maxDistanceKm = Infinity } = options

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new RangeError(`lat must be a number between -90 and 90, got ${lat}`)
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new RangeError(`lon must be a number between -180 and 180, got ${lon}`)
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit must be a positive integer, got ${limit}`)
  }
  if (Number.isNaN(maxDistanceKm) || maxDistanceKm < 0) {
    throw new RangeError(`maxDistanceKm must be >= 0, got ${maxDistanceKm}`)
  }

  const matches: AirportMatch[] = []
  for (const airport of airports) {
    const distanceKm = haversineKm(lat, lon, airport.lat, airport.lon)
    if (distanceKm <= maxDistanceKm) matches.push({ ...airport, distanceKm })
  }
  return matches.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit)
}
