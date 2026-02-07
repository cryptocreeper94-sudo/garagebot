import { db } from "@db";
import { marketingPosts, marketingImages } from "@shared/schema";
import { eq, and, isNotNull, ne, sql } from "drizzle-orm";

const marketingContent = [
  { content: "Did you know the average car owner overpays $47 per brake job by not comparing prices? GarageBot searches 50+ retailers instantly so you never overpay again.", platform: "all", hashtags: ["GarageBot", "AutoParts", "SaveMoney", "BrakeParts", "SmartShopping"], targetSite: "garagebot", category: "cars", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Weekend project alert! Changing your own oil saves $30-$60 every time. Search GarageBot for the best oil filter prices across 50+ stores. Your wallet will thank you.", platform: "all", hashtags: ["DIY", "OilChange", "WeekendWarrior", "GarageBot", "AutoRepair"], targetSite: "garagebot", category: "diy", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "CHALLENGE: Can you name this part? It sits between your engine and transmission, wears out around 60K miles, and costs 3x more at the dealer. Drop your answer below!", platform: "all", hashtags: ["CarTrivia", "GarageBot", "NameThatPart", "AutoChallenge", "MechanicLife"], targetSite: "garagebot", category: "gamified", contentType: "gamified", tone: "friendly", cta: "learn-more" },
  { content: "Boat season is coming! Marine parts can cost 40% more at specialty shops vs online retailers. GarageBot compares prices from West Marine, Bass Pro, and 50+ more stores.", platform: "all", hashtags: ["BoatLife", "MarineParts", "GarageBot", "BoatSeason", "Boating"], targetSite: "garagebot", category: "marine", contentType: "seasonal", tone: "promotional", cta: "shop-now" },
  { content: "Pro tip: Your ATV air filter should be checked after every 5 rides in dusty conditions. A clogged filter reduces power by up to 10%. Find replacements from $8 on GarageBot.", platform: "all", hashtags: ["ATV", "UTV", "OffRoad", "GarageBot", "TrailRiding", "MaintenanceTips"], targetSite: "garagebot", category: "atv", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Winter is coming for your RV! Don't forget antifreeze for your water lines, fresh wiper blades, and tire pressure checks. Search all three on GarageBot in seconds.", platform: "all", hashtags: ["RVLife", "WinterPrep", "RVMaintenance", "GarageBot", "Winterize"], targetSite: "garagebot", category: "rv", contentType: "seasonal", tone: "friendly", cta: "visit-site" },
  { content: "QUIZ TIME: What's the most common reason a riding mower won't start in spring? A) Dead battery B) Old fuel C) Dirty carburetor. Answer: ALL THREE. GarageBot has parts for each fix.", platform: "all", hashtags: ["SmallEngines", "LawnMower", "GarageBot", "SpringPrep", "QuizTime"], targetSite: "garagebot", category: "small-engines", contentType: "gamified", tone: "friendly", cta: "shop-now" },
  { content: "Tractor maintenance isn't optional — it's survival. Hydraulic fluid, PTO seals, and air filters keep your equipment running when it matters most. Compare prices at GarageBot.", platform: "all", hashtags: ["FarmLife", "Tractor", "Agriculture", "GarageBot", "HeavyEquipment"], targetSite: "garagebot", category: "tractor", contentType: "evergreen", tone: "professional", cta: "shop-now" },
  { content: "FPV drone motors burning out? The #1 mistake is running the wrong prop size. Check our guide and find replacement motors from top RC retailers on GarageBot.", platform: "all", hashtags: ["FPV", "Drones", "RCHobby", "GarageBot", "DroneLife", "QuadBuild"], targetSite: "garagebot", category: "drones", contentType: "educational", tone: "friendly", cta: "learn-more" },
  { content: "Right Part. First Time. Every Engine. From your daily driver to your RC car collection — GarageBot searches 50+ retailers so you always find the best price.", platform: "all", hashtags: ["GarageBot", "RightPartFirstTime", "AutoParts", "EveryEngine", "PriceComparison"], targetSite: "garagebot", category: "brand", contentType: "evergreen", tone: "professional", cta: "visit-site" },
  { content: "Your motorcycle chain needs adjustment every 500 miles. Too loose = dangerous slap. Too tight = premature sprocket wear. Find chains and sprockets on GarageBot from $15.", platform: "all", hashtags: ["Motorcycle", "BikerLife", "ChainMaintenance", "GarageBot", "RideOrDie"], targetSite: "garagebot", category: "motorcycle", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "CHALLENGE: Estimate how much you'd save per YEAR if you compared prices before every parts purchase. Most GarageBot users report saving $200-$400 annually. What's your number?", platform: "all", hashtags: ["GarageBot", "MoneySaver", "AutoParts", "Challenge", "SmartShopping"], targetSite: "garagebot", category: "brand", contentType: "gamified", tone: "friendly", cta: "visit-site" },
  { content: "Generator won't start when you need it most? Check the carburetor, spark plug, and fuel valve first. GarageBot finds parts from Honda, Generac, and Champion dealers instantly.", platform: "all", hashtags: ["Generator", "PowerOutage", "Preparedness", "GarageBot", "SmallEngine"], targetSite: "garagebot", category: "generator", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Summer road trip checklist: Coolant topped off? Tires rotated? AC filter fresh? Belts inspected? GarageBot helps you prep for the road without overpaying.", platform: "all", hashtags: ["SummerRoadTrip", "RoadTrip", "CarMaintenance", "GarageBot", "Summer"], targetSite: "garagebot", category: "cars", contentType: "seasonal", tone: "friendly", cta: "shop-now" },
  { content: "Slot car enthusiasts: Finding the right replacement motor or guide pins shouldn't take hours of searching. GarageBot covers hobby retailers too. One search. Done.", platform: "all", hashtags: ["SlotCars", "ScaleRacing", "RCHobby", "GarageBot", "HobbyLife"], targetSite: "garagebot", category: "slot-cars", contentType: "evergreen", tone: "friendly", cta: "visit-site" },
  { content: "Heavy equipment downtime costs $500-$2,000 PER HOUR. Don't wait for the dealer to find parts. GarageBot searches CAT, John Deere, and Komatsu parts suppliers instantly.", platform: "all", hashtags: ["HeavyEquipment", "Construction", "CAT", "JohnDeere", "GarageBot"], targetSite: "garagebot", category: "heavy-equipment", contentType: "promotional", tone: "urgent", cta: "shop-now" },
  { content: "Go-kart racing tip: A clean air filter alone can add 1-2 HP on a Briggs 206. That's the difference between podium and mid-pack. Find filters from $6 on GarageBot.", platform: "all", hashtags: ["GoKart", "KartRacing", "Briggs206", "GarageBot", "RacingTips"], targetSite: "garagebot", category: "go-kart", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "Your golf cart batteries have a lifespan of 4-6 years. When they start losing range, don't overpay at the pro shop. Compare battery prices across retailers on GarageBot.", platform: "all", hashtags: ["GolfCart", "GolfLife", "ElectricVehicle", "GarageBot", "BatteryReplacement"], targetSite: "garagebot", category: "golf-cart", contentType: "evergreen", tone: "professional", cta: "shop-now" },
  { content: "Model aircraft builders: Servos, ESCs, receivers — one bad component grounds your whole build. GarageBot searches HobbyKing, Tower Hobbies, and more for the exact part you need.", platform: "all", hashtags: ["ModelAircraft", "RCPlane", "RCHobby", "GarageBot", "BuildAndFly"], targetSite: "garagebot", category: "model-aircraft", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "Spring cleaning for your engine: Replace spark plugs, check belts, flush coolant, and inspect brakes. GarageBot makes finding all these parts in one place effortless.", platform: "all", hashtags: ["SpringMaintenance", "CarCare", "GarageBot", "AutoParts", "SpringCleaning"], targetSite: "garagebot", category: "cars", contentType: "seasonal", tone: "friendly", cta: "shop-now" },
  { content: "Snowmobile season prep: Check your track tension, inspect wear bars, and replace spark plugs before first ride. Compare prices across Arctic Cat and Polaris part suppliers on GarageBot.", platform: "all", hashtags: ["Snowmobile", "WinterSports", "ArcticCat", "Polaris", "GarageBot"], targetSite: "garagebot", category: "snowmobile", contentType: "seasonal", tone: "professional", cta: "shop-now" },
  { content: "TRIVIA: What common household item can clean corroded battery terminals? A penny! But for new terminals and cables, GarageBot compares prices from 50+ auto parts stores.", platform: "all", hashtags: ["CarTrivia", "BatteryTips", "GarageBot", "DIYAuto", "AutoHacks"], targetSite: "garagebot", category: "cars", contentType: "gamified", tone: "friendly", cta: "learn-more" },
  { content: "Jet ski impeller worn out? A damaged impeller can reduce top speed by 10+ mph. Don't let your summer fun fade — find OEM and aftermarket replacements on GarageBot.", platform: "all", hashtags: ["JetSki", "PWC", "WaveRunner", "GarageBot", "SummerFun", "WaterSports"], targetSite: "garagebot", category: "jet-ski", contentType: "seasonal", tone: "promotional", cta: "shop-now" },
  { content: "RC car tip: Worn-out shocks cause inconsistent handling and slower lap times. Quality replacement shocks start at $12. Search GarageBot's hobby retailer network.", platform: "all", hashtags: ["RCCars", "RCRacing", "Traxxas", "GarageBot", "HobbyLife"], targetSite: "garagebot", category: "rc-cars", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "Fun fact: The average American spends 17 minutes per part searching individual retailer websites. GarageBot does it in under 10 seconds across 50+ stores.", platform: "all", hashtags: ["GarageBot", "TimeSaver", "AutoParts", "SmartSearch", "Efficiency"], targetSite: "garagebot", category: "brand", contentType: "evergreen", tone: "professional", cta: "visit-site" },
  { content: "Exotic car owners: Finding OEM parts for your Lamborghini, Ferrari, or McLaren doesn't have to mean dealer-only pricing. GarageBot searches specialty suppliers too.", platform: "all", hashtags: ["ExoticCars", "Supercar", "Lamborghini", "Ferrari", "GarageBot"], targetSite: "garagebot", category: "exotic", contentType: "evergreen", tone: "professional", cta: "shop-now" },
  { content: "Classic car restoration tip: NOS (New Old Stock) parts are gold. GarageBot searches vintage parts suppliers alongside modern retailers so you find what others can't.", platform: "all", hashtags: ["ClassicCars", "HotRod", "Restoration", "VintageParts", "GarageBot"], targetSite: "garagebot", category: "classic", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "Diesel truck owners: Your fuel filter is your engine's first line of defense. Replace it every 15K miles. Compare Motorcraft, Fleetguard, and Baldwin prices on GarageBot.", platform: "all", hashtags: ["DieselTruck", "Powerstroke", "Cummins", "Duramax", "GarageBot"], targetSite: "garagebot", category: "diesel", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "CHALLENGE: Tag a friend who ALWAYS overpays for car parts because they only check one store. Show them GarageBot and save them hundreds this year!", platform: "all", hashtags: ["GarageBot", "TagAFriend", "AutoParts", "SaveMoney", "Challenge"], targetSite: "garagebot", category: "brand", contentType: "gamified", tone: "friendly", cta: "visit-site" },
  { content: "Aviation maintenance isn't just about safety — it's the law. Find AN hardware, gaskets, and certified replacement parts from aviation suppliers on GarageBot.", platform: "all", hashtags: ["Aviation", "PilotLife", "AircraftMaintenance", "GarageBot", "GeneralAviation"], targetSite: "garagebot", category: "aviation", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Kit car builders know: Every bolt, hose, and bracket matters. GarageBot helps you source parts from specialty and mainstream retailers without the endless browser tabs.", platform: "all", hashtags: ["KitCar", "FactoryFive", "CobraKit", "GarageBot", "BuildYourDream"], targetSite: "garagebot", category: "kit-car", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "Fall maintenance reminder: Check your tire tread depth before wet roads arrive. The penny test works — if you see all of Lincoln's head, it's time. Find tires on GarageBot.", platform: "all", hashtags: ["FallMaintenance", "TireSafety", "GarageBot", "AutoCare", "SafeDriving"], targetSite: "garagebot", category: "cars", contentType: "seasonal", tone: "professional", cta: "shop-now" },
  { content: "Meet Buddy — your AI-powered parts expert inside GarageBot. Ask Buddy anything: 'What brake pads fit my 2019 F-150?' and get instant answers with price comparisons.", platform: "all", hashtags: ["BuddyAI", "GarageBot", "AIAssistant", "AutoParts", "SmartTech"], targetSite: "garagebot", category: "ai", contentType: "promotional", tone: "friendly", cta: "learn-more" },
  { content: "Marine engine winterization: Flush with fresh water, fog the cylinders, stabilize fuel, and change the lower unit oil. Find all supplies compared across retailers on GarageBot.", platform: "all", hashtags: ["MarineEngine", "Winterization", "BoatMaintenance", "GarageBot", "BoatLife"], targetSite: "garagebot", category: "marine", contentType: "seasonal", tone: "professional", cta: "shop-now" },
  { content: "Your truck's suspension works harder than you think — especially if you tow. Worn shocks increase stopping distance by up to 20%. Compare replacement shocks on GarageBot.", platform: "all", hashtags: ["Trucks", "Towing", "Suspension", "GarageBot", "TruckLife"], targetSite: "garagebot", category: "trucks", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "QUIZ: How many spark plugs does a V8 engine have? If you said 8, you're right — but some HEMI engines have 16! Find the right plugs for YOUR engine on GarageBot.", platform: "all", hashtags: ["EngineTrivia", "SparkPlugs", "V8", "HEMI", "GarageBot", "CarQuiz"], targetSite: "garagebot", category: "cars", contentType: "gamified", tone: "friendly", cta: "shop-now" },
  { content: "Power equipment pros: Chainsaw chains, trimmer line, and blower filters — GarageBot searches Stihl, Husqvarna, and Echo dealers so you spend less time shopping, more time working.", platform: "all", hashtags: ["PowerEquipment", "Chainsaw", "Landscaping", "GarageBot", "ProTools"], targetSite: "garagebot", category: "small-engines", contentType: "evergreen", tone: "professional", cta: "shop-now" },
  { content: "Mechanics Garage: Run your own shop? GarageBot's Pro tools help you manage inventory, find the best wholesale prices, and keep your customers happy. Join the Founders Circle.", platform: "all", hashtags: ["MechanicsGarage", "AutoShop", "GarageBot", "ShopOwner", "ProMechanic"], targetSite: "garagebot", category: "mechanics", contentType: "promotional", tone: "professional", cta: "learn-more" },
  { content: "Don't let a dead battery ruin your morning. Most car batteries last 3-5 years. Check your battery age and compare replacements from 50+ retailers on GarageBot.", platform: "all", hashtags: ["CarBattery", "DeadBattery", "GarageBot", "AutoParts", "BeReady"], targetSite: "garagebot", category: "cars", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "Drone pilots: Calibrate your ESCs before every new build. Inconsistent throttle response = unstable flight. Find quality ESCs from trusted hobby retailers on GarageBot.", platform: "all", hashtags: ["Drones", "FPV", "ESC", "DroneBuilding", "GarageBot", "TechHobby"], targetSite: "garagebot", category: "drones", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Summer boat checklist: Impeller ✓ Fuel filter ✓ Spark plugs ✓ Lower unit oil ✓ Stop searching 10 websites — GarageBot compares them all in one search.", platform: "all", hashtags: ["BoatLife", "SummerBoating", "MarineParts", "GarageBot", "LakeLife"], targetSite: "garagebot", category: "marine", contentType: "seasonal", tone: "friendly", cta: "shop-now" },
  { content: "Your vehicle tells a story. GarageBot's Vehicle Passport with VIN decoding gives you complete service history, maintenance schedules, and recall alerts. Know your ride.", platform: "all", hashtags: ["VINDecoder", "VehiclePassport", "GarageBot", "CarHistory", "SmartOwnership"], targetSite: "garagebot", category: "brand", contentType: "promotional", tone: "professional", cta: "learn-more" },
  { content: "ATV trail tip: After muddy rides, always clean your air filter and check your CV boots for tears. Prevention costs $20. Repair costs $500+. Find parts on GarageBot.", platform: "all", hashtags: ["ATV", "TrailRiding", "MudLife", "GarageBot", "OffRoad"], targetSite: "garagebot", category: "atv", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "CHALLENGE: What's the most miles you've gotten out of a set of brake pads? Share your number! Pro tip: Compare ceramic vs semi-metallic prices on GarageBot before your next swap.", platform: "all", hashtags: ["BrakeChallenge", "GarageBot", "BrakePads", "CarMaintenance", "HighMileage"], targetSite: "garagebot", category: "gamified", contentType: "gamified", tone: "friendly", cta: "shop-now" },
  { content: "RV water pump making noise? It might be time for a new one. Don't pay campground prices — GarageBot compares RV parts from Camping World, Amazon, and specialty suppliers.", platform: "all", hashtags: ["RVLife", "RVRepair", "CampingLife", "GarageBot", "RVParts"], targetSite: "garagebot", category: "rv", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "The Genesis Hallmark: Early GarageBot adopters receive a blockchain-verified digital certificate on Solana. It's your proof of being part of the revolution. Claim yours.", platform: "all", hashtags: ["GenesisHallmark", "Blockchain", "Solana", "GarageBot", "EarlyAdopter"], targetSite: "garagebot", category: "blockchain", contentType: "promotional", tone: "professional", cta: "learn-more" },
  { content: "Motorcycle riders: Your chain and sprocket kit should be replaced as a set — never mix old and new. Find complete kits from $45 across 50+ retailers on GarageBot.", platform: "all", hashtags: ["Motorcycle", "ChainAndSprocket", "BikerMaintenance", "GarageBot", "TwoWheels"], targetSite: "garagebot", category: "motorcycle", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Winter tire season is here! All-season vs winter tires isn't even close in snow. GarageBot compares prices from Tire Rack, Discount Tire, and more.", platform: "all", hashtags: ["WinterTires", "SnowTires", "WinterDriving", "GarageBot", "SafetyFirst"], targetSite: "garagebot", category: "cars", contentType: "seasonal", tone: "professional", cta: "shop-now" },
  { content: "Tractor PTO shaft maintenance: Grease it every 8 hours of use. A dry PTO wears out bearings fast and replacements aren't cheap. Compare prices on GarageBot.", platform: "all", hashtags: ["Tractor", "FarmEquipment", "PTO", "GarageBot", "FarmLife"], targetSite: "garagebot", category: "tractor", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "TRIVIA: What does 'OEM' stand for? Original Equipment Manufacturer! OEM parts match what came on your vehicle. Aftermarket parts are alternatives. GarageBot shows you both.", platform: "all", hashtags: ["OEM", "Aftermarket", "AutoTrivia", "GarageBot", "PartsKnowledge"], targetSite: "garagebot", category: "cars", contentType: "gamified", tone: "educational", cta: "learn-more" },
  { content: "Generator maintenance 101: Run it for 30 minutes every month with a load. Stale fuel and dry seals are the #1 killer. Find maintenance kits on GarageBot.", platform: "all", hashtags: ["Generator", "EmergencyPrep", "MaintenanceTips", "GarageBot", "PowerReady"], targetSite: "garagebot", category: "generator", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "Buddy AI just got smarter! Now Buddy can identify parts from your vehicle's VIN, suggest maintenance schedules, and find the best prices — all in one conversation.", platform: "all", hashtags: ["BuddyAI", "GarageBot", "AIUpgrade", "SmartParts", "TechInnovation"], targetSite: "garagebot", category: "ai", contentType: "promotional", tone: "friendly", cta: "learn-more" },
  { content: "Go-kart clutch slipping? Check your engagement RPM and spring tension before replacing. New clutches start at $25. Compare options across hobby and motorsport retailers on GarageBot.", platform: "all", hashtags: ["GoKart", "KartClutch", "Motorsport", "GarageBot", "RacingParts"], targetSite: "garagebot", category: "go-kart", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "DarkWave Studios ecosystem: GarageBot for parts, Trust Layer for security, ORBIT for staffing. One login, infinite possibilities. Built different.", platform: "all", hashtags: ["DarkWaveStudios", "GarageBot", "TrustLayer", "ORBIT", "Ecosystem"], targetSite: "garagebot", category: "darkwave", contentType: "promotional", tone: "professional", cta: "visit-site" },
  { content: "Golf cart speed controller acting up? Before replacing it ($200+), check your solenoid and throttle sensor first. Find all three parts compared on GarageBot.", platform: "all", hashtags: ["GolfCart", "ElectricVehicle", "Troubleshooting", "GarageBot", "DIYFix"], targetSite: "garagebot", category: "golf-cart", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "Snowmobile track studs: More studs = more traction, but too many = more drag. Find the sweet spot and compare stud kits on GarageBot from $30.", platform: "all", hashtags: ["Snowmobile", "TrackStuds", "WinterRiding", "GarageBot", "SnowSports"], targetSite: "garagebot", category: "snowmobile", contentType: "educational", tone: "friendly", cta: "shop-now" },
  { content: "Every 3,000 miles or every 3 months — that's the classic oil change interval. Modern synthetic oils can go 7,500-10,000. Know your oil and save. Compare on GarageBot.", platform: "all", hashtags: ["OilChange", "SyntheticOil", "CarMaintenance", "GarageBot", "EngineHealth"], targetSite: "garagebot", category: "cars", contentType: "educational", tone: "professional", cta: "shop-now" },
  { content: "RC car race day prep: Fresh batteries, clean bearings, check diff fluid, and always bring spare parts. GarageBot's hobby search covers Traxxas, Arrma, Losi, and more.", platform: "all", hashtags: ["RCRacing", "RCCars", "Traxxas", "Arrma", "GarageBot"], targetSite: "garagebot", category: "rc-cars", contentType: "evergreen", tone: "friendly", cta: "shop-now" },
  { content: "Jet ski pre-season: Replace the wear ring if you've lost thrust, check the jet pump for debris, and flush the cooling system. All parts compared on GarageBot.", platform: "all", hashtags: ["JetSki", "PreSeason", "PWC", "GarageBot", "WaterSports"], targetSite: "garagebot", category: "jet-ski", contentType: "seasonal", tone: "professional", cta: "shop-now" },
  { content: "Why search 50 websites when GarageBot does it for you? One search box. Every part. Every engine. Real prices. Real links. No guessing.", platform: "all", hashtags: ["GarageBot", "OneSearch", "AutoParts", "PriceComparison", "EveryEngine"], targetSite: "garagebot", category: "brand", contentType: "evergreen", tone: "professional", cta: "visit-site" },
];

const marketingImagesList = [
  { filename: 'cars_and_trucks.png', filePath: '/generated_images/cars_and_trucks.png', category: 'vehicles', subject: 'garagebot', style: 'product', altText: 'Cars and trucks parts' },
  { filename: 'atv_and_utv.png', filePath: '/generated_images/atv_and_utv.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'ATV and UTV off-road vehicles' },
  { filename: 'boat_marine.png', filePath: '/generated_images/boat_marine.png', category: 'vehicles', subject: 'garagebot', style: 'lifestyle', altText: 'Boat and marine vessels' },
  { filename: 'rv_trailer.png', filePath: '/generated_images/rv_trailer.png', category: 'vehicles', subject: 'garagebot', style: 'lifestyle', altText: 'RV and travel trailer' },
  { filename: 'hatch_garagebot_all_vehicles.png', filePath: '/generated_images/hatch_garagebot_all_vehicles.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Farm tractor and equipment' },
  { filename: 'hatch_garagebot_right_part.png', filePath: '/generated_images/hatch_garagebot_right_part.png', category: 'vehicles', subject: 'garagebot', style: 'product', altText: 'Heavy construction equipment' },
  { filename: 'generator_power.png', filePath: '/generated_images/generator_power.png', category: 'parts', subject: 'garagebot', style: 'product', altText: 'Power generator' },
  { filename: 'small_engines_equipment.png', filePath: '/generated_images/small_engines_equipment.png', category: 'parts', subject: 'garagebot', style: 'product', altText: 'Small engine equipment' },
  { filename: 'aviation_aircraft.png', filePath: '/generated_images/aviation_aircraft.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Aviation and aircraft' },
  { filename: 'rc_hobby_vehicles.png', filePath: '/generated_images/rc_hobby_vehicles.png', category: 'hobby', subject: 'garagebot', style: 'action-shot', altText: 'RC hobby vehicles' },
  { filename: 'drones_fpv.png', filePath: '/generated_images/drones_fpv.png', category: 'hobby', subject: 'garagebot', style: 'action-shot', altText: 'FPV drones and racing' },
  { filename: 'model_aircraft.png', filePath: '/generated_images/model_aircraft.png', category: 'hobby', subject: 'garagebot', style: 'product', altText: 'Model aircraft and RC planes' },
  { filename: 'slot_cars.png', filePath: '/generated_images/slot_cars.png', category: 'hobby', subject: 'garagebot', style: 'action-shot', altText: 'Slot cars and scale racing' },
  { filename: 'go_kart_racing.png', filePath: '/generated_images/go_kart_racing.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Go-kart racing' },
  { filename: 'golf_cart.png', filePath: '/generated_images/golf_cart.png', category: 'vehicles', subject: 'garagebot', style: 'lifestyle', altText: 'Golf cart' },
  { filename: 'snowmobile_snow.png', filePath: '/generated_images/snowmobile_snow.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Snowmobile in winter' },
  { filename: 'jet_ski_watercraft.png', filePath: '/generated_images/jet_ski_watercraft.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Jet ski personal watercraft' },
  { filename: 'exotic_supercar.png', filePath: '/generated_images/exotic_supercar.png', category: 'vehicles', subject: 'garagebot', style: 'product', altText: 'Exotic supercar' },
  { filename: 'classic_hot_rod.png', filePath: '/generated_images/classic_hot_rod.png', category: 'vehicles', subject: 'garagebot', style: 'lifestyle', altText: 'Classic hot rod car' },
  { filename: 'diesel_commercial_truck.png', filePath: '/generated_images/diesel_commercial_truck.png', category: 'vehicles', subject: 'garagebot', style: 'product', altText: 'Diesel commercial truck' },
  { filename: 'kit_car_build.png', filePath: '/generated_images/kit_car_build.png', category: 'vehicles', subject: 'garagebot', style: 'before-after', altText: 'Kit car build project' },
  { filename: 'brake_parts.png', filePath: '/generated_images/brake_parts.png', category: 'parts', subject: 'parts', style: 'product', altText: 'Brake pads and rotors' },
  { filename: 'engine_block.png', filePath: '/generated_images/engine_block.png', category: 'parts', subject: 'parts', style: 'detail-closeup', altText: 'Engine block assembly' },
  { filename: 'suspension_parts.png', filePath: '/generated_images/suspension_parts.png', category: 'parts', subject: 'parts', style: 'product', altText: 'Suspension components' },
  { filename: 'tires_and_wheels.png', filePath: '/generated_images/tires_and_wheels.png', category: 'parts', subject: 'parts', style: 'product', altText: 'Tires and wheels' },
  { filename: 'buddy_ai_assistant.png', filePath: '/generated_images/buddy_ai_assistant.png', category: 'feature', subject: 'ai', style: 'product', altText: 'Buddy AI assistant mascot' },
  { filename: 'car_battery.png', filePath: '/generated_images/car_battery.png', category: 'parts', subject: 'parts', style: 'product', altText: 'Car battery' },
  { filename: 'exhaust_system.png', filePath: '/generated_images/exhaust_system.png', category: 'parts', subject: 'parts', style: 'product', altText: 'Exhaust system' },
  { filename: 'marine_parts.png', filePath: '/generated_images/marine_parts.png', category: 'parts', subject: 'garagebot', style: 'product', altText: 'Marine boat parts' },
  { filename: 'motorcycle.png', filePath: '/generated_images/motorcycle.png', category: 'vehicles', subject: 'garagebot', style: 'action-shot', altText: 'Motorcycle' },
  { filename: 'hatch_garagebot_buddy.png', filePath: '/generated_images/hatch_garagebot_buddy.png', category: 'brand', subject: 'garagebot', style: 'product', altText: 'GarageBot Buddy mascot' },
  { filename: 'hatch_garagebot_diy.png', filePath: '/generated_images/hatch_garagebot_diy.png', category: 'brand', subject: 'garagebot', style: 'lifestyle', altText: 'GarageBot DIY mechanic' },
  { filename: 'hatch_garagebot_nashville.png', filePath: '/generated_images/hatch_garagebot_nashville.png', category: 'brand', subject: 'garagebot', style: 'lifestyle', altText: 'GarageBot Nashville' },
  { filename: 'hatch_garagebot_search.png', filePath: '/generated_images/hatch_garagebot_search.png', category: 'brand', subject: 'garagebot', style: 'product', altText: 'GarageBot search feature' },
  { filename: 'garagebot_facebook_cover_16x9.png', filePath: '/generated_images/../attached_assets/garagebot_facebook_cover_16x9.png', category: 'brand', subject: 'garagebot', style: 'product', altText: 'GarageBot.io Facebook cover banner' },
];

export async function seedMarketingContent() {
  const existing = await db.select({ count: sql<number>`count(*)::int` })
    .from(marketingPosts)
    .where(
      and(
        eq(marketingPosts.tenantId, 'garagebot'),
        isNotNull(marketingPosts.category),
        ne(marketingPosts.category, '')
      )
    );

  const count = existing[0]?.count || 0;

  if (count >= 60) {
    console.log(`[Marketing Seed] Already has ${count} categorized posts, skipping seed.`);
    return;
  }

  console.log(`[Marketing Seed] Found ${count} categorized posts, seeding full content...`);

  await db.delete(marketingPosts).where(eq(marketingPosts.tenantId, 'garagebot'));
  await db.delete(marketingImages).where(eq(marketingImages.tenantId, 'garagebot'));

  for (const post of marketingContent) {
    try {
      await db.insert(marketingPosts).values({
        content: post.content,
        platform: post.platform,
        targetSite: post.targetSite,
        hashtags: post.hashtags,
        category: post.category,
        contentType: post.contentType,
        tone: post.tone,
        cta: post.cta,
        tenantId: 'garagebot',
        isActive: true,
      });
    } catch (err: any) {
      console.error(`[Marketing Seed] Failed to seed post:`, err.message);
    }
  }

  for (const img of marketingImagesList) {
    try {
      await db.insert(marketingImages).values({
        filename: img.filename,
        filePath: img.filePath,
        category: img.category,
        subject: img.subject,
        style: img.style,
        altText: img.altText,
        tenantId: 'garagebot',
        isActive: true,
        quality: 5,
        season: 'all-year',
      });
    } catch (err: any) {
      console.error(`[Marketing Seed] Failed to seed image ${img.filename}:`, err.message);
    }
  }

  console.log(`[Marketing Seed] Seeded ${marketingContent.length} posts and ${marketingImagesList.length} images successfully.`);
}
