const fs = require('fs');
const path = require('path');

const dir = __dirname;

function replaceInDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (/\.(html|js|css)$/.test(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('النمر')) {
                content = content.replace(/النمر/g, 'النمر');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Replaced in ' + fullPath);
            }
        }
    }
}

replaceInDir(dir);
