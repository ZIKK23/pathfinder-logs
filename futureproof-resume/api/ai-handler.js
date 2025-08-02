require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIAnalysis(cvText, careerInterest) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fullPrompt = `
        YOUR ROLE: You are an expert AI Career Advisor specializing in optimizing CVs for ATS and industry relevance.

        YOUR PRIMARY TASKS:
        1. Analyze the provided CV.
        2. Identify its strengths and weaknesses from an ATS perspective.
        3. Provide specific, relevant, and actionable recommendations.
        4. Tailor all advice to the user's chosen career interest: "${careerInterest}".

        OUTPUT GUIDELINES:
        * **CRITICAL: Use short, scannable bullet points. Each point must be a single, clear idea.**
        * **Start each recommendation with a strong action verb (e.g., Add, Use, Quantify, Rephrase).**
        * **Keep the language simple and direct, suitable for students and fresh graduates.**
        * Do not deviate from the requested HTML format.
        * The user's CV text may be in Indonesian. Analyze it in its original language, but provide all feedback in English.
        * dont show html tags in the output, just the content inside them.

        User's CV Text:
        ---
        ${cvText}
        ---

        REQUIRED HTML OUTPUT STRUCTURE:
        <div class="score-display" style="background: linear-gradient(145deg, #8D1B3D, #6A142D);">
            <span>[ATS SCORE BETWEEN 60-100]</span>
            <p>ATS Score</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 30px; font-style: italic;">[Provide a brief, one-sentence explanation for the score.]</p>

        <h3>✨ Key Strengths of Your CV</h3>
        <ul>
            <li>[Write a concise strength (max 15 words).]</li>
            <li>[Write a second concise strength (max 15 words).]</li>
        </ul>

        <h3>🛠️ Quick Improvement Areas</h3>
        <div>
            <button class="accordion-toggle">Keyword Optimization</button>
            <div class="accordion-content">
                <div>
                    <ul>
                        <li>[Suggest 2-3 specific technical keywords to add.]</li>
                        <li>[Suggest 1-2 relevant soft skill keywords.]</li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <button class="accordion-toggle">Structure & Format</button>
            <div class="accordion-content">
                <div>
                    <ul>
                        <li>[Give one clear, actionable tip on formatting (e.g., 'Use bullet points for job descriptions').]</li>
                        <li>[Give another short tip on structure (e.g., 'Place Education section after Summary').]</li>
                    </ul>
                </div>
            </div>
        </div>

        <h3>🚀 Recommended Future Skills</h3>
        <div class="skill-cards-container">
            <div class="skill-card">
                <strong>[Relevant Skill Name 1]:</strong> [Briefly explain its importance in one short sentence.]
            </div>
            <div class="skill-card">
                <strong>[Relevant Skill Name 2]:</strong> [Briefly explain its importance in one short sentence.]
            </div>
        </div>

        <h3>✍️ Effective Sentence Examples</h3>
        <div class="copy-box">
            <pre><code>[Write one concise example of a professional summary (2-3 lines max).]</code></pre>
            <button class="copy-btn">Copy</button>
        </div>
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const analysisHtml = response.text();

        return analysisHtml;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error.message.includes('SAFETY')) {
            return "<h3>Analysis Blocked</h3><p>The content you provided may have violated Google AI's safety policies. Please ensure there is no sensitive personal information in the CV.</p>";
        }
        return "Sorry, an error occurred while communicating with the Gemini AI. Please try again later.";
    }
}

module.exports = { getAIAnalysis };