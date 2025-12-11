// src/components/CryptoOverview.jsx
import { useMemo } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { AgCharts } from "ag-charts-react";
import useSWR from "swr";
import { fetchCryptoPrices, fetchCryptoMarketChart } from "../../api/cryptoApi.js";

const CRYPTO_IDS = ["bitcoin", "ethereum", "dogecoin"];
const DISPLAY_NAMES = {
  bitcoin: "Bitcoin (BTC)",
  ethereum: "Ethereum (ETH)",
  dogecoin: "Dogecoin (DOGE)",
};

const priceFetcher = async () => {
  return await fetchCryptoPrices(CRYPTO_IDS, "usd");
};

const chartFetcher = async () => {
  return await fetchCryptoMarketChart("bitcoin", "usd", 30);
};

const formatUsd = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CryptoOverview() {
  const {
    data: prices,
    error: pricesError,
    isLoading: pricesLoading,
  } = useSWR("crypto-prices", priceFetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: chartDataRaw,
    error: chartError,
    isLoading: chartLoading,
  } = useSWR("crypto-btc-chart", chartFetcher, {
    revalidateOnFocus: false,
  });

  const chartOptions = useMemo(() => {
    if (!chartDataRaw?.prices?.length) return null;

    const data = chartDataRaw.prices.map(([timestamp, price]) => {
      const date = new Date(timestamp);
      return {
        dateLabel: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        price,
      };
    });

    return {
      theme: {
        baseTheme: "ag-default-dark",
        overrides: {
          common: {
            title: {
              color: "#e5e7eb",
            },
            subtitle: {
              color: "#9ca3af",
            },
            legend: {
              item: {
                label: { color: "#e5e7eb" },
              },
            },
          },
          cartesian: {
            axes: {
              category: {
                label: { color: "#e5e7eb" },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
                gridLine: { stroke: "#1f2933" },
              },
              number: {
                label: { color: "#e5e7eb" },
                line: { stroke: "#4b5563" },
                tick: { stroke: "#4b5563" },
                gridLine: { stroke: "#1f2933" },
              },
            },
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
        {
          type: "category",
          position: "bottom",
          title: { text: "Date" },
        },
        {
          type: "number",
          position: "left",
          title: { text: "Price (USD)" },
          label: {
            formatter: ({ value }) =>
              `$${Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}`,
          },
        },
      ],
      legend: { enabled: false },
      tooltip: {
        renderer: ({ datum }) => ({
          title: datum.dateLabel,
          content: formatUsd(datum.price),
        }),
      },
    };
  }, [chartDataRaw]);

  if (pricesLoading || chartLoading) {
    return <p>Loading crypto data…</p>;
  }

  if (pricesError || chartError) {
    console.error("Crypto error", pricesError || chartError);
    return (
      <p className="text-danger small">
        Failed to load crypto data. Please try again later.
      </p>
    );
  }

  if (!prices) {
    return (
      <p className="text-muted small">
        No crypto price data available at the moment.
      </p>
    );
  }

  return (
    <div>
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
                  <div className="small text-muted mb-1">
                    {DISPLAY_NAMES[id]}
                  </div>
                  <div className="h5 mb-1 text-surface">{formatUsd(price)}</div>
                  <div
                    className={
                      "small fw-semibold " +
                      (isUp ? "text-success" : "text-danger")
                    }
                  >
                    {isUp ? "▲" : "▼"} {change.toFixed(2)}%
                    <span className="text-muted fw-normal ms-1">
                      (24h change)
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {chartOptions ? (
        <Card className="shadow-sm border-0 dashboard-card fade-in-bck">
          <Card.Body>
            <AgCharts options={chartOptions} />
          </Card.Body>
        </Card>
      ) : (
        <p className="text-muted small mt-2">
          No historical chart data available.
        </p>
      )}
    </div>
  );
}
