"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Pie, PieChart } from "recharts"
import '../global.css'

const SmallerPieChartComponent = ({ ipedsId, myColleges }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          chartData.push({ name: 'Need Aid; ', value: needAid, fill: '#DABFFF' });
        }
        if (meritAid > 0) {
          chartData.push({ name: 'Merit Aid: ', value: meritAid, fill: '#4F518C' });
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
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="small-pie-chart-container">
      <PieChart width={40} height={30}>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={8} outerRadius={14} />
      </PieChart>
    </div>
  )
}

export default SmallerPieChartComponent
