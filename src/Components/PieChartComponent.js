"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Label, Pie, PieChart } from "recharts"
import '../global.css'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart"
import { Lock } from "lucide-react"; // Lock icon import

const PieChartComponent = ({ ipedsId, myColleges, visibleColleges }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myPrice, setMyPrice] = useState(0);
  const [outOfState, setOutOfState] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      try {
        const schoolData = myColleges[ipedsId];
        if (schoolData) {
          calculatePieChartData(schoolData);
        } else {
          setError("No data found for the selected school.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError("Failed to fetch school data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [ipedsId, myColleges]);

  const calculatePieChartData = (schoolData) => {
    const outOfStatePriceStr = schoolData['Total price for out-of-state students 2022-23'] || "";

    const outOfStatePrice = parseFloat(outOfStatePriceStr.replace(/[^0-9.-]+/g, "")) || 0;

    const isCollegeVisible = visibleColleges.includes(Number(ipedsId));
    let chartData = [];

    if (isCollegeVisible) {
      // Logic for visible colleges (full breakdown)
      const myPriceStr = schoolData.myPrice || "";
      const myPriceNeedStr = schoolData.myPrice_need || "";
      const myPrice = parseFloat(myPriceStr.replace(/[^0-9.-]+/g, "")) || NaN;
      const myPriceNeed = parseFloat(myPriceNeedStr.replace(/[^0-9.-]+/g, "")) || NaN;

      if (!isNaN(myPrice) && !isNaN(myPriceNeed)) {
        const meritAid = myPriceNeed - myPrice;
        const needAid = outOfStatePrice - myPriceNeed;

        if (myPrice === outOfStatePrice) {
          chartData.push({ name: 'Estimated Net Price', value: myPrice, fill: '#2C2A4A' });
        } else {
          chartData.push({ name: 'Estimated Net Price', value: myPrice, fill: '#2C2A4A' });
          if (needAid > 0) {
            chartData.push({ name: 'Need Aid', value: needAid, fill: '#DABFFF' });
          }
          if (meritAid > 0) {
            chartData.push({ name: 'Merit Aid', value: meritAid, fill: '#907AD6' });
          }
        }
      } else if (!isNaN(myPrice)) {
        chartData.push({ name: 'Estimated Net Price', value: myPrice, fill: '#2C2A4A' });
      } else if (!isNaN(myPriceNeed)) {
        const needAid = myPriceNeed - outOfStatePrice;
        chartData.push({ name: 'My Price Need', value: myPriceNeed, fill: '#DABFFF' });
        if (needAid > 0) {
          chartData.push({ name: 'Need Aid', value: needAid, fill: '#DABFFF' });
        }
      }
      setMyPrice(myPrice);
    } else {
      // Logic for non-visible colleges (single segment)
      chartData = [{ name: 'Estimated Net Price', value: outOfStatePrice, fill: '#2C2A4A' }];
      setMyPrice(outOfStatePrice);
    }

    setChartData(chartData);
    setOutOfState(outOfStatePrice);
    setLoading(false);
  };

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const isCollegeVisible = visibleColleges.includes(Number(ipedsId));

  return (
    <Card className="flex flex-col no-outline">
      <CardHeader className="items-center pb-0">
        <CardTitle>Financial Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={{ styles: chartData.length ? chartData : {} }}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                          ${myPrice.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground" fontSize="10" >
                          Estimated Net Cost
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {!isCollegeVisible && (
          <div className="flex flex-col items-center">
            <Lock className="w-6 h-6 text-muted" />
            <p className="text-muted-foreground text-sm mt-2">Upgrade to unlock your financial breakdown</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Out-of-State Cost: ${outOfState.toLocaleString()}</div>
      </CardFooter>
    </Card>
  );
};

export default PieChartComponent;
