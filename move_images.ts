
import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/You/.gemini/antigravity/brain/0a2a5e58-3ce1-4867-a3eb-86022bca1e73';
const destDir = 'c:/Users/You/Desktop/adet-mainproject-bsit22/adet-be-bsit22/public/uploads';

const mapping = {
  'academic_textbook_sample': 'cat1.png',
  'lecture_notes_sample': 'cat2.png',
  'scientific_apparatus_sample': 'cat3.png',
  'computing_assets_sample': 'cat4.png',
  'math_instruments_sample': 'cat5.png',
  'vocational_tools_sample': 'cat6.png',
  'art_tools_sample': 'cat7.png',
  'medical_supplies_sample': 'cat8.png',
  'pe_kits_sample': 'cat9.png',
  'institutional_equipment_sample': 'cat10.png',
  'scholarly_manuscripts_sample': 'cat11.png',
  'miscellaneous_resources_sample': 'cat12.png'
};

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

for (const file of files) {
  for (const [key, value] of Object.entries(mapping)) {
    if (file.startsWith(key)) {
      console.log(`Moving ${file} to ${value}`);
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, value));
    }
  }
}

console.log('All files moved successfully.');
