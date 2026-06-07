import React from 'react'
import { Link } from 'react-router-dom'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'

const CareersHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CandidateNavbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Build your career at FutureHR. We're looking for passionate individuals to help us shape the future of HR technology.
          </p>
          <Link
            to="/careers/jobs"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            View Open Positions
          </Link>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why Join FutureHR?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🚀</span></div>
            <h3 className="text-xl font-semibold mb-2">Innovation First</h3>
            <p className="text-gray-600 dark:text-gray-400">Work with cutting-edge AI technology and modern tech stack</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">📈</span></div>
            <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
            <p className="text-gray-600 dark:text-gray-400">Continuous learning and career advancement programs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">💪</span></div>
            <h3 className="text-xl font-semibold mb-2">Great Culture</h3>
            <p className="text-gray-600 dark:text-gray-400">Collaborative environment with work-life balance</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Integrity', 'Innovation', 'Collaboration', 'Excellence'].map(value => (
              <div key={value} className="text-center p-4"><div className="text-4xl mb-3">✓</div><p className="font-semibold text-gray-900 dark:text-white">{value}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Make an Impact?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Browse our open positions and find your perfect role</p>
        <Link to="/careers/jobs" className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">Explore Jobs</Link>
      </div>
    </div>
  )
}

export default CareersHome
