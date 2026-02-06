import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface AutoNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageAlt: string;
  category: string;
  publishedAt: string;
  tags: string[];
}

export interface NHTSARecall {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  manufacturer: string;
  modelYear: string;
  make: string;
  model: string;
  reportReceivedDate: string;
  notes: string;
}

export interface ScanResult {
  success: boolean;
  documentType: string;
  extractedData: Record<string, any>;
  rawText: string;
  confidence: string;
  error?: string;
}

const curatedNews: AutoNewsArticle[] = [
  // ── NASCAR ──
  {
    id: "nascar-001",
    title: "Kyle Larson Dominates Daytona 500 Qualifying with Record Lap",
    summary: "Hendrick Motorsports driver Kyle Larson set a new qualifying record at Daytona International Speedway, clocking in at 210.341 mph to secure the pole position for the 2026 Daytona 500. The lap shattered the previous record by nearly two-tenths of a second.",
    source: "NASCAR.com",
    url: "https://www.nascar.com/news/daytona-500-qualifying-2026",
    imageAlt: "Kyle Larson's No. 5 Chevrolet on the Daytona banking during qualifying",
    category: "NASCAR",
    publishedAt: "2026-02-05T14:30:00Z",
    tags: ["NASCAR", "Daytona 500", "Qualifying", "Kyle Larson", "Hendrick Motorsports"],
  },
  {
    id: "nascar-002",
    title: "Toyota Unveils 2026 Camry XSE Cup Series Body with Aggressive Aero Package",
    summary: "Toyota Racing Development has revealed the updated 2026 Camry XSE body for the Cup Series, featuring revised front fascia aero elements and a redesigned rear spoiler integration. Teams are optimistic the new package will improve mid-corner stability.",
    source: "Motorsport.com",
    url: "https://www.motorsport.com/nascar-cup/news/toyota-camry-2026-body-aero",
    imageAlt: "New 2026 Toyota Camry XSE NASCAR Cup Series race car on display",
    category: "NASCAR",
    publishedAt: "2026-02-04T10:15:00Z",
    tags: ["NASCAR", "Toyota", "Camry", "Aero Package", "Cup Series"],
  },
  {
    id: "nascar-003",
    title: "Bubba Wallace Signs Multi-Year Extension with 23XI Racing",
    summary: "23XI Racing has announced a multi-year contract extension with Bubba Wallace, keeping the popular driver in the No. 23 Toyota through the 2029 season. Wallace celebrated with a strong showing in preseason testing at Phoenix Raceway.",
    source: "ESPN",
    url: "https://www.espn.com/racing/nascar/story/bubba-wallace-23xi-extension-2026",
    imageAlt: "Bubba Wallace celebrating contract extension at 23XI Racing headquarters",
    category: "NASCAR",
    publishedAt: "2026-02-03T16:45:00Z",
    tags: ["NASCAR", "Bubba Wallace", "23XI Racing", "Contract", "Toyota"],
  },
  {
    id: "nascar-004",
    title: "Next Gen 2.0 Chassis Upgrades Target Driver Safety After 2025 Review",
    summary: "NASCAR announced significant safety upgrades to the Next Gen chassis for 2026, including reinforced side-impact structures and an improved energy-absorbing foam package. The changes come after a comprehensive safety review conducted throughout the 2025 season.",
    source: "Racer.com",
    url: "https://racer.com/nascar/next-gen-2-chassis-safety-upgrades-2026",
    imageAlt: "Cutaway diagram showing Next Gen 2.0 chassis safety improvements",
    category: "NASCAR",
    publishedAt: "2026-02-02T09:00:00Z",
    tags: ["NASCAR", "Safety", "Next Gen", "Chassis", "Technology"],
  },
  {
    id: "nascar-005",
    title: "Chase Elliott Returns to Hendrick After Recovery, Eyes Championship",
    summary: "Chase Elliott is back in the No. 9 Chevrolet after an off-season recovery program, looking stronger than ever. The 2020 Cup champion posted the fastest time in the final preseason practice session and has his sights set on a second title.",
    source: "Fox Sports",
    url: "https://www.foxsports.com/stories/nascar/chase-elliott-hendrick-return-2026",
    imageAlt: "Chase Elliott in his No. 9 Chevrolet during preseason practice",
    category: "NASCAR",
    publishedAt: "2026-02-01T12:20:00Z",
    tags: ["NASCAR", "Chase Elliott", "Hendrick Motorsports", "Championship", "Chevrolet"],
  },
  {
    id: "nascar-006",
    title: "Trackhouse Racing Expands to Three-Car Team for 2026 Season",
    summary: "Trackhouse Racing has officially expanded to a three-car operation, adding a third Chevrolet Camaro ZL1 to their stable. The team signed rising Xfinity Series star to pilot the new entry, backed by a major energy drink sponsor.",
    source: "NBC Sports",
    url: "https://www.nbcsports.com/nascar/trackhouse-three-car-team-expansion-2026",
    imageAlt: "Trackhouse Racing three-car lineup reveal event",
    category: "NASCAR",
    publishedAt: "2026-02-01T08:00:00Z",
    tags: ["NASCAR", "Trackhouse Racing", "Expansion", "Chevrolet", "Cup Series"],
  },

  // ── Formula 1 ──
  {
    id: "f1-001",
    title: "Ferrari SF-26 Breaks Cover with Radical New Sidepod Design",
    summary: "Scuderia Ferrari has unveiled their 2026 challenger, the SF-26, featuring a completely rethought sidepod design that channels airflow through sculpted tunnels. The new car takes full advantage of the 2026 technical regulations emphasizing active aerodynamics.",
    source: "Formula1.com",
    url: "https://www.formula1.com/en/latest/article/ferrari-sf26-launch-2026",
    imageAlt: "Ferrari SF-26 Formula 1 car on display at Maranello launch event",
    category: "Formula 1",
    publishedAt: "2026-02-05T08:00:00Z",
    tags: ["F1", "Ferrari", "SF-26", "Launch", "Aerodynamics", "2026 Regulations"],
  },
  {
    id: "f1-002",
    title: "Lewis Hamilton's First Ferrari Test Produces Stunning Lap Times",
    summary: "Lewis Hamilton completed his first official test session with Scuderia Ferrari at Fiorano, posting lap times that left the paddock buzzing. The seven-time world champion described the SF-26 as 'the most responsive car I've ever driven.'",
    source: "Sky Sports F1",
    url: "https://www.skysports.com/f1/news/hamilton-ferrari-first-test-2026",
    imageAlt: "Lewis Hamilton driving the Ferrari SF-26 during testing at Fiorano",
    category: "Formula 1",
    publishedAt: "2026-02-04T15:00:00Z",
    tags: ["F1", "Lewis Hamilton", "Ferrari", "Testing", "Fiorano"],
  },
  {
    id: "f1-003",
    title: "Red Bull RB22 Showcases New Active Aero System Under 2026 Rules",
    summary: "Red Bull Racing revealed their RB22 with an innovative active aerodynamics package that adjusts front and rear wing elements in real time. Adrian Newey's successor, Pierre Waché, called it 'the most complex aero system we've ever developed.'",
    source: "Autosport",
    url: "https://www.autosport.com/f1/news/red-bull-rb22-active-aero-2026-regulations",
    imageAlt: "Red Bull RB22 with active aero elements visible during launch",
    category: "Formula 1",
    publishedAt: "2026-02-03T11:30:00Z",
    tags: ["F1", "Red Bull", "RB22", "Active Aero", "2026 Regulations"],
  },
  {
    id: "f1-004",
    title: "Cadillac-Andretti F1 Team Reveals Final Livery Ahead of Debut Season",
    summary: "The Cadillac-Andretti Global Motorsport team has revealed their stunning black-and-gold livery for their inaugural Formula 1 season. The 11th team on the grid represents the first American constructor entry in decades.",
    source: "The Race",
    url: "https://the-race.com/formula-1/cadillac-andretti-livery-reveal-2026",
    imageAlt: "Cadillac-Andretti F1 car in black and gold livery at reveal ceremony",
    category: "Formula 1",
    publishedAt: "2026-02-02T13:00:00Z",
    tags: ["F1", "Cadillac", "Andretti", "Livery", "New Team", "American"],
  },
  {
    id: "f1-005",
    title: "2026 F1 Power Units: How the New Engine Formula Changes Everything",
    summary: "The 2026 season introduces a completely new power unit formula with increased electrical output and sustainable fuels. Teams must now generate 350kW from the MGU-K alone, fundamentally changing car design and race strategy.",
    source: "Motorsport Technology",
    url: "https://www.motorsportmagazine.com/articles/single-seaters/f1/2026-power-unit-regulations-explained",
    imageAlt: "Technical diagram of the 2026 F1 power unit showing electrical and combustion components",
    category: "Formula 1",
    publishedAt: "2026-02-01T09:45:00Z",
    tags: ["F1", "Power Unit", "2026 Regulations", "Sustainable Fuel", "Technology"],
  },
  {
    id: "f1-006",
    title: "McLaren MCL46 Features Innovative Cooling Solution for New PU Era",
    summary: "McLaren's MCL46 introduces a novel cooling architecture designed specifically for the demanding thermal requirements of the 2026 power unit regulations. Zak Brown called it 'a leap forward in packaging efficiency.'",
    source: "RaceFans",
    url: "https://www.racefans.net/2026/02/01/mclaren-mcl46-cooling-innovation",
    imageAlt: "McLaren MCL46 technical detail showing cooling solution",
    category: "Formula 1",
    publishedAt: "2026-02-01T07:15:00Z",
    tags: ["F1", "McLaren", "MCL46", "Cooling", "Technology"],
  },

  // ── MotoGP / Motorcycles ──
  {
    id: "moto-001",
    title: "Ducati Desmosedici GP26 Sets Pre-Season Testing Pace at Sepang",
    summary: "Ducati's new Desmosedici GP26 topped the timesheets during the official MotoGP pre-season test at Sepang International Circuit. The Italian factory's latest machine features a refined V4 engine with improved mid-range torque delivery.",
    source: "MotoGP.com",
    url: "https://www.motogp.com/en/news/ducati-gp26-sepang-test-2026",
    imageAlt: "Ducati Desmosedici GP26 during pre-season testing at Sepang",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-05T06:30:00Z",
    tags: ["MotoGP", "Ducati", "Pre-Season Test", "Sepang", "GP26"],
  },
  {
    id: "moto-002",
    title: "Harley-Davidson Pan America 1250 Special Earns Adventure Bike of the Year",
    summary: "The 2026 Harley-Davidson Pan America 1250 Special has been awarded Adventure Motorcycle of the Year by Cycle World, praised for its improved electronic suspension, refined engine mapping, and genuine off-road capability.",
    source: "Cycle World",
    url: "https://www.cycleworld.com/harley-davidson-pan-america-1250-special-bike-of-year-2026",
    imageAlt: "2026 Harley-Davidson Pan America 1250 Special on a dirt trail",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-04T11:00:00Z",
    tags: ["Motorcycles", "Harley-Davidson", "Pan America", "Adventure", "Award"],
  },
  {
    id: "moto-003",
    title: "Yamaha YZF-R9 Brings MotoGP Technology to the Street",
    summary: "Yamaha has officially launched the YZF-R9, a middleweight supersport machine that borrows heavily from the factory MotoGP program. The 890cc triple-cylinder engine produces 120 horsepower and features a quickshifter and six-axis IMU as standard.",
    source: "RevZilla",
    url: "https://www.revzilla.com/common-tread/yamaha-yzf-r9-review-2026",
    imageAlt: "2026 Yamaha YZF-R9 in racing blue on a canyon road",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-03T14:20:00Z",
    tags: ["Motorcycles", "Yamaha", "YZF-R9", "Supersport", "Technology"],
  },
  {
    id: "moto-004",
    title: "Marc Marquez Targets Title in Second Ducati Season After Strong Recovery",
    summary: "Marc Marquez enters 2026 fully fit and confident after a strong finish to the 2025 season with the Gresini Ducati team. The six-time MotoGP champion has been promoted to the factory squad alongside Pecco Bagnaia.",
    source: "Crash.net",
    url: "https://www.crash.net/motogp/news/marquez-factory-ducati-2026-title-bid",
    imageAlt: "Marc Marquez in factory Ducati leathers during press conference",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-02T10:00:00Z",
    tags: ["MotoGP", "Marc Marquez", "Ducati", "Factory Team", "Championship"],
  },
  {
    id: "moto-005",
    title: "Indian Motorcycle Releases FTR 1200 Rally Edition for Off-Road Enthusiasts",
    summary: "Indian Motorcycle has unveiled the limited-edition FTR 1200 Rally, featuring a longer-travel suspension, knobby tires, handguards, and a rally-inspired navigation tower. Only 500 units will be produced worldwide.",
    source: "Motorcycle.com",
    url: "https://www.motorcycle.com/indian-ftr-1200-rally-edition-2026",
    imageAlt: "Indian FTR 1200 Rally Edition in desert terrain",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-01T15:45:00Z",
    tags: ["Motorcycles", "Indian", "FTR 1200", "Rally", "Limited Edition"],
  },
  {
    id: "moto-006",
    title: "Electric Motorcycle Racing Series Announces 2026 Global Calendar",
    summary: "The FIM MotoE World Championship has expanded to 12 rounds for 2026, adding races in Japan, Australia, and Brazil. Ducati's all-electric V21L race bike will continue as the spec platform with upgraded battery capacity.",
    source: "Electrek",
    url: "https://electrek.co/2026/02/01/motoe-2026-global-calendar-expansion",
    imageAlt: "MotoE electric racing motorcycle on track during competition",
    category: "MotoGP/Motorcycles",
    publishedAt: "2026-02-01T08:30:00Z",
    tags: ["MotoGP", "MotoE", "Electric", "Racing", "Calendar"],
  },

  // ── Off-Road / ATV ──
  {
    id: "offroad-001",
    title: "Polaris RZR Pro R Ultimate Gets 240HP Turbo Engine for 2026",
    summary: "Polaris has unleashed the 2026 RZR Pro R Ultimate with a blistering 240-horsepower turbocharged engine, 32 inches of suspension travel, and a 74-inch stance. The flagship UTV redefines desert racing capability straight from the factory.",
    source: "UTV Driver",
    url: "https://utvdriver.com/polaris-rzr-pro-r-ultimate-2026-240hp",
    imageAlt: "2026 Polaris RZR Pro R Ultimate blasting through desert terrain",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-05T13:00:00Z",
    tags: ["Off-Road", "Polaris", "RZR", "UTV", "Turbo", "Desert Racing"],
  },
  {
    id: "offroad-002",
    title: "Can-Am Maverick R Gets Smart-Shox 2.0 Semi-Active Suspension",
    summary: "BRP has updated the Can-Am Maverick R with the second-generation Smart-Shox system, offering real-time suspension adjustments via onboard sensors. The system adapts to terrain changes 200 times per second for an unmatched ride quality.",
    source: "Dirt Wheels Magazine",
    url: "https://dirtwheelsmag.com/can-am-maverick-r-smart-shox-2-2026",
    imageAlt: "Can-Am Maverick R navigating rocky terrain with Smart-Shox 2.0",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-04T09:30:00Z",
    tags: ["Off-Road", "Can-Am", "Maverick R", "Suspension", "Technology"],
  },
  {
    id: "offroad-003",
    title: "King of the Hammers 2026: Record Entries Signal Growing Popularity",
    summary: "The 2026 King of the Hammers in Johnson Valley, California has attracted a record 650 entries across all classes. The premier Ultra4 class will see factory-backed teams from Ford, Jeep, and Toyota competing for the crown.",
    source: "Off-Road.com",
    url: "https://www.off-road.com/king-of-hammers-2026-record-entries",
    imageAlt: "Ultra4 race cars lined up at King of the Hammers starting line",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-03T07:00:00Z",
    tags: ["Off-Road", "King of the Hammers", "Ultra4", "Rock Crawling", "Desert Racing"],
  },
  {
    id: "offroad-004",
    title: "Honda Talon 1000R Sport Gets DCT Automatic Transmission Option",
    summary: "Honda has introduced a DCT (Dual Clutch Transmission) option for the 2026 Talon 1000R Sport, bringing the same paddle-shift technology found in their Gold Wing motorcycle to the side-by-side market for the first time.",
    source: "ATV.com",
    url: "https://www.atv.com/honda-talon-1000r-dct-automatic-2026",
    imageAlt: "2026 Honda Talon 1000R Sport with DCT on a forest trail",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-02T12:15:00Z",
    tags: ["Off-Road", "Honda", "Talon", "UTV", "DCT", "Transmission"],
  },
  {
    id: "offroad-005",
    title: "Yamaha Wolverine RMAX4 1000 Offers Family-Friendly Off-Road Adventure",
    summary: "The 2026 Yamaha Wolverine RMAX4 1000 targets families and trail riders with a four-seat configuration, comfortable cabin, and 998cc twin-cylinder engine. Yamaha's adventure Pro GPS system comes standard with trail mapping.",
    source: "UTV Action",
    url: "https://utvactionmag.com/yamaha-wolverine-rmax4-1000-2026-family",
    imageAlt: "Yamaha Wolverine RMAX4 1000 with family on a scenic trail",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-01T11:00:00Z",
    tags: ["Off-Road", "Yamaha", "Wolverine", "UTV", "Family", "Trail"],
  },
  {
    id: "offroad-006",
    title: "CFMoto ZForce 950 HO Proves Chinese UTVs Are Closing the Gap",
    summary: "CFMoto's latest ZForce 950 HO has impressed reviewers with its build quality, 90-horsepower engine, and competitive $14,999 price point. The Chinese manufacturer continues to gain market share with increasingly capable off-road vehicles.",
    source: "ATV Rider",
    url: "https://www.atvrider.com/cfmoto-zforce-950-ho-review-2026",
    imageAlt: "CFMoto ZForce 950 HO in action on a muddy trail",
    category: "Off-Road/ATV",
    publishedAt: "2026-02-01T06:45:00Z",
    tags: ["Off-Road", "CFMoto", "UTV", "Chinese", "Budget", "Review"],
  },

  // ── Trucking / Heavy Equipment ──
  {
    id: "truck-001",
    title: "Freightliner eCascadia Achieves 500-Mile Range with New Battery Pack",
    summary: "Daimler Truck North America has unveiled the updated eCascadia with next-generation battery technology delivering 500 miles of range on a single charge. The breakthrough makes electric long-haul trucking viable for major freight corridors.",
    source: "Fleet Owner",
    url: "https://www.fleetowner.com/freightliner-ecascadia-500-mile-range-2026",
    imageAlt: "Freightliner eCascadia electric semi truck at charging station",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-05T10:00:00Z",
    tags: ["Trucking", "Freightliner", "Electric", "eCascadia", "Long Haul"],
  },
  {
    id: "truck-002",
    title: "Caterpillar Introduces Autonomous Mining Haul Trucks to US Operations",
    summary: "Caterpillar has deployed its first fleet of fully autonomous 797F mining haul trucks at a copper mine in Arizona. The 400-ton trucks operate 24/7 without operators, guided by GPS and LiDAR sensor arrays.",
    source: "Construction Equipment",
    url: "https://www.constructionequipment.com/caterpillar-autonomous-haul-trucks-us-2026",
    imageAlt: "Caterpillar 797F autonomous mining haul truck in operation at a copper mine",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-04T08:30:00Z",
    tags: ["Heavy Equipment", "Caterpillar", "Autonomous", "Mining", "Technology"],
  },
  {
    id: "truck-003",
    title: "PACCAR Unveils Hydrogen Fuel Cell Kenworth T680 for West Coast Routes",
    summary: "PACCAR's hydrogen-powered Kenworth T680 FCEV has entered limited production, targeting West Coast freight routes where hydrogen fueling infrastructure is growing. The truck delivers 500+ horsepower with zero tailpipe emissions.",
    source: "Trucking Info",
    url: "https://www.truckinginfo.com/kenworth-t680-hydrogen-fuel-cell-2026",
    imageAlt: "Kenworth T680 hydrogen fuel cell truck on a California highway",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-03T14:00:00Z",
    tags: ["Trucking", "Kenworth", "Hydrogen", "Fuel Cell", "Zero Emission"],
  },
  {
    id: "truck-004",
    title: "John Deere 9RX Smart Tractor Uses AI for Precision Farming",
    summary: "John Deere's 2026 9RX Series features an integrated AI system that autonomously adjusts tillage depth, speed, and implement settings based on real-time soil conditions. The system reduces fuel consumption by up to 15 percent.",
    source: "Farm Journal",
    url: "https://www.agweb.com/john-deere-9rx-ai-precision-farming-2026",
    imageAlt: "John Deere 9RX tracked tractor in a field using AI precision farming",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-02T07:15:00Z",
    tags: ["Heavy Equipment", "John Deere", "AI", "Farming", "Precision Agriculture"],
  },
  {
    id: "truck-005",
    title: "Ram HD Cummins 6.7L Gets 1,200 lb-ft of Torque for 2026",
    summary: "The 2026 Ram 2500/3500 Heavy Duty trucks receive an updated Cummins 6.7L turbodiesel engine producing a staggering 1,200 lb-ft of torque. The upgrade also includes a new 10-speed Aisin transmission for improved towing performance.",
    source: "Truck Trend",
    url: "https://www.motortrend.com/trucks/ram/2500/2026-ram-hd-cummins-1200-torque",
    imageAlt: "2026 Ram 3500 Heavy Duty towing a fifth-wheel trailer",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-01T13:30:00Z",
    tags: ["Trucking", "Ram", "Cummins", "Diesel", "Torque", "Towing"],
  },
  {
    id: "truck-006",
    title: "Tesla Semi Delivers 1 Million Miles Milestone for PepsiCo Fleet",
    summary: "PepsiCo's fleet of Tesla Semi trucks has collectively surpassed 1 million miles of revenue service, with the company reporting a 40 percent reduction in energy costs compared to their diesel fleet. The milestone strengthens the case for Class 8 electric trucks.",
    source: "Transport Topics",
    url: "https://www.ttnews.com/tesla-semi-pepsico-million-miles-2026",
    imageAlt: "Tesla Semi trucks at PepsiCo distribution center",
    category: "Trucking/Heavy Equipment",
    publishedAt: "2026-02-01T05:00:00Z",
    tags: ["Trucking", "Tesla", "Semi", "Electric", "PepsiCo", "Milestone"],
  },

  // ── Marine / Boats ──
  {
    id: "marine-001",
    title: "Mercury Marine Launches 600HP V12 Verado Outboard Engine",
    summary: "Mercury Marine has unveiled the V12 600 Verado, the world's most powerful outboard engine. The naturally aspirated 7.6-liter V12 delivers 600 horsepower with whisper-quiet operation and is designed for center console boats 35 feet and larger.",
    source: "Boating Magazine",
    url: "https://www.boatingmag.com/mercury-v12-600-verado-outboard-2026",
    imageAlt: "Mercury V12 600 Verado outboard engine mounted on a center console boat",
    category: "Marine/Boats",
    publishedAt: "2026-02-05T11:00:00Z",
    tags: ["Marine", "Mercury", "Outboard", "V12", "Verado", "Horsepower"],
  },
  {
    id: "marine-002",
    title: "Boston Whaler 420 Outrage Wins Boat of the Year 2026",
    summary: "The Boston Whaler 420 Outrage has been named Boat of the Year by Boating World, praised for its quad Mercury V10 power, unsinkable hull design, and luxury-level amenities. The 42-foot center console represents the pinnacle of offshore fishing boats.",
    source: "Boating World",
    url: "https://www.boatingworld.com/boston-whaler-420-outrage-boat-of-year-2026",
    imageAlt: "Boston Whaler 420 Outrage cruising offshore in blue water",
    category: "Marine/Boats",
    publishedAt: "2026-02-04T14:30:00Z",
    tags: ["Marine", "Boston Whaler", "Fishing", "Award", "Center Console"],
  },
  {
    id: "marine-003",
    title: "Yamaha WaveRunner VX Cruiser HO Leads Personal Watercraft Sales",
    summary: "Yamaha's WaveRunner VX Cruiser HO continues to dominate the personal watercraft market with a 35 percent market share. The 2026 model adds a new touchscreen display, improved sound system, and refined hull for better fuel efficiency.",
    source: "Personal Watercraft Illustrated",
    url: "https://www.personalwatercraft.com/yamaha-waverunner-vx-cruiser-ho-2026",
    imageAlt: "2026 Yamaha WaveRunner VX Cruiser HO on calm lake waters",
    category: "Marine/Boats",
    publishedAt: "2026-02-03T09:15:00Z",
    tags: ["Marine", "Yamaha", "WaveRunner", "PWC", "Personal Watercraft"],
  },
  {
    id: "marine-004",
    title: "Pure Watercraft Unveils Electric Pontoon Boat for Lake Communities",
    summary: "Pure Watercraft has launched an all-electric pontoon boat with a 60-mile range and 23 mph top speed. Targeted at lake communities and marinas with no-wake zones, the quiet electric drivetrain eliminates noise and emissions.",
    source: "Electrek",
    url: "https://electrek.co/2026/02/02/pure-watercraft-electric-pontoon-boat",
    imageAlt: "Pure Watercraft electric pontoon boat on a peaceful lake",
    category: "Marine/Boats",
    publishedAt: "2026-02-02T12:00:00Z",
    tags: ["Marine", "Electric", "Pontoon", "Pure Watercraft", "Green"],
  },
  {
    id: "marine-005",
    title: "Miami International Boat Show 2026 Preview: Biggest Show Yet",
    summary: "The 2026 Miami International Boat Show is set to be the largest in its 85-year history, with over 1,400 exhibitors and 1,000 boats on display. New product launches from Grady-White, Robalo, and Malibu are expected to dominate headlines.",
    source: "Sport Fishing",
    url: "https://www.sportfishingmag.com/miami-boat-show-2026-preview",
    imageAlt: "Aerial view of the Miami International Boat Show marina display",
    category: "Marine/Boats",
    publishedAt: "2026-02-01T10:30:00Z",
    tags: ["Marine", "Boat Show", "Miami", "Industry", "New Products"],
  },
  {
    id: "marine-006",
    title: "Garmin ECHOMAP Ultra 2 Brings AI Fish Finding to Affordable Anglers",
    summary: "Garmin's new ECHOMAP Ultra 2 series introduces AI-powered fish identification at a sub-$1,000 price point. The system uses machine learning to differentiate between fish species, baitfish, and structure with 95 percent accuracy.",
    source: "Bassmaster",
    url: "https://www.bassmaster.com/garmin-echomap-ultra-2-ai-fish-finder-2026",
    imageAlt: "Garmin ECHOMAP Ultra 2 display showing AI fish identification",
    category: "Marine/Boats",
    publishedAt: "2026-02-01T07:00:00Z",
    tags: ["Marine", "Garmin", "Fish Finder", "AI", "Electronics", "Fishing"],
  },

  // ── Classic Cars ──
  {
    id: "classic-001",
    title: "1967 Shelby GT500 Sells for $3.2 Million at Scottsdale Auction",
    summary: "A numbers-matching 1967 Shelby GT500 in Brittany Blue with only 12,400 original miles sold for a record $3.2 million at the Barrett-Jackson Scottsdale auction. The car is considered one of the finest surviving examples of Carroll Shelby's iconic muscle car.",
    source: "Hagerty",
    url: "https://www.hagerty.com/media/auctions/1967-shelby-gt500-record-sale-2026",
    imageAlt: "1967 Shelby GT500 in Brittany Blue at Barrett-Jackson auction",
    category: "Classic Cars",
    publishedAt: "2026-02-05T17:00:00Z",
    tags: ["Classic Cars", "Shelby", "GT500", "Auction", "Barrett-Jackson", "Muscle Car"],
  },
  {
    id: "classic-002",
    title: "Porsche 911 Values Continue Climbing as Air-Cooled Supply Dries Up",
    summary: "Air-cooled Porsche 911 values have increased 18 percent year-over-year according to the latest Hagerty Price Guide. The 1973 Carrera RS remains the most sought-after model, with clean examples now exceeding $1.5 million.",
    source: "Bring a Trailer",
    url: "https://bringatrailer.com/porsche-911-air-cooled-values-2026",
    imageAlt: "1973 Porsche 911 Carrera RS in white with green stripes",
    category: "Classic Cars",
    publishedAt: "2026-02-04T12:00:00Z",
    tags: ["Classic Cars", "Porsche", "911", "Air-Cooled", "Values", "Market"],
  },
  {
    id: "classic-003",
    title: "ECD Auto Design's Electric Defender Wins SEMA Builder of the Year",
    summary: "ECD Auto Design has been named SEMA Battle of the Builders winner for their fully electric Land Rover Defender restoration. The build features a Tesla-sourced drivetrain, custom aluminum body panels, and a hand-stitched interior.",
    source: "Motor Authority",
    url: "https://www.motorauthority.com/ecd-electric-defender-sema-builder-of-year-2026",
    imageAlt: "ECD Auto Design electric Land Rover Defender show build",
    category: "Classic Cars",
    publishedAt: "2026-02-03T15:30:00Z",
    tags: ["Classic Cars", "Land Rover", "Defender", "Electric Conversion", "SEMA", "Restoration"],
  },
  {
    id: "classic-004",
    title: "How to Restore a C2 Corvette Stingray: Complete Buyer's Guide",
    summary: "Our comprehensive buyer's guide to the 1963-1967 Corvette Stingray covers everything from body identification numbers to mechanical inspection tips. Learn what separates a $50,000 project from a $200,000 show car.",
    source: "Hemmings",
    url: "https://www.hemmings.com/stories/c2-corvette-stingray-buyers-guide-2026",
    imageAlt: "1965 Corvette Stingray coupe in red during restoration process",
    category: "Classic Cars",
    publishedAt: "2026-02-02T10:45:00Z",
    tags: ["Classic Cars", "Corvette", "Stingray", "Restoration", "Buyer Guide", "C2"],
  },
  {
    id: "classic-005",
    title: "Mecum Kissimmee 2026 Delivers Record $250M in Total Sales",
    summary: "The Mecum Kissimmee 2026 auction generated over $250 million in total sales across 3,500 vehicles, setting a new record for the annual event. A 1970 Plymouth Hemi 'Cuda convertible topped the sale at $4.8 million.",
    source: "Autoweek",
    url: "https://www.autoweek.com/mecum-kissimmee-2026-record-sales",
    imageAlt: "1970 Plymouth Hemi Cuda convertible under auction lights at Mecum",
    category: "Classic Cars",
    publishedAt: "2026-02-01T18:00:00Z",
    tags: ["Classic Cars", "Mecum", "Auction", "Plymouth", "Hemi Cuda", "Record"],
  },
  {
    id: "classic-006",
    title: "ICON 4x4 Launches New Old School Bronco Restoration Program",
    summary: "Jonathan Ward's ICON 4x4 has announced a new restoration program for 1966-1977 Ford Broncos, offering three build levels from a sympathetic mechanical refresh to a complete frame-off restomod. Pricing starts at $185,000.",
    source: "The Drive",
    url: "https://www.thedrive.com/icon-4x4-old-school-bronco-restoration-2026",
    imageAlt: "ICON 4x4 restored Ford Bronco in matte olive green",
    category: "Classic Cars",
    publishedAt: "2026-02-01T09:00:00Z",
    tags: ["Classic Cars", "Ford Bronco", "ICON 4x4", "Restoration", "Restomod"],
  },

  // ── EV / Electric ──
  {
    id: "ev-001",
    title: "Tesla Model 2 'Redwood' Production Begins at Austin Gigafactory",
    summary: "Tesla has officially started production of the long-awaited Model 2 compact EV at its Austin, Texas Gigafactory. The $25,000 hatchback features a 280-mile range, Tesla's latest FSD hardware, and an innovative unboxed manufacturing process.",
    source: "Electrek",
    url: "https://electrek.co/2026/02/05/tesla-model-2-redwood-production-begins-austin",
    imageAlt: "Tesla Model 2 compact EV rolling off the production line at Austin Gigafactory",
    category: "EV/Electric",
    publishedAt: "2026-02-05T06:00:00Z",
    tags: ["EV", "Tesla", "Model 2", "Production", "Affordable", "Gigafactory"],
  },
  {
    id: "ev-002",
    title: "Rivian R3 Crossover Deliveries Begin with 340-Mile Range",
    summary: "Rivian has started customer deliveries of the R3, their most affordable electric vehicle to date. The compact crossover offers 340 miles of range, a 0-60 time of 3.5 seconds, and starts at $38,000 before federal tax credits.",
    source: "InsideEVs",
    url: "https://insideevs.com/rivian-r3-crossover-deliveries-begin-2026",
    imageAlt: "Rivian R3 compact electric crossover during customer delivery event",
    category: "EV/Electric",
    publishedAt: "2026-02-04T08:15:00Z",
    tags: ["EV", "Rivian", "R3", "Crossover", "Deliveries", "Affordable"],
  },
  {
    id: "ev-003",
    title: "Solid-State Batteries Hit Mass Production: Toyota Partners with CATL",
    summary: "Toyota and CATL have announced a joint venture to mass-produce solid-state batteries starting in late 2026. The batteries promise double the energy density of current lithium-ion cells, enabling 600-mile EV range and 10-minute charging.",
    source: "Reuters",
    url: "https://www.reuters.com/business/autos/toyota-catl-solid-state-battery-production-2026",
    imageAlt: "Solid-state battery cell prototype in Toyota research laboratory",
    category: "EV/Electric",
    publishedAt: "2026-02-03T04:30:00Z",
    tags: ["EV", "Battery", "Solid-State", "Toyota", "CATL", "Technology"],
  },
  {
    id: "ev-004",
    title: "Hyundai IONIQ 7 Three-Row SUV Tops Family EV Segment",
    summary: "The 2026 Hyundai IONIQ 7 has arrived as a spacious three-row electric SUV with 350 miles of range and ultra-fast 800V charging. Its lounge-like interior with swiveling front seats and 77-inch entertainment display redefines the family road trip.",
    source: "Car and Driver",
    url: "https://www.caranddriver.com/hyundai/ioniq-7-2026-first-drive-review",
    imageAlt: "2026 Hyundai IONIQ 7 three-row electric SUV on a highway",
    category: "EV/Electric",
    publishedAt: "2026-02-02T11:00:00Z",
    tags: ["EV", "Hyundai", "IONIQ 7", "SUV", "Family", "800V"],
  },
  {
    id: "ev-005",
    title: "NACS Charging Standard Adoption Reaches 95% of US Public Chargers",
    summary: "The North American Charging Standard (NACS) now covers 95 percent of all public EV chargers in the United States. The near-universal adoption ends the fragmented charging landscape and simplifies the EV ownership experience.",
    source: "Green Car Reports",
    url: "https://www.greencarreports.com/nacs-charging-standard-95-percent-adoption-2026",
    imageAlt: "NACS universal charging connector plugged into an electric vehicle",
    category: "EV/Electric",
    publishedAt: "2026-02-01T13:00:00Z",
    tags: ["EV", "Charging", "NACS", "Infrastructure", "Standard"],
  },
  {
    id: "ev-006",
    title: "Ford F-150 Lightning Pro Gets 400-Mile Range for Commercial Fleets",
    summary: "Ford has launched the 2026 F-150 Lightning Pro with an extended-range battery pack delivering 400 miles of range. The work-ready electric truck targets commercial fleet operators with enhanced payload capacity and Pro Power Onboard 2.0.",
    source: "Ford Authority",
    url: "https://fordauthority.com/2026/02/2026-ford-f150-lightning-pro-400-mile-range",
    imageAlt: "2026 Ford F-150 Lightning Pro on a commercial job site",
    category: "EV/Electric",
    publishedAt: "2026-02-01T06:30:00Z",
    tags: ["EV", "Ford", "F-150 Lightning", "Commercial", "Fleet", "Range"],
  },

  // ── Aviation ──
  {
    id: "aviation-001",
    title: "Joby Aviation Begins Commercial eVTOL Service in Los Angeles",
    summary: "Joby Aviation has launched the first FAA-certified commercial electric air taxi service, connecting Los Angeles International Airport to downtown LA in just 12 minutes. The five-seat eVTOL aircraft operates at a fraction of helicopter costs.",
    source: "Aviation Week",
    url: "https://aviationweek.com/joby-aviation-commercial-evtol-los-angeles-2026",
    imageAlt: "Joby Aviation eVTOL air taxi in flight over Los Angeles skyline",
    category: "Aviation",
    publishedAt: "2026-02-05T09:00:00Z",
    tags: ["Aviation", "eVTOL", "Joby", "Air Taxi", "Electric", "Los Angeles"],
  },
  {
    id: "aviation-002",
    title: "Cirrus SR Series Gets Garmin G3000 NXi Avionics Upgrade",
    summary: "Cirrus Aircraft has announced the Garmin G3000 NXi avionics suite as standard equipment across the entire SR series lineup for 2026. The upgrade includes enhanced synthetic vision, wireless database updates, and improved flight plan management.",
    source: "Flying Magazine",
    url: "https://www.flyingmag.com/cirrus-sr-garmin-g3000-nxi-avionics-2026",
    imageAlt: "Cirrus SR22T cockpit showing new Garmin G3000 NXi avionics",
    category: "Aviation",
    publishedAt: "2026-02-04T10:30:00Z",
    tags: ["Aviation", "Cirrus", "Garmin", "Avionics", "General Aviation"],
  },
  {
    id: "aviation-003",
    title: "Piper M700 Fury Turboprop Wins Best New Aircraft Award",
    summary: "The Piper M700 Fury has been named Best New Aircraft by AOPA Pilot magazine. The single-engine turboprop features a Pratt & Whitney PT6A-42A engine, pressurized cabin for six, and a maximum cruise speed of 274 knots.",
    source: "AOPA",
    url: "https://www.aopa.org/news-and-media/piper-m700-fury-best-new-aircraft-2026",
    imageAlt: "Piper M700 Fury turboprop aircraft in flight above clouds",
    category: "Aviation",
    publishedAt: "2026-02-03T08:00:00Z",
    tags: ["Aviation", "Piper", "Turboprop", "Award", "General Aviation"],
  },
  {
    id: "aviation-004",
    title: "Sustainable Aviation Fuel Reaches 10% of US Jet Fuel Supply",
    summary: "Sustainable Aviation Fuel (SAF) now accounts for 10 percent of all jet fuel consumed in the United States, up from just 2 percent in 2024. Major airlines including Delta, United, and Southwest have committed to 50 percent SAF usage by 2030.",
    source: "Simple Flying",
    url: "https://simpleflying.com/sustainable-aviation-fuel-10-percent-us-supply-2026",
    imageAlt: "Sustainable aviation fuel being loaded onto a commercial aircraft",
    category: "Aviation",
    publishedAt: "2026-02-02T14:15:00Z",
    tags: ["Aviation", "SAF", "Sustainable", "Fuel", "Airlines", "Environment"],
  },
  {
    id: "aviation-005",
    title: "Diamond DA62 Becomes Best-Selling Twin-Engine Piston Aircraft",
    summary: "The Diamond DA62 has claimed the title of best-selling twin-engine piston aircraft worldwide for the third consecutive year. The Austrian-built airplane's jet fuel-burning diesel engines and modern avionics continue to attract flight schools and private owners.",
    source: "AVweb",
    url: "https://www.avweb.com/diamond-da62-best-selling-twin-2026",
    imageAlt: "Diamond DA62 twin-engine aircraft on a scenic approach",
    category: "Aviation",
    publishedAt: "2026-02-01T11:45:00Z",
    tags: ["Aviation", "Diamond", "DA62", "Twin Engine", "Sales", "General Aviation"],
  },
  {
    id: "aviation-006",
    title: "Experimental Aircraft Association Plans Record AirVenture Oshkosh 2026",
    summary: "EAA AirVenture Oshkosh 2026 is expected to draw over 700,000 attendees, with special exhibits celebrating 50 years of homebuilt aircraft innovation. The show will feature the first public demonstration of a hydrogen-powered experimental aircraft.",
    source: "EAA",
    url: "https://www.eaa.org/airventure/airventure-2026-preview",
    imageAlt: "Aerial view of EAA AirVenture Oshkosh airshow grounds",
    category: "Aviation",
    publishedAt: "2026-02-01T08:00:00Z",
    tags: ["Aviation", "EAA", "AirVenture", "Oshkosh", "Homebuilt", "Airshow"],
  },

  // ── General Automotive ──
  {
    id: "auto-001",
    title: "2026 Toyota GR Corolla Morizo Edition Gets 330HP and Limited Slip Diff",
    summary: "Toyota Gazoo Racing has unleashed the 2026 GR Corolla Morizo Edition with a boosted 330-horsepower three-cylinder engine, a Torsen limited-slip differential, and a lightened body. Only 1,500 units will be produced for the US market.",
    source: "MotorTrend",
    url: "https://www.motortrend.com/cars/toyota/gr-corolla/2026-morizo-edition-330hp",
    imageAlt: "2026 Toyota GR Corolla Morizo Edition in white on a mountain road",
    category: "General Automotive",
    publishedAt: "2026-02-05T12:00:00Z",
    tags: ["Automotive", "Toyota", "GR Corolla", "Morizo", "Hot Hatch", "Performance"],
  },
  {
    id: "auto-002",
    title: "Average New Car Price Drops Below $45,000 for First Time in Three Years",
    summary: "The average transaction price for a new vehicle in the US has fallen below $45,000 for the first time since 2023, driven by increased inventory, manufacturer incentives, and the arrival of affordable EV models. The trend signals a normalizing market.",
    source: "Kelley Blue Book",
    url: "https://www.kbb.com/car-news/average-new-car-price-drops-below-45000-2026",
    imageAlt: "Car dealership lot showing various new vehicles with price stickers",
    category: "General Automotive",
    publishedAt: "2026-02-04T07:00:00Z",
    tags: ["Automotive", "Pricing", "Market", "Industry", "Affordability"],
  },
  {
    id: "auto-003",
    title: "ADAS Technology Reduces Highway Accidents by 35 Percent, Study Finds",
    summary: "A comprehensive IIHS study spanning five years of data reveals that vehicles equipped with advanced driver assistance systems (ADAS) experience 35 percent fewer highway accidents. Automatic emergency braking and lane-keeping assist show the greatest impact.",
    source: "IIHS",
    url: "https://www.iihs.org/news/adas-highway-accident-reduction-study-2026",
    imageAlt: "Modern vehicle ADAS sensors diagram showing radar and camera placement",
    category: "General Automotive",
    publishedAt: "2026-02-03T10:30:00Z",
    tags: ["Automotive", "ADAS", "Safety", "Study", "IIHS", "Technology"],
  },
  {
    id: "auto-004",
    title: "Mazda MX-5 Miata Celebrates 35 Years with Special Anniversary Edition",
    summary: "Mazda has released a 35th Anniversary Edition MX-5 Miata finished in exclusive Zircon Sand Metallic paint. The special model features Recaro seats, Brembo brakes, BBS forged wheels, and a Bose sound system, limited to 3,500 units globally.",
    source: "Road & Track",
    url: "https://www.roadandtrack.com/mazda-mx5-miata-35th-anniversary-edition-2026",
    imageAlt: "Mazda MX-5 Miata 35th Anniversary Edition in Zircon Sand Metallic",
    category: "General Automotive",
    publishedAt: "2026-02-02T16:00:00Z",
    tags: ["Automotive", "Mazda", "MX-5", "Miata", "Anniversary", "Special Edition"],
  },
  {
    id: "auto-005",
    title: "AutoZone and O'Reilly Report Record Q4 Earnings as DIY Market Grows",
    summary: "Both AutoZone and O'Reilly Auto Parts reported record fourth-quarter earnings, with the DIY automotive parts market growing 8 percent year-over-year. The trend reflects consumers keeping vehicles longer and performing more maintenance themselves.",
    source: "Automotive News",
    url: "https://www.autonews.com/retail/autozone-oreilly-record-q4-diy-market-growth-2026",
    imageAlt: "Auto parts store interior showing shelves of automotive parts and supplies",
    category: "General Automotive",
    publishedAt: "2026-02-01T14:00:00Z",
    tags: ["Automotive", "AutoZone", "OReilly", "DIY", "Parts", "Market Growth"],
  },
  {
    id: "auto-006",
    title: "Right to Repair Legislation Passes in 15 States, Industry Adapts",
    summary: "Right to repair legislation has now been enacted in 15 US states, requiring manufacturers to provide diagnostic tools, repair manuals, and parts access to independent shops and vehicle owners. The movement represents a major win for DIY mechanics.",
    source: "Jalopnik",
    url: "https://jalopnik.com/right-to-repair-15-states-legislation-2026",
    imageAlt: "Independent mechanic working on a modern car with diagnostic equipment",
    category: "General Automotive",
    publishedAt: "2026-02-01T11:30:00Z",
    tags: ["Automotive", "Right to Repair", "Legislation", "DIY", "Independent Shops"],
  },
];

export function getAutoNewsByCategory(category?: string): AutoNewsArticle[] {
  if (!category || category === "all") {
    return curatedNews;
  }
  return curatedNews.filter(
    (article) => article.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getNHTSARecalls(
  make: string,
  model: string,
  year: number
): Promise<NHTSARecall[]> {
  try {
    const params = new URLSearchParams({
      make,
      model,
      modelYear: year.toString(),
    });

    const response = await fetch(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?${params}`
    );

    if (!response.ok) {
      console.error("NHTSA Recalls API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((r: any) => ({
      campaignNumber: r.NHTSACampaignNumber || "",
      component: r.Component || "",
      summary: r.Summary || "",
      consequence: r.Consequence || "",
      remedy: r.Remedy || "",
      manufacturer: r.Manufacturer || "",
      modelYear: r.ModelYear || year.toString(),
      make: r.Make || make,
      model: r.Model || model,
      reportReceivedDate: r.ReportReceivedDate || "",
      notes: r.Notes || "",
    }));
  } catch (error) {
    console.error("NHTSA Recalls API error:", error);
    return [];
  }
}

const documentPrompts: Record<string, string> = {
  receipt: `You are a document scanner specializing in receipts and invoices. Extract the following information from the image:
- vendor/store name
- date of purchase
- individual line items with descriptions and prices
- subtotal
- tax amount
- total amount
- payment method (if visible)
- receipt/invoice number (if visible)

Return ONLY a JSON object with this structure:
{
  "vendor": "Store Name",
  "date": "MM/DD/YYYY",
  "items": [{"description": "Item name", "quantity": 1, "price": 0.00}],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "paymentMethod": "cash/credit/debit",
  "receiptNumber": "optional"
}`,

  registration: `You are a document scanner specializing in vehicle registration documents. Extract the following information from the image:
- VIN (Vehicle Identification Number)
- vehicle make
- vehicle model
- vehicle year
- license plate number
- registration state
- registered owner name
- registration expiration date

Return ONLY a JSON object with this structure:
{
  "vin": "17-character VIN",
  "make": "Vehicle Make",
  "model": "Vehicle Model",
  "year": "YYYY",
  "plateNumber": "ABC1234",
  "state": "XX",
  "ownerName": "Full Name",
  "expirationDate": "MM/DD/YYYY"
}`,

  insurance: `You are a document scanner specializing in auto insurance cards and documents. Extract the following information from the image:
- policy number
- insurance provider/company name
- coverage effective date (start)
- coverage expiration date (end)
- insured vehicle(s) information
- insured person name
- type of coverage (liability, comprehensive, collision, etc.)

Return ONLY a JSON object with this structure:
{
  "policyNumber": "Policy Number",
  "provider": "Insurance Company",
  "effectiveDate": "MM/DD/YYYY",
  "expirationDate": "MM/DD/YYYY",
  "insuredName": "Full Name",
  "vehicles": [{"year": "YYYY", "make": "Make", "model": "Model", "vin": "VIN if visible"}],
  "coverageTypes": ["liability", "comprehensive"]
}`,

  vin_plate: `You are a document scanner specializing in VIN plates and VIN stickers on vehicles. Extract the VIN (Vehicle Identification Number) from the image. The VIN is a 17-character alphanumeric code. Look for it on door jamb stickers, dashboard plates, or engine compartment plates.

Return ONLY a JSON object with this structure:
{
  "vin": "17-character VIN",
  "location": "where the VIN was found (dashboard, door jamb, engine bay, etc.)",
  "additionalInfo": "any other visible information like manufacture date, GVWR, etc."
}`,

  general: `You are a document scanner for automotive-related documents. Analyze the image and extract all readable text and relevant information. Identify the document type and organize the extracted data in a structured format.

Return ONLY a JSON object with this structure:
{
  "documentType": "detected type of document",
  "content": "full extracted text",
  "keyFields": {"field1": "value1", "field2": "value2"},
  "notes": "any additional observations about the document"
}`,
};

export async function scanDocument(
  imageBase64: string,
  documentType: string
): Promise<ScanResult> {
  try {
    const systemPrompt =
      documentPrompts[documentType] || documentPrompts.general;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please scan this document and extract all relevant information.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();

    let extractedData: Record<string, any>;
    try {
      extractedData = JSON.parse(cleanedContent);
    } catch {
      extractedData = { rawResponse: cleanedContent };
    }

    return {
      success: true,
      documentType,
      extractedData,
      rawText: cleanedContent,
      confidence: "high",
    };
  } catch (error) {
    console.error("Document scan error:", error);
    return {
      success: false,
      documentType,
      extractedData: {},
      rawText: "",
      confidence: "none",
      error:
        error instanceof Error ? error.message : "Failed to scan document",
    };
  }
}
