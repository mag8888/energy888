// Заглушка для marketCards модуля
export class MarketDeckManager {
  constructor() {
    this.cards = [];
  }
  
  drawCard() {
    return {
      id: 'mock-card',
      name: 'Mock Market Card',
      type: 'stock',
      cost: 100,
      symbol: 'MOCK'
    };
  }
}

export const checkPlayerHasMatchingAsset = (playerAssets, card) => {
  return playerAssets.some(asset => 
    asset.type === card.type && asset.symbol === card.symbol
  );
};
