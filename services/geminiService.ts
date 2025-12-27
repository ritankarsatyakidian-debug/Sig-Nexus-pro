
import { GoogleGenAI } from "@google/genai";

/**
 * Main chatbot logic using the high-intelligence Pro model.
 */
export const generateAIResponse = async (
  character: string,
  userMessage: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const model = 'gemini-3-pro-preview';
    
    const systemInstructions: Record<string, string> = {
      ritankar: `You are Ritankar, the Lead System Architect of Sig-Nexus. 
        Your responses are highly structured, technical, and accurate. 
        Focus on scalability, modularity, and structural integrity.`,
      
      ibhan: `You are Ibhan, the Network Strategist for SigMesh. 
        You are an expert in decentralized networking, P2P protocols, and encryption handshakes.`,
      
      soumyadeepta: `You are Soumyadeepta, the Energy Engineer. 
        You provide accurate calculations regarding wattage, load balancing, and grid stability.`,
      
      saanvi: `You are Saanvi, the Bridge Explainer. 
        Make complex Sig-Nexus technology accessible via clear analogies.`,
      
      satyaki: `You are Satyaki, the Defense Specialist. 
        View every system through the lens of security and risk mitigation.`,
      
      dian: `You are Dian, the Experimental Risk-Taker. 
        Cryptic, mischievous, and references 'glitch-tech'.`
    };

    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstructions[character.toLowerCase()] || "You are an expert advisor in the Sig-Nexus ecosystem.",
        temperature: character === 'dian' ? 1.1 : 0.7,
      },
    });

    return response.text || "Handshake timeout. Signal lost in the mesh.";
  } catch (error) {
    console.error("Gemini Pro API Error:", error);
    return "Handshake failed. Encryption tunnel unstable.";
  }
};

/**
 * Fast analysis for specific simulation data.
 */
export const analyzeSimulationData = async (mode: string, stateData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const model = 'gemini-3-flash-preview';
    
    let specificContext = "";
    if (mode === 'NANO') {
      specificContext = "Focus on atomic bonds, molecular stability, and elemental ratios.";
    }

    const prompt = `
      ACT AS: A Senior Systems Analyst for Sig-Nexus-Pro.
      TASK: Perform a technical audit of the current ${mode} simulation state.
      ${specificContext}
      DATA: ${JSON.stringify(stateData)}
      
      REQUIREMENTS:
      1. Provide a "Current Status" summary.
      2. Identify specific "Operational Risks" or inefficiencies.
      3. Give one "Optimization Protocol" recommendation.
      
      Return results in Markdown.
    `;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a high-speed diagnostic AI for the Sig-Nexus. Be accurate, concise, and technical.",
        temperature: 0.2, 
      },
    });

    return response.text || "Diagnostic stream interrupted. System nominal.";
  } catch (error) {
    console.error("Gemini Flash API Error:", error);
    return "Analysis failure: Data packet corrupted during quantization.";
  }
};
