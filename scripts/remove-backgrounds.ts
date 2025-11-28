import fs from 'fs';
import path from 'path';

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

if (!REMOVE_BG_API_KEY) {
  console.error('Error: REMOVE_BG_API_KEY environment variable is required');
  console.log('\nTo get a free API key:');
  console.log('1. Go to https://www.remove.bg/api');
  console.log('2. Sign up for a free account');
  console.log('3. Get your API key from the dashboard');
  console.log('4. Add it as a secret in Replit');
  process.exit(1);
}

const mascotImages = [
  'robot_mascot_waving_hello.png',
  'robot_mascot_thinking_pose.png',
  'robot_mascot_holding_brake_pads.png',
  'robot_mascot_holding_oil_filter.png',
  'robot_mascot_holding_spark_plugs.png',
  'robot_mascot_holding_car_battery.png',
  'robot_mascot_holding_tire.png',
  'robot_mascot_holding_brake_rotor.png',
  'gauge-eyed_junkyard_robot_mascot.png',
];

const INPUT_DIR = 'attached_assets/generated_images';
const OUTPUT_DIR = 'attached_assets/mascot_transparent';

async function removeBackground(imagePath: string, outputPath: string): Promise<void> {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  console.log(`Processing: ${path.basename(imagePath)}...`);
  
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': REMOVE_BG_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_file_b64: base64Image,
      size: 'auto',
      format: 'png',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, resultBuffer);
  console.log(`✓ Saved: ${path.basename(outputPath)}`);
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Removing backgrounds from mascot images...\n');

  let processed = 0;
  let failed = 0;

  for (const imageName of mascotImages) {
    const inputPath = path.join(INPUT_DIR, imageName);
    const outputPath = path.join(OUTPUT_DIR, imageName);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠ Skipping (not found): ${imageName}`);
      continue;
    }

    try {
      await removeBackground(inputPath, outputPath);
      processed++;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ Failed: ${imageName} -`, error);
      failed++;
    }
  }

  console.log(`\nDone! Processed: ${processed}, Failed: ${failed}`);
  console.log(`Transparent images saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
