
import { CONFIG } from "../config";
import { Asset } from "../types";

const { URL, ANON_KEY } = CONFIG.SUPABASE;
const TABLE_NAME = 'assets';

/**
 * Service xử lý lưu trữ dữ liệu lên Supabase.
 * Chuyển đổi giữa snake_case (DB) và camelCase (App).
 */
export const supabaseService = {
  /**
   * Lấy danh sách tài sản từ Supabase
   */
  async getAssets(): Promise<Asset[] | null> {
    try {
      const response = await fetch(`${URL}/rest/v1/${TABLE_NAME}?select=*`, {
        method: 'GET',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      
      // Map từ DB (snake_case) sang App (camelCase)
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: parseFloat(item.quantity),
        currentPrice: parseFloat(item.current_price),
        targetPercentage: parseFloat(item.target_percentage),
        color: item.color,
        unit: item.unit
      }));
    } catch (error) {
      console.error("Lỗi khi fetch Supabase:", error);
      return null;
    }
  },

  /**
   * Lưu hoặc cập nhật toàn bộ danh mục tài sản
   */
  async saveAssets(assets: Asset[]): Promise<boolean> {
    try {
      // Map từ App (camelCase) sang DB (snake_case)
      const dbData = assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        quantity: asset.quantity,
        current_price: asset.currentPrice,
        target_percentage: asset.targetPercentage,
        color: asset.color,
        unit: asset.unit
      }));

      const response = await fetch(`${URL}/rest/v1/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbData)
      });
      
      return response.ok;
    } catch (error) {
      console.error("Lỗi khi lưu Supabase:", error);
      return false;
    }
  }
};
