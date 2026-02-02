
import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "../config";

export interface PriceUpdate {
  gold: number;
  usdt: number;
  sources: { title: string; uri: string }[];
}

export const fetchRealtimePrices = async (): Promise<PriceUpdate> => {
  // Khởi tạo AI instance ngay tại thời điểm gọi để đảm bảo lấy đúng API Key từ môi trường
  const ai = new GoogleGenAI({ apiKey: CONFIG.GEMINI.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: "Lấy giá vàng DOJI hôm nay (VND/chỉ) và giá USDT/VND trên Binance P2P hiện tại. Chỉ trả về kết quả dạng JSON đơn giản: { \"gold\": number, \"usdt\": number }. Đảm bảo giá vàng tính theo đơn vị 'chỉ' (thường bằng 1/10 lượng).",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: CONFIG.GEMINI.SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Nguồn dữ liệu",
        uri: chunk.web?.uri || "#"
      })) || [];

    // Trích xuất JSON từ text của AI
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        gold: data.gold,
        usdt: data.usdt,
        sources: sources
      };
    }

    throw new Error("Không thể phân tích dữ liệu từ AI");
  } catch (error) {
    console.error("Lỗi khi lấy giá realtime:", error);
    throw error;
  }
};
