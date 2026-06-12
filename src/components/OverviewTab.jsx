import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

/**
 * OverviewTab Component.
 * Props:
 * - kpiData: Array of KPI objects
 * - stats: Object containing trends data
 * - dynamicStats: Object containing calculated rates and distributions
 * - isLive: Boolean indicating Firebase connection state
 * - seedFirestoreDatabase: Function to populate database
 */
export default function OverviewTab({ kpiData, stats, dynamicStats, isLive, seedFirestoreDatabase }) {
  return (
    <>
      <div className="stats-grid">
        {kpiData.map((kpi, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-header">
              <span className="stat-title">{kpi.title}</span>
              <div className={`stat-icon-container ${kpi.colorClass}`}>
                {kpi.icon}
              </div>
            </div>
            <span className="stat-value">{kpi.value}</span>
            <div className="stat-footer">
              <span className="trend-up">{kpi.trend}</span>
              <span className="trend-label">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Daily Active Users & Match Rate (Weekly)</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={stats.dailyActiveTrend}>
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
                <Area type="monotone" dataKey="active" stroke="var(--secondary)" fillOpacity={1} fill="url(#activeGrad)" name="Active Sessions" />
                <Area type="monotone" dataKey="matches" stroke="var(--primary)" fillOpacity={1} fill="url(#matchGrad)" name="Matches Made" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Monthly Signups</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.registrationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'white' }} />
                <Legend />
                <Bar dataKey="free" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Free Users" />
                <Bar dataKey="premium" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Premium Tier" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Gender Distribution</span>
          </div>
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dynamicStats.genderDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dynamicStats.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '13px' }}>
            {dynamicStats.genderDistribution.map((entry, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color }}></span>
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Platform Developer Tools</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLive ? (
              <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)', alignItems: 'center' }}>
                <Database size={32} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Seed Full Datasets to Firestore</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>
                    Pre-populate the connected Firebase project with all application configurations, user matches profiles, active booking dates, virtual gift catalogs, transactions logs, and active stream channels.
                  </p>
                  <button className="btn-primary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '12px', width: 'fit-content' }} onClick={seedFirestoreDatabase}>
                    Seed Firestore Database
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
                <AlertTriangle size={24} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Simulated Sandbox Mode</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Add Firebase SDK environment variables in `.env` to pull configurations from the live database. Live streams and date bookings logs are currently generated locally.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
