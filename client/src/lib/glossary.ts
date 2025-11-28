export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'brakes' | 'engine' | 'fluids' | 'electrical' | 'tires' | 'suspension' | 'transmission' | 'general';
  image?: string;
}

export const autoGlossary: GlossaryTerm[] = [
  // Brakes
  {
    term: "brake pads",
    definition: "The parts that squeeze against the rotors to slow down your wheels. They wear out over time and need replacing - usually every 30,000-70,000 miles.",
    category: "brakes",
    image: "brake_pads"
  },
  {
    term: "rotor",
    definition: "The shiny metal disc that your brake pads squeeze to stop the car. Also called a brake disc. If they get grooved or warped, you'll feel vibration when braking.",
    category: "brakes",
    image: "brake_rotor"
  },
  {
    term: "caliper",
    definition: "The clamp that holds your brake pads and squeezes them against the rotor when you press the brake pedal. Think of it like a big C-clamp.",
    category: "brakes",
    image: "brake_pads"
  },
  {
    term: "brake fluid",
    definition: "The liquid that transfers the force from your brake pedal to the brake calipers. It's usually clear or slightly yellow. If it looks dark, it needs changing!",
    category: "fluids",
    image: "oil_filter"
  },
  
  // Engine
  {
    term: "spark plug",
    definition: "Creates the tiny spark that ignites the fuel in your engine. Bad spark plugs can cause misfires, rough idling, or trouble starting. Usually replaced every 30,000-100,000 miles.",
    category: "engine",
    image: "spark_plugs"
  },
  {
    term: "air filter",
    definition: "Catches dust and debris before air enters your engine. A dirty one reduces fuel efficiency and power. Easy DIY replacement - usually just pops out!",
    category: "engine",
    image: "oil_filter"
  },
  {
    term: "oil filter",
    definition: "Cleans your engine oil by catching dirt and metal particles. Changed every time you get an oil change. Keeps your engine running smooth!",
    category: "engine",
    image: "oil_filter"
  },
  {
    term: "alternator",
    definition: "Charges your car battery while the engine runs and powers all your electrical stuff. If your battery keeps dying, the alternator might be the problem.",
    category: "electrical",
    image: "car_battery"
  },
  {
    term: "starter",
    definition: "The electric motor that cranks your engine when you turn the key. If you hear a clicking sound but the engine won't start, it might be the starter.",
    category: "electrical",
    image: "car_battery"
  },
  {
    term: "timing belt",
    definition: "A rubber belt that keeps your engine's valves opening and closing at the right time. VERY important - if it breaks, it can destroy your engine. Replace at the recommended interval!",
    category: "engine",
    image: "general"
  },
  {
    term: "serpentine belt",
    definition: "The long belt that wraps around multiple pulleys and powers things like your alternator, power steering, and AC. If it squeaks, it might need replacing.",
    category: "engine",
    image: "general"
  },
  
  // Fluids
  {
    term: "coolant",
    definition: "Also called antifreeze - it keeps your engine from overheating in summer and freezing in winter. Usually green, orange, or pink. Check the overflow tank to see the level!",
    category: "fluids",
    image: "oil_filter"
  },
  {
    term: "transmission fluid",
    definition: "Lubricates the gears in your transmission. If it's dark or smells burnt, it needs changing. Low fluid can cause shifting problems.",
    category: "fluids",
    image: "oil_filter"
  },
  {
    term: "power steering fluid",
    definition: "Makes turning your steering wheel easy. If steering feels heavy or you hear whining when turning, check this fluid!",
    category: "fluids",
    image: "oil_filter"
  },
  
  // Electrical
  {
    term: "battery",
    definition: "Stores electricity to start your car and power accessories when the engine is off. Most last 3-5 years. If your car struggles to start on cold mornings, it might be time for a new one.",
    category: "electrical",
    image: "car_battery"
  },
  {
    term: "fuse",
    definition: "A small safety device that protects electrical circuits. If something electrical stops working (like your radio or lights), a blown fuse might be the cause. Easy and cheap to replace!",
    category: "electrical",
    image: "car_battery"
  },
  
  // Tires
  {
    term: "tire",
    definition: "The rubber part that touches the road. Check the tread depth with a penny - if you can see Lincoln's head, they're too worn. Don't forget to check the spare!",
    category: "tires",
    image: "tire"
  },
  {
    term: "tire pressure",
    definition: "How much air is in your tires, measured in PSI. The right pressure is on a sticker inside your driver's door. Check monthly - proper pressure saves gas and prevents wear!",
    category: "tires",
    image: "tire"
  },
  {
    term: "wheel bearing",
    definition: "Allows your wheels to spin smoothly. If you hear a humming or grinding noise that changes with speed, it might be a bad wheel bearing.",
    category: "suspension",
    image: "tire"
  },
  
  // Suspension
  {
    term: "shock absorber",
    definition: "Absorbs bumps in the road for a smoother ride. Also called shocks. If your car bounces a lot after hitting a bump, your shocks might be worn out.",
    category: "suspension",
    image: "general"
  },
  {
    term: "strut",
    definition: "Like a shock absorber but also part of the structure that holds your wheel. Struts wear out over time and affect handling and tire wear.",
    category: "suspension",
    image: "general"
  },
  {
    term: "ball joint",
    definition: "A pivot point that allows your wheels to move up/down and turn left/right. Worn ball joints can cause clunking noises and unsafe handling.",
    category: "suspension",
    image: "general"
  },
  
  // Transmission
  {
    term: "clutch",
    definition: "In a manual transmission, it's the pedal on the left that disconnects the engine from the wheels so you can shift gears. The clutch disc wears out over time.",
    category: "transmission",
    image: "general"
  },
  {
    term: "CV joint",
    definition: "Connects your transmission to your wheels and allows them to move up/down while still getting power. A clicking noise when turning often means a bad CV joint.",
    category: "transmission",
    image: "general"
  },
  
  // General
  {
    term: "OEM",
    definition: "Original Equipment Manufacturer - parts made by the same company that made your car's original parts. Usually more expensive but guaranteed to fit perfectly.",
    category: "general",
    image: "general"
  },
  {
    term: "aftermarket",
    definition: "Parts made by companies other than the original manufacturer. Can be cheaper and sometimes even better quality. Great for upgrades!",
    category: "general",
    image: "general"
  },
  {
    term: "fitment",
    definition: "Whether a part will fit your specific vehicle. Always check the year, make, and model before buying to make sure you get the right fitment!",
    category: "general",
    image: "general"
  },
  {
    term: "torque",
    definition: "Twisting force - how tight a bolt should be. Over-tightening can strip threads, under-tightening can cause parts to come loose. Use a torque wrench for important bolts!",
    category: "general",
    image: "general"
  },
  {
    term: "VIN",
    definition: "Vehicle Identification Number - a 17-character code unique to your vehicle. Found on your dashboard, door jamb, and registration. Use it to find the exact right parts!",
    category: "general",
    image: "general"
  }
];

export function findGlossaryTerm(text: string): GlossaryTerm | undefined {
  const lowerText = text.toLowerCase();
  return autoGlossary.find(entry => 
    lowerText.includes(entry.term.toLowerCase())
  );
}

export function getAllTerms(): string[] {
  return autoGlossary.map(entry => entry.term);
}

export function getTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return autoGlossary.filter(entry => entry.category === category);
}
