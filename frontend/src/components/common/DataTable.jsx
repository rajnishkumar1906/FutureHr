import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner.jsx'
import EmptyState from './EmptyState.jsx'

const DataTable = ({ columns, data, onRowClick, loading, searchable = false, onSearch, pagination = false, pageSize = 10, title }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (onSearch) onSearch(value)
  }

  const getFilteredData = () => {
    if (!searchTerm || onSearch) return data
    return data.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())))
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = pagination ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : filteredData

  if (loading) return <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">Loading...</div>
  if (!data || data.length === 0) return <EmptyState />

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700"><tr>{columns.map((col, idx) => (<th key={idx} className="px-6 py-4 text-left text-sm font-semibold">{col.header}</th>))}</tr></thead>
          <tbody>{paginatedData.map((row, rowIdx) => (<tr key={rowIdx} onClick={() => onRowClick?.(row)} className="hover:bg-gray-50 cursor-pointer">{columns.map((col, colIdx) => (<td key={colIdx} className="px-6 py-4">{col.render ? col.render(row[col.accessor], row) : row[col.accessor]}</td>))}</tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
