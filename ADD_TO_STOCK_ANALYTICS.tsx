// ========================================
// ADD THIS SECTION TO StockMovementAnalytics.tsx
// Insert AFTER the stats cards (around line 300)
// BEFORE the Filters section
// ========================================

// First, add these calculations to the calculateStats function (or create new useEffect):

useEffect(() => {
  if (filteredMovements.length === 0) return

  // Room Performance Analysis
  const roomData = Object.entries(
    filteredMovements.reduce((acc, m) => {
      const room = m.room_name || 'Unknown'
      if (!acc[room]) acc[room] = { in: 0, out: 0 }
      if (m.movement_type === 'IN') acc[room].in += m.quantity
      else acc[room].out += m.quantity
      return acc
    }, {} as Record<string, { in: number; out: number }>)
  ).map(([name, data]) => ({
    name,
    in: data.in,
    out: data.out,
    net: data.in - data.out,
    total: data.in + data.out
  })).sort((a, b) => b.total - a.total).slice(0, 10)

  setRoomAnalytics(roomData)

  // Staff Performance Analysis
  const staffData = Object.entries(
    filteredMovements.reduce((acc, m) => {
      if (!acc[m.user_name]) acc[m.user_name] = { movements: 0, quantity: 0 }
      acc[m.user_name].movements++
      acc[m.user_name].quantity += m.quantity
      return acc
    }, {} as Record<string, { movements: number; quantity: number }>)
  ).map(([name, data]) => ({
    name,
    movements: data.movements,
    quantity: data.quantity,
    avg: data.quantity / data.movements
  })).sort((a, b) => b.movements - a.movements)

  setStaffAnalytics(staffData)

  // Top Items by Velocity
  const itemData = Object.entries(
    filteredMovements.reduce((acc, m) => {
      if (!acc[m.item_brand]) acc[m.item_brand] = { in: 0, out: 0, count: 0 }
      if (m.movement_type === 'IN') acc[m.item_brand].in += m.quantity
      else acc[m.item_brand].out += m.quantity
      acc[m.item_brand].count++
      return acc
    }, {} as Record<string, { in: number; out: number; count: number }>)
  ).map(([name, data]) => ({
    name,
    in: data.in,
    out: data.out,
    velocity: data.count,
    turnover: data.out / (data.in || 1)
  })).sort((a, b) => b.velocity - a.velocity).slice(0, 10)

  setItemAnalytics(itemData)

  // Daily Trend (Last 7 days)
  const dailyData: any[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayMovements = filteredMovements.filter(m =>
      m.created_at.startsWith(dateStr)
    )

    dailyData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      in: dayMovements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
      out: dayMovements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
      movements: dayMovements.length
    })
  }

  setDailyTrend(dailyData)

  // Peak Hours
  const hourCounts = filteredMovements.reduce((acc, m) => {
    const hour = new Date(m.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const peakData = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  setPeakHours(peakData)

}, [filteredMovements])

// ========================================
// Add these state variables at the top:
// ========================================

const [roomAnalytics, setRoomAnalytics] = useState<any[]>([])
const [staffAnalytics, setStaffAnalytics] = useState<any[]>([])
const [itemAnalytics, setItemAnalytics] = useState<any[]>([])
const [dailyTrend, setDailyTrend] = useState<any[]>([])
const [peakHours, setPeakHours] = useState<any[]>([])

// ========================================
// JSX: INSERT THIS AFTER THE STATS CARDS
// ========================================

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">7-Day Trend Analysis</h3>
          </div>

          <div className="space-y-4">
            {dailyTrend.map((day, idx) => {
              const maxValue = Math.max(...dailyTrend.map(d => Math.max(d.in, d.out)))
              const inWidth = (day.in / maxValue) * 100
              const outWidth = (day.out / maxValue) * 100

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 w-32">{day.date}</span>
                    <span className="text-xs text-gray-500">{day.movements} movements</span>
                  </div>
                  <div className="space-y-1">
                    {/* IN Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 w-12">IN</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${inWidth}%` }}
                        >
                          {day.in > 0 && (
                            <span className="text-xs font-bold text-white">{day.in}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* OUT Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 w-12">OUT</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${outWidth}%` }}
                        >
                          {day.out > 0 && (
                            <span className="text-xs font-bold text-white">{day.out}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Room Performance */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Room Performance</h3>
          </div>

          <div className="space-y-3">
            {roomAnalytics.slice(0, 5).map((room, idx) => {
              const maxTotal = Math.max(...roomAnalytics.map(r => r.total))
              const widthPercent = (room.total / maxTotal) * 100

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{room.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-600">↑{room.in}</span>
                      <span className="text-red-600">↓{room.out}</span>
                      <span className={`font-bold ${room.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {room.net >= 0 ? '+' : ''}{room.net}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {roomAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-8">No room data available</p>
          )}
        </div>

        {/* Staff Productivity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Staff Productivity</h3>
          </div>

          <div className="space-y-4">
            {staffAnalytics.map((staff, idx) => {
              const maxMovements = Math.max(...staffAnalytics.map(s => s.movements))
              const widthPercent = (staff.movements / maxMovements) * 100

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                      <span className="font-medium text-gray-700 text-sm">{staff.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{staff.movements}</div>
                      <div className="text-xs text-gray-500">{staff.quantity} units</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: {staff.avg.toFixed(1)} units per movement
                  </div>
                </div>
              )
            })}
          </div>

          {staffAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-8">No staff data available</p>
          )}
        </div>

        {/* Top Items by Velocity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">High-Velocity Items</h3>
          </div>

          <div className="space-y-3">
            {itemAnalytics.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      {item.in}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      {item.out}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{item.velocity}</div>
                  <div className="text-xs text-gray-500">movements</div>
                </div>
              </div>
            ))}
          </div>

          {itemAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-8">No item data available</p>
          )}
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Peak Activity Hours</h3>
          </div>

          <div className="space-y-3">
            {peakHours.map((peak, idx) => {
              const maxCount = Math.max(...peakHours.map(p => p.count))
              const widthPercent = (peak.count / maxCount) * 100
              const hourStr = peak.hour === 0 ? '12 AM' :
                             peak.hour < 12 ? `${peak.hour} AM` :
                             peak.hour === 12 ? '12 PM' :
                             `${peak.hour - 12} PM`

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{hourStr}</span>
                    <span className="text-gray-900 font-bold">{peak.count} movements</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {peakHours.length === 0 && (
            <p className="text-center text-gray-500 py-8">No peak hour data available</p>
          )}
        </div>

        {/* Net Change Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Net Change Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Room Net Change */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Gaining Rooms</h4>
              <div className="space-y-2">
                {roomAnalytics
                  .filter(r => r.net > 0)
                  .sort((a, b) => b.net - a.net)
                  .slice(0, 3)
                  .map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">{room.name}</span>
                      <span className="font-bold text-green-700">+{room.net}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Losing Rooms</h4>
              <div className="space-y-2">
                {roomAnalytics
                  .filter(r => r.net < 0)
                  .sort((a, b) => a.net - b.net)
                  .slice(0, 3)
                  .map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-700">{room.name}</span>
                      <span className="font-bold text-red-700">{room.net}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-gray-600">Most Active Room</div>
                  <div className="font-bold text-gray-900">{roomAnalytics[0]?.name || 'N/A'}</div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <div className="text-gray-600">Busiest Hour</div>
                  <div className="font-bold text-gray-900">
                    {peakHours[0] ? `${peakHours[0].hour === 0 ? '12 AM' : peakHours[0].hour < 12 ? `${peakHours[0].hour} AM` : peakHours[0].hour === 12 ? '12 PM' : `${peakHours[0].hour - 12} PM`}` : 'N/A'}
                  </div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <div className="text-gray-600">Avg Movement Size</div>
                  <div className="font-bold text-gray-900">{stats.avgMovementSize.toFixed(1)} units</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

// ========================================
// DONE! This adds comprehensive visual analytics
// ========================================
