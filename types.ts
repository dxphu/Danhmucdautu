
export interface Asset {
  id: string;
  name: string;
  quantity: number;
  currentPrice: number;
  targetPercentage: number;
  color: string;
  unit: string;
}

export interface AllocationResult {
  assetId: string;
  assetName: string;
  amountToInvest: number;
  quantityToBuy: number;
  unit: string;
}

export interface HistoryData {
  month: string;
  totalValue: number;
}
