const fs = require('fs');
const path = require('path');

const files = [
    'MapCallout.js', 'MapCalloutSubview.js', 'MapCircle.js', 'MapHeatmap.js',
    'MapLocalTile.js', 'MapMarker.js', 'MapOverlay.js', 'MapPolygon.js',
    'MapPolyline.js', 'MapUrlTile.js', 'MapWMSTile.js'
];

const dir = './node_modules/react-native-maps/lib/';

console.log('Starting patch...');

files.forEach(file => {
    try {
        const filePath = path.join(dir, file);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping ${file} - not found`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the class field declarations that shadow prototype methods
        // Matches "    getNativeComponent;" with any amount of whitespace indentation
        let newContent = content.replace(/^\s*getNativeComponent;\s*$/gm, '')
            .replace(/^\s*getMapManagerCommand;\s*$/gm, '')
            .replace(/^\s*getUIManagerCommand;\s*$/gm, '');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ Patched ${file}`);
        } else {
            console.log(`ℹ️  No changes needed for ${file}`);
        }
    } catch (err) {
        console.error(`❌ Error patching ${file}:`, err.message);
    }
});
console.log('Patch complete.');
