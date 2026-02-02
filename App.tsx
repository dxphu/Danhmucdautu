
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_ASSETS, MOCK_HISTORY } from './constants';
import { CONFIG } from './config';
import { Asset, AllocationResult } from './types';
import { calculateRebalance } from './services/rebalanceService';
import { AssetPieChart, GrowthChart } from './components/Charts';
import { fetchRealtimePrices, PriceUpdate } from './services/aiService';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<PriceUpdate | null>(null);
  
  const [goldPriceInput, setGoldPriceInput] = useState<string>('8200000');
  const [usdtPriceInput, setUsdtPriceInput] = useState<string>('25450');
  const [allocationResults, setAllocationResults] = useState<AllocationResult[] | null>(null);

  // Khởi tạo: Ưu tiên lấy từ Supabase
  useEffect(() => {
    const initData = async () => {
      setIsSyncing(true);
      const cloudData = await supabaseService.getAssets();
      if (cloudData) {
        setAssets(cloudData);
      } else {
        const localData = localStorage.getItem(CONFIG.APP.STORAGE_KEY);
        if (localData) setAssets(JSON.parse(localData));
      }
      setIsSyncing(false);
    };
    initData();
  }, []);

  const handleSaveData = async (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem(CONFIG.APP.STORAGE_KEY, JSON.stringify(newAssets));
    setIsSyncing(true);
    await supabaseService.saveAssets(newAssets);
    setIsSyncing(false);
  };

  const totalValue = useMemo(() => {
    return assets.reduce((acc, asset) => acc + asset.quantity * asset.currentPrice, 0);
  }, [assets]);

  const totalTargetPercent = useMemo(() => {
    return assets.reduce((acc, asset) => acc + asset.targetPercentage, 0);
  }, [assets]);

  const handleAutoUpdate = async () => {
    setIsFetching(true);
    try {
      const data = await fetchRealtimePrices();
      setGoldPriceInput(data.gold.toString());
      setUsdtPriceInput(data.usdt.toString());
      setLastUpdate(data);
      
      const updatedAssets = assets.map(asset => {
        if (asset.id === 'gold') return { ...asset, currentPrice: data.gold };
        if (asset.id === 'usdt') return { ...asset, currentPrice: data.usdt };
        return asset;
      });
      
      setAssets(updatedAssets);
      const results = calculateRebalance(updatedAssets, CONFIG.APP.MONTHLY_INVESTMENT);
      setAllocationResults(results);
    } catch (error) {
      alert("Lỗi lấy giá từ AI.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleCalculate = () => {
    const updatedAssets = assets.map(asset => {
      if (asset.id === 'gold') return { ...asset, currentPrice: parseFloat(goldPriceInput) || 0 };
      if (asset.id === 'usdt') return { ...asset, currentPrice: parseFloat(usdtPriceInput) || 0 };
      return asset;
    });
    
    setAssets(updatedAssets);
    const results = calculateRebalance(updatedAssets, CONFIG.APP.MONTHLY_INVESTMENT);
    setAllocationResults(results);
    
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(CONFIG.APP.LOCALES, {
      style: 'currency',
      currency: CONFIG.APP.CURRENCY,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 max-w-5xl mx-auto font-sans">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
            {isSyncing ? 'Đang đồng bộ Cloud...' : 'Đã kết nối Supabase'}
          </span>
        </div>
        <button 
          onClick={() => handleSaveData(assets)}
          className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1 rounded text-zinc-400"
        >
          Lưu thủ công
        </button>
      </div>

      <header className="mb-12 text-center">
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-3">Tổng giá trị danh mục</p>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
          {formatCurrency(totalValue)}
        </h1>
        <div className="flex justify-center gap-3">
          <button 
            onClick={handleAutoUpdate}
            disabled={isFetching}
            className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm transition-all flex items-center gap-2"
          >
            {isFetching ? '...' : '⚡ Cập nhật giá AI'}
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-semibold"
          >
            {isEditing ? 'Đóng cài đặt' : 'Cấu hình 30/30/30'}
          </button>
        </div>
      </header>

      {isEditing && (
        <section className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl mb-10 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6">Điều chỉnh mục tiêu tài sản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="p-4 bg-black/40 rounded-2xl border border-zinc-800">
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-zinc-100">{asset.name}</span>
                  <span className="text-xs text-zinc-500 italic">{formatCurrency(asset.quantity * asset.currentPrice)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Số lượng ({asset.unit})</label>
                    <input 
                      type="number"
                      value={asset.quantity}
                      onChange={(e) => {
                        const newAssets = assets.map(a => a.id === asset.id ? {...a, quantity: parseFloat(e.target.value) || 0} : a);
                        setAssets(newAssets);
                      }}
                      className="w-full bg-zinc-800 border-none rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Mục tiêu (%)</label>
                    <input 
                      type="number"
                      value={asset.targetPercentage}
                      onChange={(e) => {
                        const newAssets = assets.map(a => a.id === asset.id ? {...a, targetPercentage: parseFloat(e.target.value) || 0} : a);
                        setAssets(newAssets);
                      }}
                      className="w-full bg-zinc-800 border-none rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-6">
             <p className={`text-sm ${totalTargetPercent === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
               Tổng tỷ trọng: {totalTargetPercent}%
             </p>
             <button 
              onClick={() => handleSaveData(assets)}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm"
             >
               Lưu cấu hình
             </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-zinc-400 uppercase mb-6 tracking-widest">Phân bổ hiện tại</h3>
          <AssetPieChart assets={assets} />
          <div className="mt-6 space-y-2">
            {assets.map(a => {
              const weight = ((a.quantity * a.currentPrice) / totalValue * 100).toFixed(1);
              return (
                <div key={a.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: a.color}}></div>
                    <span className="text-zinc-400">{a.name}</span>
                  </div>
                  <div className="font-mono">
                    <span className="text-white">{weight}%</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-zinc-500">{a.targetPercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Dòng tiền mới</h3>
              <p className="text-3xl font-black text-emerald-400">{formatCurrency(CONFIG.APP.MONTHLY_INVESTMENT)}</p>
            </div>
            <div className="text-right">
               <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Chiến lược</h3>
               <p className="text-lg font-bold text-white italic">Rebalance 30/30/30</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
              <label className="text-[10px] text-zinc-500 uppercase block mb-2">Giá Vàng DOJI</label>
              <input 
                type="number"
                value={goldPriceInput}
                onChange={(e) => setGoldPriceInput(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-emerald-400 outline-none"
              />
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
              <label className="text-[10px] text-zinc-500 uppercase block mb-2">Giá USDT Binance</label>
              <input 
                type="number"
                value={usdtPriceInput}
                onChange={(e) => setUsdtPriceInput(e.target.value)}
                className="w-full bg-transparent text-xl font-bold text-blue-400 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-black font-black rounded-2xl text-lg shadow-2xl shadow-emerald-500/10 transition-all active:scale-95"
          >
            TÍNH PHÂN BỔ 40 TRIỆU
          </button>
        </div>
      </div>

      <div id="results-section">
        {allocationResults && (
          <section className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-3xl mb-12 shadow-2xl shadow-emerald-500/5 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">LỜI KHUYÊN MUA THÁNG NÀY</h2>
            </div>
            
            <div className="space-y-4">
              {allocationResults.map((result) => (
                <div key={result.assetId} className="group relative bg-zinc-800/30 border border-zinc-800 hover:border-emerald-500/30 p-6 rounded-2xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{result.assetName}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-bold">THẤP HƠN MỤC TIÊU</span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-100 italic">
                        {result.assetId === 'gold' || result.assetId === 'usdt' 
                          ? `Mua thêm ${result.quantityToBuy.toFixed(3)} ${result.unit}`
                          : `Nạp ${formatCurrency(result.amountToInvest)} vào ${result.assetName}`}
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-500 uppercase font-bold text-center mb-1 tracking-tighter">Số tiền nạp</p>
                      <p className="text-2xl font-black text-emerald-400">{formatCurrency(result.amountToInvest)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 leading-relaxed italic">
                * Thuật toán Rebalance ưu tiên lấp đầy các "khoảng trống" (Gap) lớn nhất để đưa danh mục về tỷ lệ 30/30/30 nhanh nhất mà không cần bán bớt tài sản hiện có.
              </p>
            </div>
          </section>
        )}
      </div>

      <section className="mb-12">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Tăng trưởng tài sản</h3>
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl">
          <GrowthChart history={MOCK_HISTORY} />
        </div>
      </section>

      {lastUpdate && (
        <div className="fixed bottom-4 right-4 max-w-xs bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full">
           <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Thông tin tham khảo</p>
           {lastUpdate.sources.slice(0, 1).map((src, i) => (
             <a key={i} href={src.uri} target="_blank" className="text-[10px] text-blue-400 block truncate hover:underline">
               🔗 {src.title}
             </a>
           ))}
        </div>
      )}
    </div>
  );
};

export default App;
