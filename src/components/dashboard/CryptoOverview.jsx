import { useMemo } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { AgCharts } from "ag-charts-react";
import useSWR from "swr";
import { fetchCryptoPrices, fetchCryptoMarketChart } from "../../api/cryptoApi.js";

// Crypto IDs and display names
const CRYPTO_IDS = ["bitcoin", "ethereum", "dogecoin"];
const DISPLAY_NAMES = {
  bitcoin: "Bitcoin (BTC)",
  ethereum: "Ethereum (ETH)",
  dogecoin: "Dogecoin (DOGE)",
};

// SWR fetchers
const priceFetcher = async () => await fetchCryptoPrices(CRYPTO_IDS, "usd");
const chartFetcher = async () => await fetchCryptoMarketChart("bitcoin", "usd", 30);

// Helper to format USD
const formatUsd = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CryptoOverview() {
  // Fetch current prices
  const { data: prices, error: pricesError, isLoading: pricesLoading } = useSWR("crypto-prices", priceFetcher, {
    revalidateOnFocus: false,
  });

  // Fetch Bitcoin chart (last 30 days)
  const { data: chartDataRaw, error: chartError, isLoading: chartLoading } = useSWR("crypto-btc-chart", chartFetcher, {
    revalidateOnFocus: false,
  });

  // Prepare chart options
  const chartOptions = useMemo(() => {
    if (!chartDataRaw?.prices?.length) return null;

    const data = chartDataRaw.prices.map(([timestamp, price]) => {
      const date = new Date(timestamp);
      return {
        dateLabel: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        price,
      };
    });

    return {
      theme: {
        baseTheme: "ag-default-dark",
        overrides: {
          common: {
            title: { color: "#e5e7eb" },
            subtitle: { color: "#9ca3af" },
            legend: { item: { label: { color: "#e5e7eb" } } },
          },
        },
      },
      background: { fill: "#020617" },
      title: { text: "Bitcoin (BTC) - Last 30 Days" },
      subtitle: { text: "Powered by CoinGecko" },
      data,
      series: [
        {
          type: "line",
          xKey: "dateLabel",
          yKey: "price",
          yName: "Price (USD)",
          stroke: "#22c55e",
          marker: { size: 4 },
        },
      ],
      axes: [
        { type: "category", position: "bottom", title: { text: "Date" } },
        {
          type: "number",
          position: "left",
          title: { text: "Price (USD)" },
          label: {
            formatter: ({ value }) =>
              `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          },
        },
      ],
      legend: { enabled: false },
    };
  }, [chartDataRaw]);

  // Loading / error states
  if (pricesLoading || chartLoading) return <p>Loading crypto data…</p>;
  if (pricesError || chartError) {
    console.error("Crypto error", pricesError || chartError);
    return <p className="text-danger small">Failed to load crypto data. Please try again later.</p>;
  }
  if (!prices) return <p className="text-muted small">No crypto price data available at the moment.</p>;

  return (
    <div>
      {/* Price cards */}
      <Row className="mb-3">
        {CRYPTO_IDS.map((id) => {
          const info = prices[id];
          if (!info) return null;

          const price = info.usd;
          const change = info.usd_24h_change ?? 0;
          const isUp = change >= 0;

          return (
            <Col md={4} key={id} className="mb-3">
              <Card className="shadow-sm border-0 dashboard-card h-100 fade-in-bck">
                <Card.Body>
                  <div className="small text-muted mb-1">{DISPLAY_NAMES[id]}</div>
                  <div className="h5 mb-1 text-surface">{formatUsd(price)}</div>
                  <div className={"small fw-semibold " + (isUp ? "text-success" : "text-danger")}>
                    {isUp ? "▲" : "▼"} {change.toFixed(2)}%
                    <span className="text-muted fw-normal ms-1">(24h change)</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Bitcoin chart */}
      {chartOptions ? (
        <Card className="shadow-sm border-0 dashboard-card fade-in-bck">
          <Card.Body>
            <AgCharts options={chartOptions} />
          </Card.Body>
        </Card>
      ) : (
        <p className="text-muted small mt-2">No historical chart data available.</p>
      )}
    </div>
  );
}