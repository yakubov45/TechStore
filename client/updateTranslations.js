const fs = require('fs');
const path = require('path');

const srcDirs = [
    path.join(__dirname, 'src', 'pages', 'admin'),
    path.join(__dirname, 'src', 'components', 'admin'),
    path.join(__dirname, 'src', 'pages', 'Admin.jsx')
];

const localesDir = path.join(__dirname, 'src', 'locales');
const localeFiles = ['en.json', 'uz.json', 'ru.json'];

// Dictionary to hold extracted string mappings: admin.key -> "Default Value"
const extractedKeys = {};

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match t('admin.key', 'Default text') or t("admin.key", "Default text")
    const regex = /t\(\s*['"](admin\.[^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const keyPath = match[1];
        const defaultValue = match[2];
        extractedKeys[keyPath] = defaultValue;
    }
}

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) {
        processFile(dirPath);
    } else if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            processDirectory(path.join(dirPath, file));
        }
    }
}

// 1. Extract keys from all files
for (const dir of srcDirs) {
    processDirectory(dir);
}

// Function to set nested key in object
function setNestedKey(obj, pathString, value) {
    const parts = pathString.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    const finalPart = parts[parts.length - 1];
    if (!current[finalPart]) {
        current[finalPart] = value;
    }
}

// 2. Update each locale file
for (const file of localeFiles) {
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) continue;

    const localeObj = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const [keyPath, defaultValue] of Object.entries(extractedKeys)) {
        // If the key doesn't exist, we add it with the default English value.
        // It serves as a fallback. Ideally we'd translate to UZ and RU immediately, but let's first get them registered so they don't break.
        setNestedKey(localeObj, keyPath, defaultValue);
    }

    fs.writeFileSync(filePath, JSON.stringify(localeObj, null, 4));
    console.log(`Updated ${file} with ${Object.keys(extractedKeys).length} keys.`);
}
