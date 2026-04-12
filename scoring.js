/**
 * 人格计分（与 UI 解耦，供 App 与模拟脚本共用）
 *
 * norm 使用轻量拉普拉斯平滑，缓和「随机答题」在某一维上因噪声贴边，
 * 导致少数人格组合占比过高；真·强倾向仍会在 24 题后占上风。
 *
 * norm(l) = (scores[l] + k) / (maxPossible[l] + 2k)，k = NORM_LAPLACE_K
 * （k≈0.35 时在「随机四选一」蒙特卡下 16 型占比方差略低于 k=0。）
 */
export const NORM_LAPLACE_K = 0.35;

export function calculateResult(answers, questionsUsed) {
  const scores = { E: 0, I: 0, C: 0, W: 0, H: 0, F: 0, A: 0, S: 0 };
  answers.forEach((tags) => tags.forEach((t) => (scores[t] = (scores[t] || 0) + 1)));

  const maxPossible = { E: 0, I: 0, C: 0, W: 0, H: 0, F: 0, A: 0, S: 0 };
  questionsUsed.forEach((q) => {
    q.options.forEach((opt) => {
      opt.tags.forEach((t) => (maxPossible[t] = (maxPossible[t] || 0) + 1));
    });
  });

  const k = NORM_LAPLACE_K;
  const norm = (l) => {
    const m = maxPossible[l] || 0;
    const denom = m + 2 * k;
    if (denom <= 0) return 0.5;
    return (scores[l] + k) / denom;
  };

  const code =
    (norm('E') >= norm('I') ? 'E' : 'I') +
    (norm('C') >= norm('W') ? 'C' : 'W') +
    (norm('H') >= norm('F') ? 'H' : 'F') +
    (norm('A') >= norm('S') ? 'A' : 'S');

  const pct = (a, b) => {
    const na = norm(a);
    const nb = norm(b);
    const sum = na + nb;
    if (sum === 0) return 50;
    return Math.round((na / sum) * 100);
  };

  return { code, scores, maxPossible, pct };
}
