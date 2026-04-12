/**
 * 从 App.jsx 读取题库与题量，复刻 pickQuestions / calculateResult，
 * 随机答题 N 次，统计 16 人格代码出现频率。
 *
 * 运行: node scripts/personality-distribution.mjs
 * 可选: node scripts/personality-distribution.mjs 50000
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { calculateResult, NORM_LAPLACE_K } from '../scoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const app = readFileSync(join(root, 'App.jsx'), 'utf8');

const qlMatch = app.match(/const QUIZ_LENGTH = (\d+)/);
const QUIZ_LENGTH = qlMatch ? parseInt(qlMatch[1], 10) : 24;

function extractArrayLiteral(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error(`找不到标记: ${marker}`);
  let j = i + marker.length;
  while (j < src.length && src[j] !== '[') j++;
  if (src[j] !== '[') throw new Error('数组起始 [ 未找到');
  let depth = 0;
  const start = j;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) return src.slice(start, j + 1);
    }
  }
  throw new Error('数组括号未闭合');
}

const poolLiteral = extractArrayLiteral(app, 'const QUESTIONS_POOL = ');
const QUESTIONS_POOL = (0, eval)(poolLiteral);

function pickQuestions() {
  const arr = [...QUESTIONS_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, QUIZ_LENGTH);
}

function simulateOnce() {
  const questions = pickQuestions();
  const answers = questions.map((q) => {
    const opts = q.options;
    const k = Math.floor(Math.random() * opts.length);
    return opts[k].tags;
  });
  return calculateResult(answers, questions).code;
}

const N = Math.max(1000, parseInt(process.argv[2] || '100000', 10) || 100000);
const counts = Object.create(null);
const ALL_16 = [];
for (const a of ['E', 'I']) {
  for (const b of ['C', 'W']) {
    for (const c of ['H', 'F']) {
      for (const d of ['A', 'S']) {
        const code = a + b + c + d;
        ALL_16.push(code);
        counts[code] = 0;
      }
    }
  }
}

for (let i = 0; i < N; i++) {
  const code = simulateOnce();
  counts[code] = (counts[code] || 0) + 1;
}

const expected = 100 / 16;
const pcts = ALL_16.map((code) => ({
  code,
  n: counts[code],
  pct: (counts[code] / N) * 100,
}));
const minPct = Math.min(...pcts.map((x) => x.pct));
const maxPct = Math.max(...pcts.map((x) => x.pct));
const mean = pcts.reduce((s, x) => s + x.pct, 0) / 16;
const variance = pcts.reduce((s, x) => s + (x.pct - mean) ** 2, 0) / 16;
const std = Math.sqrt(variance);
const missing = ALL_16.filter((c) => counts[c] === 0);

console.log(
  `题库: ${QUESTIONS_POOL.length} 道, 每次抽 ${QUIZ_LENGTH} 道, 每题随机 4 选 1 · norm 拉普拉斯 k=${NORM_LAPLACE_K}`
);
console.log(`模拟次数: ${N.toLocaleString()}`);
console.log(`理论均匀占比(16 型): ${expected.toFixed(4)}%`);
console.log(`实际占比范围: ${minPct.toFixed(3)}% ~ ${maxPct.toFixed(3)}%`);
console.log(`占比标准差(16 型): ${std.toFixed(4)}%`);
if (missing.length) console.log('从未出现的类型:', missing.join(', '));
else console.log('16 种人格在模拟中均至少出现 1 次');
console.log('');
console.log('代码\t次数\t占比%');
console.log('-'.repeat(28));
for (const { code, n, pct } of pcts.sort((a, b) => b.n - a.n)) {
  console.log(`${code}\t${n}\t${pct.toFixed(3)}`);
}
