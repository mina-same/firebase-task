/**
 * ScoreChart Component
 * 
 * Displays a real-time pie chart showing the distribution of feedback scores
 * Uses Recharts library for visualization
 * 
 * @component
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SCORE_CONFIG } from '../../../config/constants';
import Loading from '../../common/Loading';
import './ScoreChart.module.css';

/**
 * Color palette matching table headers (Date, Employee, Score, Notes)
 */
const CHART_COLORS = {
  1: '#3B82F6', // blue-500 (Date)
  2: '#A855F7', // purple-500 (Employee)
  3: '#F59E0B', // amber-500 (Score)
  4: '#10B981', // green-500 (Notes)
  5: '#6366F1', // indigo-500 (5th score)
};

/**
 * Score distribution pie chart component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.scoreDistribution - Score distribution data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.title - Chart title
 * @returns {JSX.Element} ScoreChart component
 */
const ScoreChart = ({ scoreDistribution = {}, loading = false, title = 'Score Distribution' }) => {

  /**
   * Transforms score distribution data for the pie chart
   * Converts { 1: 5, 2: 10, ... } to [{ name: '1 Star', value: 5, color: '#...' }, ...]
   */
  const chartData = useMemo(() => {
    return Object.entries(scoreDistribution)
      .map(([score, count]) => ({
        name: `${score} ${score === '1' ? 'Star' : 'Stars'}`,
        value: count,
        score: parseInt(score, 10),
        color: CHART_COLORS[score],
        label: SCORE_CONFIG.LABELS[score],
      }))
      .filter((item) => item.value > 0); // Only show scores that have data
  }, [scoreDistribution]);
  
  /**
   * Calculates total number of feedback entries
   */
  const totalFeedback = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);
  
  /**
   * Calculates average score
   */
  const averageScore = useMemo(() => {
    if (totalFeedback === 0) return 0;
    const totalScore = chartData.reduce((sum, item) => sum + (item.score * item.value), 0);
    return (totalScore / totalFeedback).toFixed(2);
  }, [chartData, totalFeedback]);
  
  /**
   * Custom label renderer for pie chart
   */
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    // Position label in the middle of the donut ring
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant (>5%)
    if (percent < 0.05) return null;
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-bold"
        style={{ pointerEvents: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  /**
   * Custom tooltip renderer
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalFeedback) * 100).toFixed(1);
      
      return (
        <div className="bg-white px-5 py-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-bold text-gray-900 text-base">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">{data.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{data.value}</span>
            <span className="text-sm text-gray-500">responses</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">
              {percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="flex justify-center items-center h-80">
          <Loading size="lg" message="Loading chart data..." />
        </div>
      </div>
    );
  }
  
  // No data state
  if (chartData.length === 0 || totalFeedback === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="flex flex-col justify-center items-center h-80 text-center px-6">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Data</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            There is no feedback data available yet. The chart will appear here once feedback is submitted.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-2 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {title}
        </h2>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        
        {/* Left: Chart Section */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={140}
                innerRadius={90}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
                animationDuration={800}
                animationBegin={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Right: Stats & Breakdown */}
        <div className="space-y-3">
          
          {/* Summary Stats */}
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore} <span className="text-base text-gray-500">/ 5</span></p>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Score Distribution Bars */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Distribution</h3>
            {[5, 4, 3, 2, 1].map((score) => {
              const count = scoreDistribution[score] || 0;
              const percentage = totalFeedback > 0 ? ((count / totalFeedback) * 100) : 0;
              
              return (
                <div key={score} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{score}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${i < score ? 'text-gray-800' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: CHART_COLORS[score] || '#9CA3AF',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Prop types for type checking
ScoreChart.propTypes = {
  scoreDistribution: PropTypes.object,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

export default ScoreChart;

