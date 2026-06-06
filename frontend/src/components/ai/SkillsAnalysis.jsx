import React from 'react'

const SkillsAnalysis = ({ skills, matchScore, title = 'Skills Analysis' }) => {
  const matchedSkills = skills?.filter(s => s.matched) || []
  const missingSkills = skills?.filter(s => !s.matched) || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className="text-sm font-medium text-gray-500">Match: {matchScore}%</span>
      </div>
      
      <div className="space-y-3">
        {skills?.map((skill, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
              <span className={skill.matched ? 'text-green-600' : 'text-red-600'}>
                {skill.matched ? '✓' : '✗'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${skill.matched ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-full">
            ✓ Matched: {matchedSkills.length}
          </span>
          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-full">
            ✗ Missing: {missingSkills.length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SkillsAnalysis
