
import { Asset, AllocationResult } from '../types';

/**
 * Calculates how to distribute the monthly investment across assets.
 * Logic:
 * 1. Calculate current total value.
 * 2. Calculate projected total value (+ investment).
 * 3. Calculate target values per asset.
 * 4. Find positive gaps.
 * 5. Prioritize assets with lowest current weight relative to target.
 * 6. Allocate budget without exceeding gap or total investment.
 */
export const calculateRebalance = (
  assets: Asset[],
  investmentAmount: number
): AllocationResult[] => {
  const currentTotal = assets.reduce(
    (acc, asset) => acc + asset.quantity * asset.currentPrice,
    0
  );
  const newTotalExpected = currentTotal + investmentAmount;

  // Calculate stats for each asset
  const assetAnalysis = assets.map((asset) => {
    const currentValue = asset.quantity * asset.currentPrice;
    const targetValue = (newTotalExpected * asset.targetPercentage) / 100;
    const gap = targetValue - currentValue;
    const currentWeight = (currentValue / currentTotal) * 100;
    const weightDiff = currentWeight - asset.targetPercentage; // negative means underweight

    return {
      ...asset,
      currentValue,
      targetValue,
      gap,
      weightDiff,
    };
  });

  // Filter only assets with positive gap (need more investment)
  // Sort by weightDiff ascending: most underweight (most negative) comes first
  const underweightAssets = assetAnalysis
    .filter((a) => a.gap > 0)
    .sort((a, b) => a.weightDiff - b.weightDiff);

  let remainingBudget = investmentAmount;
  const results: AllocationResult[] = [];

  for (const asset of underweightAssets) {
    if (remainingBudget <= 0) break;

    const allocation = Math.min(remainingBudget, asset.gap);
    if (allocation > 0) {
      results.push({
        assetId: asset.id,
        assetName: asset.name,
        amountToInvest: allocation,
        quantityToBuy: allocation / asset.currentPrice,
        unit: asset.unit,
      });
      remainingBudget -= allocation;
    }
  }

  return results;
};
