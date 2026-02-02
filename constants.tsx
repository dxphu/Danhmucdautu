
import { Asset, HistoryData } from './types';

// Thiết lập tỷ lệ 30/30/30 cho 3 kênh chính, 10% còn lại cho dự phòng
export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'gold',
    name: 'Vàng DOJI',
    quantity: 5.5,
    currentPrice: 8200000,
    targetPercentage: 30,
    color: '#fbbf24',
    unit: 'Chỉ'
  },
  {
    id: 'usdt',
    name: 'USDT Binance',
    quantity: 1200,
    currentPrice: 25450,
    targetPercentage: 30,
    color: '#10b981',
    unit: 'USDT'
  },
  {
    id: 'onelong',
    name: '1Long',
    quantity: 50000000,
    currentPrice: 1,
    targetPercentage: 30,
    color: '#3b82f6',
    unit: 'VND'
  },
  {
    id: 'reserve',
    name: 'Dự phòng',
    quantity: 20000000,
    currentPrice: 1,
    targetPercentage: 10,
    color: '#71717a',
    unit: 'VND'
  }
];

export const MOCK_HISTORY: HistoryData[] = [
  { month: 'T1', totalValue: 280000000 },
  { month: 'T2', totalValue: 295000000 },
  { month: 'T3', totalValue: 310000000 },
  { month: 'T4', totalValue: 335000000 },
  { month: 'T5', totalValue: 360000000 },
  { month: 'T6', totalValue: 390000000 },
];
