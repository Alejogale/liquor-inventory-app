// Test script to manually clear room data
console.log('🧪 Testing room clear functionality...')

// Clear all room-related localStorage items
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && key.includes('complete_room_state')) {
    keysToRemove.push(key)
  }
}

console.log(`🗑️  Found ${keysToRemove.length} room state items to remove:`)
keysToRemove.forEach(key => {
  console.log(`  - ${key}`)
  localStorage.removeItem(key)
})

console.log('✅ Room state cleared from localStorage')
console.log('🔄 Please refresh the page or click "Clear All" to test')

// Also trigger a force refresh event
window.dispatchEvent(new CustomEvent('forceRoomRefresh', { 
  detail: { timestamp: Date.now(), manual: true } 
}))

console.log('📡 Force refresh event dispatched')
