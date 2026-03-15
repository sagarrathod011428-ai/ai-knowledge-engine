import { extractTextFromPDF, getRelevantContext } from '../../utils/pdfParser';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function queryHuggingFace(prompt) {
  const token = process.env.HUGGINGFACE_API_TOKEN;

  if (!token) {
    throw new Error('HuggingFace API token not configured. Add HUGGINGFACE_API_TOKEN in Vercel environment variables.');
  }

  const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.4,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Model is loading. Please wait 20–30 seconds and try again.');
    }
    const errText = await response.text();
    throw new Error(`HuggingFace API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const generated = Array.isArray(result)
    ? result[0]?.generated_text
    : result?.generated_text;

  if (!generated) {
    throw new Error('No response generated. Please rephrase your question.');
  }

  return generated.trim();
}

function buildPrompt(context, question, chatHistory = []) {
  const systemInstruction = `You are an expert document analyst. Answer questions ONLY based on the provided document context. 
If the answer is not found in the document, clearly state "This information is not in the uploaded document." 
Be concise, accurate, and helpful.`;

  const recentHistory = chatHistory.slice(-3);
  const historyStr = recentHistory
    .map((msg) =>
      msg.role === 'user'
        ? `[INST] ${msg.content} [/INST]`
        : msg.content
    )
    .join('\n');

  return `<s>[INST] ${systemInstruction}

DOCUMENT CONTEXT:
---
${context}
---

${historyStr ? `CONVERSATION HISTORY:\n${historyStr}\n` : ''}

QUESTION: ${question} [/INST]`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { action, fileData, fileName, question, documentText, chatHistory } = req.body;

    if (action === 'parse') {
      if (!fileData) {
        return res.status(400).json({ error: 'No file data provided.' });
      }
      const buffer = Buffer.from(fileData, 'base64');
      const { text, pages, info } = await extractTextFromPDF(buffer);

      return res.status(200).json({
        success: true,
        text,
        pages,
        info,
        charCount: text.length,
        message: `Parsed "${fileName}" — ${pages} pages extracted.`,
      });
    }

    if (action === 'ask') {
      if (!question?.trim()) {
        return res.status(400).json({ error: 'Please enter a question.' });
      }
      if (!documentText?.trim()) {
        return res.status(400).json({ error: 'No document loaded. Upload a PDF first.' });
      }

      const context = getRelevantContext(documentText, question);
      const prompt = buildPrompt(context, question, chatHistory || []);
      const answer = await queryHuggingFace(prompt);

      return res.status(200).json({ success: true, answer });
    }

    return res.status(400).json({ error: 'Invalid action.' });
  } catch (err) {
    console.error('[API Error]:', err.message);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
