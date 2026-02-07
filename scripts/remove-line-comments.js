// 仅删除 src/pages 下 .vue / .js 文件的简单行注释： // xxx
// 不处理块注释、多行注释、字符串中的 // 等复杂情况

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const patterns = [
  'src/pages/**/*.vue',
  'src/pages/**/*.js',
];

function removeLineCommentsFromContent(content) {
  const lines = content.split(/\r?\n/);

  const processed = lines.map((line) => {
    const trimmed = line.trim();

    // 空行直接返回
    if (!trimmed) return line;

    // 整行注释： // xxx
    if (/^\/\/.*.*/.test(trimmed)) {
      return '';
    }

    // 行尾注释： code // comment
    const doubleSlashIndex = line.indexOf('//');
    if (doubleSlashIndex !== -1) {
      const before = line.slice(0, doubleSlashIndex);

      // 粗略判定 // 是否在字符串中：引号数量为奇数就认为在字符串里，跳过
      const quoteCount = (before.match(/['"]/g) || []).length;
      if (quoteCount % 2 === 0) {
        return before.replace(/\s+$/, '');
      }
    }

    return line;
  });

  return processed.join('\n');
}

function processFiles() {
  patterns.forEach((pattern) => {
    const files = glob.sync(pattern, { nodir: true });
    files.forEach((file) => {
      const fullPath = path.resolve(file);
      const original = fs.readFileSync(fullPath, 'utf8');
      const cleaned = removeLineCommentsFromContent(original);

      if (cleaned !== original) {
        fs.writeFileSync(fullPath, cleaned, 'utf8');
        console.log('processed:', file);
      }
    });
  });
}

processFiles();

