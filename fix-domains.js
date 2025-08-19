// Simple Domain Fix Script for NexaCore Innovations
// Run with: node fix-domains.js

const fs = require('fs');

console.log('🔧 Fixing domain consistency in index.html...');

function fixDomains() {
  // Check if index.html exists
  if (!fs.existsSync('index.html')) {
    console.log('❌ index.html not found!');
    console.log('   Make sure you run this from your project root directory');
    return;
  }

  // Create backup
  if (!fs.existsSync('index.html.backup')) {
    fs.copyFileSync('index.html', 'index.html.backup');
    console.log('📋 Created backup: index.html.backup');
  }

  // Read and fix the file
  let content = fs.readFileSync('index.html', 'utf8');
  let changes = 0;

  // Fix domain references
  const fixes = [
    {
      from: /https:\/\/nexacore-innovations\.com(?!\/)/g,
      to: 'https://www.nexacore-innovations.com',
      name: 'domain-only references'
    },
    {
      from: /https:\/\/nexacore-innovations\.com\//g,
      to: 'https://www.nexacore-innovations.com/',
      name: 'URLs with paths'
    },
    {
      from: /"nexacore-innovations\.com"/g,
      to: '"www.nexacore-innovations.com"',
      name: 'JSON-LD structured data'
    }
  ];

  fixes.forEach(fix => {
    const matches = content.match(fix.from);
    if (matches) {
      content = content.replace(fix.from, fix.to);
      changes += matches.length;
      console.log(`✅ Fixed ${matches.length} ${fix.name}`);
    }
  });

  // Add canonical URL if missing
  if (!content.includes('<link rel="canonical"')) {
    const headEnd = content.indexOf('</head>');
    if (headEnd !== -1) {
      const canonical = '\n    <link rel="canonical" href="https://www.nexacore-innovations.com/">\n  ';
      content = content.substring(0, headEnd) + canonical + content.substring(headEnd);
      changes++;
      console.log('✅ Added canonical URL');
    }
  }

  // Save the file
  if (changes > 0) {
    fs.writeFileSync('index.html', content);
    console.log(`\n🎯 Applied ${changes} fixes to index.html`);
    
    // Verify EmailJS is preserved
    if (content.includes('emailjs')) {
      console.log('✅ EmailJS integration preserved');
    }
    
    console.log('\n🚀 Done! Your domains are now consistent.');
    console.log('   All URLs now use: www.nexacore-innovations.com');
  } else {
    console.log('\n✨ No changes needed - already perfect!');
  }
}

// Run the fix
fixDomains();
