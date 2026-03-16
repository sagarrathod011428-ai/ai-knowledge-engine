export async function extractTextFromPDF(buffer) {
  try {
    // Dynamically import to prevent webpack bundling issues
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    const rawText = data.text || '';

    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    if (!cleanedText) {
      throw new Error('No readable text found. PDF may be image-based.');
    }

    return {
      text: cleanedText,
      pages: data.numpages,
      info: data.info || {},
    };
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
}

export function getRelevantContext(fullText, question, maxChars = 3500) {
  if (fullText.length <= maxChars) return fullText;

  const questionWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter((w) => w.length > 3);

  const paragraphs = fullText
    .split('\n\n')
    .filter((p) => p.trim().length > 30);

  const scored = paragraphs.map((para) => {
    const paraLower = para.toLowerCase();
    const score = questionWords.reduce((acc, word) => {
      return acc + (paraLower.includes(word) ? 1 : 0);
    }, 0);
    return { para, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let context = '';
  for (const { para } of scored) {
    if ((context + '\n\n' + para).length > maxChars) break;
    context += '\n\n' + para;
  }

  return context.trim() || fullText.slice(0, maxChars);
}
