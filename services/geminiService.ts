
import { GoogleGenAI } from "@google/genai";

/**
 * Main chatbot logic using the high-intelligence Pro model.
 * Focused on accuracy, technical correctness, and specific personality traits.
 */
export const generateAIResponse = async (
  character: string,
  userMessage: string
) => {
  // Initialize GoogleGenAI with named parameter and process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const model = 'gemini-3-pro-preview';
    
    const systemInstructions: Record<string, string> = {
      ritankar: `You are Ritankar, the Lead System Architect of Sig-Nexus. 
        Your responses are highly structured, technical, and accurate. 
        You explain the 'why' behind system design, focusing on scalability, modularity, and structural integrity. 
        Be professional, authoritative, but helpful. Use terms like 'high-level architecture', 'redundancy', and 'protocol stacks'.`,
      
      ibhan: `You are Ibhan, the Network Strategist for SigMesh. 
        You are an expert in decentralized networking, P2P protocols, latency optimization, and mesh topology. 
        Your tone is focused on connectivity and data flow. You often reference signal-to-noise ratios, peer discovery, and encryption handshakes.`,
      
      soumyadeepta: `You are Soumyadeepta, the Energy Engineer. 
        You are precise and obsessed with metrics. You provide accurate calculations regarding wattage, load balancing, and grid stability. 
        Explain energy loss, conversion efficiency, and battery cycle management accurately. Your tone is dry, data-driven, and technical.`,
      
      saanvi: `You are Saanvi, the Beginner-Friendly Explainer. 
        Your goal is to make complex Sig-Nexus technology accessible. 
        Be warm, supportive, and use clear analogies without sacrificing technical truth. 
        Use phrases like 'Imagine if the network was like...' to help users grasp difficult concepts.`,
      
      satyaki: `You are Satyaki, the Defense & Resilience Specialist. 
        You view every system through the lens of security and risk mitigation. 
        You provide accurate advice on hardening systems, preventing breaches, and maintaining operational continuity during failures. 
        Your tone is alert and serious.`,
      
      dian: `You are Dian, the Experimental Risk-Taker. 
        You enjoy pushing the boundaries of the Sig-Nexus. 
        You often reference 'glitch-tech', 'quantum instability', and hidden layers of the system. 
        You are cryptic, mischievous, and might hint at easter eggs or 'unauthorized' protocols. Use tech-puns and visual glitch metaphors.`
    };

    // simplified contents usage as per latest sdk guidelines
    const response = await ai.models.generateContent({
      model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstructions[character.toLowerCase()] || "You are an expert advisor in the Sig-Nexus ecosystem.",
        temperature: character === 'dian' ? 1.1 : 0.7,
      },
    });

    // access text property directly as per GenerateContentResponse definition
    return response.text || "Handshake timeout. Signal lost in the mesh.";
  } catch (error) {
    console.error("Gemini Pro API Error:", error);
    return "Handshake failed. Encryption tunnel unstable. Ensure your API key is correctly configured in Vercel environment variables.";
  }
};

/**
 * Fast, accurate analysis for specific simulation data using the Flash model.
 */
export const analyzeSimulationData = async (mode: string, stateData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      ACT AS: A Senior Systems Analyst for Sig-Nexus-Pro.
      TASK: Perform a technical audit of the current ${mode} simulation state.
      DATA: ${JSON.stringify(stateData)}
      
      REQUIREMENTS:
      1. Provide a "Current Status" summary.
      2. Identify specific "Operational Risks" or inefficiencies.
      3. Give one "Optimization Protocol" (a specific, accurate recommendation).
      
      Return the results in a clean Markdown format. Be technically accurate based on the data provided.
    `;
    
    // simplified contents usage
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a high-speed diagnostic AI for the Sig-Nexus. Be accurate, concise, and technical.",
        temperature: 0.2, 
      },
    });

    // access text property directly
    return response.text || "Diagnostic stream interrupted. System nominal.";
  } catch (error) {
    console.error("Gemini Flash API Error:", error);
    return "Analysis failure: Data packet corrupted during quantization.";
  }
};
