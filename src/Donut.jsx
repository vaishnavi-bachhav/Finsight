import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { getDonutData } from "./data/data";

export default function Donut() {
  const [options, _] = useState({
    data: getDonutData(),
    title: {
      text: "Portfolio Composition",
    },
    series: [
      {
        type: "donut",
        calloutLabelKey: "asset",
        angleKey: "amount",
      },
    ],
  });

  return <AgCharts options={options} />;
};