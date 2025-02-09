interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  conditions: {
    txCount?: number;
    totalValue?: string;
    timeframe?: number;
  };
}
