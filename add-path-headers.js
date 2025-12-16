// File Path: add-path-headers.js

const fs = require('fs');
const path = require('path');

// فهرست پسوندهای فایل‌های Next.js که باید ویرایش شوند
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// فهرست پوشه‌هایی که باید نادیده گرفته شوند
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'public']; 

function processDirectory(dir) {
    fs.readdirSync(dir).forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                processDirectory(fullPath); // بازگشتی برای پوشه‌های داخلی
            }
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (FILE_EXTENSIONS.includes(ext)) {
                addPathHeader(fullPath);
            }
        }
    });
}

function addPathHeader(filePath) {
    try {
        const relativePath = path.relative(process.cwd(), filePath);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // الگوی کامنت مورد نظر شما (برای JS/TSX)
        const headerComment = `// File Path: ${relativePath}\n\n`;
        
        // اطمینان از اینکه قبلاً این هدر اضافه نشده باشد (اختیاری)
        if (fileContent.startsWith('// File Path:')) {
             console.log(`Skipping (already has header): ${relativePath}`);
             return;
        }

        // درج کامنت در ابتدای محتوای فایل
        const newContent = headerComment + fileContent;
        fs.writeFileSync(filePath, newContent, 'utf8');
        
        console.log(`Successfully added header to: ${relativePath}`);
        
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    }
}

// شروع اسکن از پوشه ریشه پروژه
console.log("--- Starting Bulk File Path Injection ---");
processDirectory(process.cwd()); 
console.log("--- Finished ---");