const destinations = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    region: 'India',
    lat: 26.9124,
    lng: 75.7873,
    tagline: 'The Pink City of Royals',
    description: 'Experience the grandeur of Rajputana architecture and vibrant Rajasthani culture. Jaipur offers a mesmerizing blend of majestic forts, opulent palaces, and bustling bazaars.',
    bestTimeToVisit: 'October to March',
    nearestAirport: 'JAI',
    nearestTrainStation: { name: 'Jaipur Junction', code: 'JP' },
    nearestPort: { name: 'Kandla Port', lat: 23.0333, lng: 70.2167 },
    famousPlaces: [
      { name: 'Amber Fort', blurb: 'A stunning hilltop fort complex built with pale yellow and pink sandstone.' },
      { name: 'Hawa Mahal', blurb: 'The iconic Palace of Winds with its intricate honeycomb facade.' },
      { name: 'City Palace', blurb: 'A sprawling complex of courtyards, gardens, and buildings at the center of the old city.' },
      { name: 'Jantar Mantar', blurb: 'An astronomical observation site with massive masonry instruments.' }
    ]
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    country: 'India',
    region: 'India',
    lat: 9.4981,
    lng: 76.3388,
    tagline: 'God\'s Own Country',
    description: 'A network of tranquil canals, lagoons, and lakes parallel to the Arabian Sea coast. Sail through lush green landscapes on traditional wooden houseboats.',
    bestTimeToVisit: 'September to March',
    nearestAirport: 'COK',
    nearestTrainStation: { name: 'Alappuzha Railway Station', code: 'ALLP' },
    nearestPort: { name: 'Cochin Port', lat: 9.9667, lng: 76.2667 },
    famousPlaces: [
      { name: 'Alleppey', blurb: 'The hub of Kerala\'s backwaters, famous for houseboat cruises.' },
      { name: 'Kumarakom', blurb: 'A cluster of little islands on the Vembanad Lake, known for bird watching.' },
      { name: 'Vembanad Lake', blurb: 'The longest lake in India, offering serene backwater experiences.' },
      { name: 'Marari Beach', blurb: 'A pristine, sleepy fishing village beach close to the backwaters.' }
    ]
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    country: 'India',
    region: 'India',
    lat: 25.3176,
    lng: 82.9739,
    tagline: 'The Spiritual Heart of India',
    description: 'One of the world\'s oldest continually inhabited cities, Varanasi is a profound spiritual experience. Witness life and death unfolding along the sacred ghats of the Ganges.',
    bestTimeToVisit: 'October to March',
    nearestAirport: 'VNS',
    nearestTrainStation: { name: 'Varanasi Junction', code: 'BSB' },
    nearestPort: { name: 'Haldia Port (Kolkata Gateway)', lat: 22.0333, lng: 88.0667 },
    famousPlaces: [
      { name: 'Dashashwamedh Ghat', blurb: 'The main and most spectacular ghat, famous for the evening Ganga Aarti.' },
      { name: 'Kashi Vishwanath Temple', blurb: 'One of the most famous Hindu temples dedicated to Lord Shiva.' },
      { name: 'Assi Ghat', blurb: 'A popular ghat situated at the confluence of the Ganges and Assi rivers.' },
      { name: 'Sarnath', blurb: 'A nearby peaceful deer park where Gautama Buddha first taught the Dharma.' }
    ]
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    country: 'India',
    region: 'India',
    lat: 34.1526,
    lng: 77.5771,
    tagline: 'Land of High Passes',
    description: 'A spectacular high-altitude desert surrounded by rugged peaks. Discover ancient Buddhist monasteries clinging to rocky cliffs and stunning turquoise lakes.',
    bestTimeToVisit: 'May to September',
    nearestAirport: 'IXL',
    nearestTrainStation: { name: 'Jammu Tawi Railway Station', code: 'JAT' },
    nearestPort: { name: 'Mumbai Port (Western Naval Coast)', lat: 18.9500, lng: 72.8500 },
    famousPlaces: [
      { name: 'Pangong Lake', blurb: 'A mesmerizing high grassland lake with ever-changing shades of blue.' },
      { name: 'Nubra Valley', blurb: 'Known for its orchards, scenic vistas, and Bactrian camels.' },
      { name: 'Thiksey Monastery', blurb: 'A beautiful gompa resembling the Potala Palace in Lhasa.' },
      { name: 'Khardung La', blurb: 'One of the highest motorable mountain passes in the world.' }
    ]
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    lat: 35.6762,
    lng: 139.6503,
    tagline: 'Where Neon Meets Tradition',
    description: 'A dizzying, electric metropolis that seamlessly blends ultra-modern technology with deep-rooted traditions. From serene shrines to bustling crosswalks, Tokyo is endlessly fascinating.',
    bestTimeToVisit: 'March to May and September to November',
    nearestAirport: 'HND',
    nearestTrainStation: { name: 'Tokyo Central Station', code: 'TYO' },
    nearestPort: { name: 'Port of Tokyo', lat: 35.6167, lng: 139.7833 },
    famousPlaces: [
      { name: 'Shibuya Crossing', blurb: 'The world\'s busiest pedestrian intersection, surrounded by neon lights.' },
      { name: 'Senso-ji', blurb: 'Tokyo\'s oldest Buddhist temple, located in historical Asakusa.' },
      { name: 'Meiji Shrine', blurb: 'A tranquil Shinto shrine dedicated to Emperor Meiji, set in a forested park.' },
      { name: 'Tsukiji Outer Market', blurb: 'A bustling market district with incredible fresh seafood and street food.' }
    ]
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    lat: 36.3932,
    lng: 25.4615,
    tagline: 'Jewel of the Aegean',
    description: 'Famous for its stunning sunsets, white-washed houses, and blue-domed churches clinging to cliffs. Overlook the submerged caldera in this romantic island paradise.',
    bestTimeToVisit: 'April to October',
    nearestAirport: 'JTR',
    nearestTrainStation: { name: 'Piraeus Station (Athens link)', code: 'PIR' },
    nearestPort: { name: 'Athinios Port Santorini', lat: 36.3850, lng: 25.4300 },
    famousPlaces: [
      { name: 'Oia', blurb: 'A picturesque village famous for spectacular sunset views.' },
      { name: 'Fira', blurb: 'The bustling capital perched high on the edge of the caldera.' },
      { name: 'Red Beach', blurb: 'A unique beach famous for its dramatic red volcanic cliffs and sand.' },
      { name: 'Akrotiri', blurb: 'An ancient Minoan Bronze Age settlement preserved in volcanic ash.' }
    ]
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    country: 'Peru',
    region: 'Americas',
    lat: -13.1631,
    lng: -72.5450,
    tagline: 'Lost City of the Incas',
    description: 'A breathtaking 15th-century Inca citadel situated on a mountain ridge. It remains an awe-inspiring testament to the power and ingenuity of the Inca Empire.',
    bestTimeToVisit: 'May to October',
    nearestAirport: 'CUZ',
    nearestTrainStation: { name: 'Aguas Calientes Station', code: 'MCHU' },
    nearestPort: { name: 'Port of Callao (Lima)', lat: -12.0500, lng: -77.1500 },
    famousPlaces: [
      { name: 'Temple of the Sun', blurb: 'A semi-circular temple showcasing incredible Inca stonework.' },
      { name: 'Intihuatana', blurb: 'A ritual stone associated with the astronomic clock or calendar of the Inca.' },
      { name: 'Huayna Picchu', blurb: 'The towering mountain peak providing classic, dramatic backdrops to the ruins.' },
      { name: 'Sun Gate (Inti Punku)', blurb: 'The entrance to Machu Picchu for those hiking the Inca Trail.' }
    ]
  },
  {
    id: 'iceland',
    name: 'Iceland',
    country: 'Iceland',
    region: 'Europe',
    lat: 64.9631,
    lng: -19.0208,
    tagline: 'The Land of Fire and Ice',
    description: 'A country of extreme geological contrasts, featuring active volcanoes, immense glaciers, and powerful waterfalls. A prime destination to witness the magical Northern Lights.',
    bestTimeToVisit: 'June to August (Midnight Sun) or September to March (Northern Lights)',
    nearestAirport: 'KEF',
    nearestTrainStation: { name: 'No rail system (Domestic coach hub)', code: 'BSÍ' },
    nearestPort: { name: 'Port of Reykjavik', lat: 64.1500, lng: -21.9333 },
    famousPlaces: [
      { name: 'Blue Lagoon', blurb: 'A famous geothermal spa located in a lava field.' },
      { name: 'Golden Circle', blurb: 'A popular route covering Thingvellir National Park, Geysir, and Gullfoss waterfall.' },
      { name: 'Vatnajökull National Park', blurb: 'Home to Europe\'s largest glacier and spectacular ice caves.' },
      { name: 'Reynisfjara Beach', blurb: 'A stunning black sand beach with dramatic basalt sea stacks.' }
    ]
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'Africa',
    lat: 31.6295,
    lng: -7.9811,
    tagline: 'The Red City',
    description: 'A vibrant sensory overload of spices, souks, and stunning Islamic architecture. Lose yourself in the maze-like medina and relax in tranquil, tiled riads.',
    bestTimeToVisit: 'March to May and September to November',
    nearestAirport: 'RAK',
    nearestTrainStation: { name: 'Gare de Marrakech', code: 'MRK' },
    nearestPort: { name: 'Port of Casablanca', lat: 33.6000, lng: -7.6000 },
    famousPlaces: [
      { name: 'Jemaa el-Fnaa', blurb: 'The bustling main square filled with storytellers, musicians, and food stalls.' },
      { name: 'Jardin Majorelle', blurb: 'A stunning botanical garden featuring vivid cobalt blue accents.' },
      { name: 'Bahia Palace', blurb: 'A 19th-century palace showcasing incredible Moroccan artisan woodwork and tiling.' },
      { name: 'Koutoubia Mosque', blurb: 'The largest mosque in Marrakech, featuring an iconic, towering minaret.' }
    ]
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    region: 'Americas',
    lat: 40.7128,
    lng: -74.0060,
    tagline: 'The City That Never Sleeps',
    description: 'A global hub of culture, finance, and entertainment. From the towering skyscrapers of Manhattan to the diverse neighborhoods of Brooklyn, NYC offers endless energy.',
    bestTimeToVisit: 'April to June and September to early November',
    nearestAirport: 'JFK',
    nearestTrainStation: { name: 'Penn Station (New York)', code: 'NYP' },
    nearestPort: { name: 'Port of New York & New Jersey', lat: 40.6700, lng: -74.1200 },
    famousPlaces: [
      { name: 'Central Park', blurb: 'An expansive urban oasis in the middle of Manhattan.' },
      { name: 'Statue of Liberty', blurb: 'The iconic symbol of freedom standing in New York Harbor.' },
      { name: 'Times Square', blurb: 'The brightly lit commercial and entertainment hub of Broadway.' },
      { name: 'Metropolitan Museum of Art', blurb: 'One of the world\'s largest and finest art museums.' }
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    lat: -8.4095,
    lng: 115.1889,
    tagline: 'Island of the Gods',
    description: 'A tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. Steeped in spirituality, Bali is dotted with thousands of temples.',
    bestTimeToVisit: 'April to October',
    nearestAirport: 'DPS',
    nearestTrainStation: { name: 'Ketapang Station (Banyuwangi Ferry Link)', code: 'KTG' },
    nearestPort: { name: 'Port of Benoa (Denpasar)', lat: -8.7500, lng: 115.2167 },
    famousPlaces: [
      { name: 'Ubud Monkey Forest', blurb: 'A nature reserve and temple complex home to hundreds of macaques.' },
      { name: 'Uluwatu Temple', blurb: 'A spectacular sea temple perched on the edge of a high cliff.' },
      { name: 'Tegallalang Rice Terrace', blurb: 'Beautifully arranged terraced rice paddies offering scenic walks.' },
      { name: 'Tanah Lot', blurb: 'An iconic offshore rock formation home to an ancient pilgrimage temple.' }
    ]
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    lat: -33.9249,
    lng: 18.4241,
    tagline: 'The Mother City',
    description: 'Stunningly situated between the ocean and Table Mountain. Cape Town offers dramatic coastal drives, historic sites, and world-class nearby wine valleys.',
    bestTimeToVisit: 'March to May and September to November',
    nearestAirport: 'CPT',
    nearestTrainStation: { name: 'Cape Town Railway Station', code: 'CPT' },
    nearestPort: { name: 'Port of Cape Town (Table Bay Harbour)', lat: -33.9000, lng: 18.4333 },
    famousPlaces: [
      { name: 'Table Mountain', blurb: 'The iconic flat-topped mountain offering panoramic views of the city.' },
      { name: 'Robben Island', blurb: 'The historic island prison where Nelson Mandela was held.' },
      { name: 'Cape of Good Hope', blurb: 'A scenic rocky headland on the Atlantic coast.' },
      { name: 'Boulders Beach', blurb: 'Famous for its resident colony of African penguins.' }
    ]
  }
];

export default destinations;
