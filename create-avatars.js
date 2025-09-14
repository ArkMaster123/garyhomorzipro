const fs = require('fs');
const path = require('path');

// Create simple colored circle avatars
const colors = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6'  // Purple
];

colors.forEach((color, index) => {
  const svg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="${color}"/>
  <circle cx="20" cy="16" r="8" fill="white" opacity="0.8"/>
  <path d="M32 36C32 31.582 26.627 28 20 28C13.373 28 8 31.582 8 36" stroke="white" stroke-width="2" opacity="0.8"/>
</svg>`;
  
  const filePath = path.join(__dirname, 'public', `avatar-${index + 1}.png`);
  fs.writeFileSync(filePath, svg);
});

console.log('Created avatar images');
