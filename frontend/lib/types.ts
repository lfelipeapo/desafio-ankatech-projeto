export type Client = { id:number; name:string; email:string; is_active:boolean; created_at?:string; };
// A single allocation returned from the backend. Note that the API
// returns `quantity`, `purchase_price` and `purchase_date` fields
// instead of our previous `qty`, `buy_price` and `buy_date`. It also
// exposes current market data such as the current price, daily change
// percentage and cumulative profit percentage. We include an optional
// `ticker` field that will be populated on the frontend by looking
// up the corresponding asset.
export type Allocation = {
  id: number;
  client_id: number;
  asset_id: number;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  daily_change_pct?: number;
  profit_pct?: number;
  ticker?: string;
};

// A performance point for plotting the client’s cumulative return over
// time. The backend returns an array of points with the properties
// `date` and `cumulative_return`. We mirror that here.
export type PerformancePoint = {
  date: string;
  cumulative_return: number;
};