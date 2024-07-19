"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Label, Pie, PieChart } from "recharts"
import '../global.css'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart"

const PieChartComponent = ({ ipedsId, myColleges }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myPrice, setMyPrice] = useState(0)
  const [outOfState, setOutOfState] = useState(0)


  useEffect(() => {
    const fetchData = () => {
      try {
        const schoolData = myColleges[ipedsId]
        if (schoolData) {
          calculatePieChartData(schoolData)
        } else {
          setError("No data found for the selected school.")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching school data:", err)
        setError("Failed to fetch school data.")
        setLoading(false)
      }
    }

    fetchData()
  }, [ipedsId, myColleges])

  const calculatePieChartData = (schoolData) => {
    const outOfStatePriceStr = schoolData['Total price for out-of-state students 2022-23'] || "";
    const myPriceStr = schoolData.myPrice || "";
    const myPriceNeedStr = schoolData.myPrice_need || "";

    const outOfStatePrice = parseFloat(outOfStatePriceStr.replace(/[^0-9.-]+/g, "")) || 0;
    const myPrice = parseFloat(myPriceStr.replace(/[^0-9.-]+/g, "")) || NaN;
    const myPriceNeed = parseFloat(myPriceNeedStr.replace(/[^0-9.-]+/g, "")) || NaN;

    const chartData = [];

    if (isNaN(outOfStatePrice) && outOfStatePrice > 0) {
      chartData.push({ name: 'Out of State ', value: outOfStatePrice, fill: '#DABFFF' });
    }

    if (!isNaN(myPrice) && !isNaN(myPriceNeed)) {
      const meritAid = myPriceNeed - myPrice;
      const needAid = outOfStatePrice - myPriceNeed;

      if (myPrice === outOfStatePrice) {
        chartData.push({ name: 'Estimated Net Price: ', value: myPrice, fill: '#2C2A4A' });
      } else {
        chartData.push({ name: 'Estimated Net Price: ', value: myPrice, fill: '#2C2A4A' });
        if (needAid > 0) {
          chartData.push({ name: 'Need Aid; ', value: needAid, fill: '#DABFFF'});
        }
        if (meritAid > 0) {
          chartData.push({ name: 'Merit Aid: ', value: meritAid, fill: '#907AD6' });
        }
      }
    } else if (!isNaN(myPrice)) {
      chartData.push({ name: 'Estimated Net Price: ', value: myPrice, fill: '#2C2A4A' });
    } else if (!isNaN(myPriceNeed)) {
      const needAid = myPriceNeed - outOfStatePrice;
      chartData.push({ name: 'My Price Need: ', value: myPriceNeed, fill: '#DABFFF' });
      if (needAid > 0) {
        chartData.push({ name: 'Need Aid: ', value: needAid, fill: '#DABFFF' });
      }
    }

    setChartData(chartData);
    setMyPrice(myPrice);
    setOutOfState(outOfStatePrice);
    setLoading(false);
    
  }

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
   
        <CardDescription>Cost breakdown for the selected school.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer className="mx-auto aspect-square max-h-[250px]" config={{ styles: chartData.length ? chartData : {} }}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                          style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                        >
                          ${myPrice.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          My Est. Cost
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
        Out-of-State Cost: ${outOfState.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  )
}

export default PieChartComponent
