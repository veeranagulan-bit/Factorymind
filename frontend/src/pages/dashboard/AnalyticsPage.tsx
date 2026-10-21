import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const queryData = [
  { name: 'Mon', questions: 120 },
  { name: 'Tue', questions: 150 },
  { name: 'Wed', questions: 180 },
  { name: 'Thu', questions: 140 },
  { name: 'Fri', questions: 210 },
  { name: 'Sat', questions: 80 },
  { name: 'Sun', questions: 90 },
];

const topicData = [
  { name: 'Spindle Overheating', count: 400 },
  { name: 'Coolant Ratios', count: 300 },
  { name: 'Tool Wear Offsets', count: 250 },
  { name: 'Error E-402 Overload', count: 200 },
  { name: 'Preventive SOPs', count: 150 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">Analytics & Intelligence Metrics</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">Diagnostic query frequency, error resolutions, and knowledge retrieval metrics.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-black/[0.08] shadow-2xs">
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeRange === r 
                  ? 'bg-[#1a1a1a] text-white shadow-xs' 
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Queries Over Time */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] mb-6">Diagnostic Queries Volume</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="questions" stroke="#1a1a1a" strokeWidth={2.5} dot={{ r: 4, fill: '#9fff00', stroke: '#1a1a1a', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Asked Topics */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] mb-6">Common CNC Failure Inquiries</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={130} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1a1a1a', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#1a1a1a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
