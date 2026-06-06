import React from 'react'
import { ResponsiveContainer } from 'recharts'

const ChartCard = ({ title, children, height = 300, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
      {title && (<div className="mb-6"><h2 className="text-lg font-semibold">{title}</h2>{subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}</div>)}
      <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
    </div>
  )
}

export default ChartCard
