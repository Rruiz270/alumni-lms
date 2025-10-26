const fs = require('fs');
const path = require('path');

// List of API files to fix
const apiFiles = [
  'src/app/api/admin/content/route.ts',
  'src/app/api/import-production/route.ts',
  'src/lib/auth.ts'
];

const searchPattern = "import { prisma } from '@/lib/prisma'";
const replacement = "import { directPrisma as prisma } from '@/lib/direct-prisma'";

console.log('🔧 Fixing API database connections...');

apiFiles.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchPattern)) {
        content = content.replace(searchPattern, replacement);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${file}`);
      } else {
        console.log(`⚠️ No change needed: ${file}`);
      }
    } else {
      console.log(`❌ File not found: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('🎯 API fixes completed!');