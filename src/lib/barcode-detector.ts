interface BarcodeDetection {
  isScanning: boolean
  inputBuffer: string
  lastKeystrokeTime: number
  listeners: ((barcode: string) => void)[]
  keyListener?: (event: KeyboardEvent) => void
}

class BarcodeDetector {
  private detection: BarcodeDetection = {
    isScanning: false,
    inputBuffer: '',
    lastKeystrokeTime: 0,
    listeners: []
  }

  private readonly SCANNER_KEYSTROKE_THRESHOLD = 50 // ms between keystrokes for scanner
  private readonly SCANNER_TIMEOUT = 200 // ms to complete barcode scan
  private readonly MIN_BARCODE_LENGTH = 3 // minimum barcode length

  constructor() {
    this.initializeGlobalListener()
  }

  private initializeGlobalListener() {
    // Global keypress listener
    this.detection.keyListener = (event: KeyboardEvent) => {
      // Skip if user is typing in input fields
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - this.detection.lastKeystrokeTime

      // Handle Enter key - potential end of barcode scan
      if (event.key === 'Enter') {
        if (this.detection.isScanning && this.detection.inputBuffer.length >= this.MIN_BARCODE_LENGTH) {
          console.log('📱 Barcode detected:', this.detection.inputBuffer)
          this.emitBarcode(this.detection.inputBuffer)
          this.resetDetection()
          event.preventDefault()
          return
        }
      }

      // Handle regular characters
      if (this.isValidBarcodeCharacter(event.key)) {
        // If time between keystrokes is very fast, likely a scanner
        if (timeDiff < this.SCANNER_KEYSTROKE_THRESHOLD) {
          if (!this.detection.isScanning) {
            console.log('🔍 Scanner detected - starting barcode capture')
            this.detection.isScanning = true
            this.detection.inputBuffer = ''
          }
        } else if (timeDiff > this.SCANNER_TIMEOUT) {
          // Too much time passed, reset
          this.resetDetection()
        }

        // Add character to buffer if we're scanning
        if (this.detection.isScanning || timeDiff < this.SCANNER_KEYSTROKE_THRESHOLD) {
          this.detection.isScanning = true
          this.detection.inputBuffer += event.key
          this.detection.lastKeystrokeTime = currentTime
          
          console.log('📝 Building barcode:', this.detection.inputBuffer)
          
          // Prevent the keystroke from affecting other inputs
          event.preventDefault()
          
          // Auto-timeout if barcode gets too long
          if (this.detection.inputBuffer.length > 50) {
            console.log('⚠️ Barcode too long, resetting')
            this.resetDetection()
          }
        }
      }

      this.detection.lastKeystrokeTime = currentTime
    }

    // Set up timeout to reset scanning state
    setInterval(() => {
      if (this.detection.isScanning) {
        const timeSinceLastKeystroke = Date.now() - this.detection.lastKeystrokeTime
        if (timeSinceLastKeystroke > this.SCANNER_TIMEOUT) {
          console.log('⏰ Scanner timeout, resetting')
          this.resetDetection()
        }
      }
    }, 100)
  }

  private isValidBarcodeCharacter(key: string): boolean {
    // Valid barcode characters: alphanumeric and some symbols
    return /^[a-zA-Z0-9\-_]$/.test(key)
  }

  private resetDetection() {
    this.detection.isScanning = false
    this.detection.inputBuffer = ''
    this.detection.lastKeystrokeTime = 0
  }

  private emitBarcode(barcode: string) {
    console.log('📢 Emitting barcode to', this.detection.listeners.length, 'listeners:', barcode)
    this.detection.listeners.forEach(listener => {
      try {
        listener(barcode)
      } catch (error) {
        console.error('Error in barcode listener:', error)
      }
    })
  }

  // Public methods
  startListening() {
    if (this.detection.keyListener) {
      document.addEventListener('keydown', this.detection.keyListener, true)
      console.log('🎯 Barcode detector started listening globally')
    }
  }

  stopListening() {
    if (this.detection.keyListener) {
      document.removeEventListener('keydown', this.detection.keyListener, true)
      console.log('🛑 Barcode detector stopped listening')
    }
  }

  addListener(callback: (barcode: string) => void) {
    this.detection.listeners.push(callback)
    console.log('📝 Barcode listener added, total:', this.detection.listeners.length)
  }

  removeListener(callback: (barcode: string) => void) {
    const index = this.detection.listeners.indexOf(callback)
    if (index > -1) {
      this.detection.listeners.splice(index, 1)
      console.log('🗑️ Barcode listener removed, total:', this.detection.listeners.length)
    }
  }

  // For testing - simulate a barcode scan
  simulateScan(barcode: string) {
    console.log('🧪 Simulating barcode scan:', barcode)
    this.emitBarcode(barcode)
  }

  // Get current detection state (for debugging)
  getState() {
    return {
      isScanning: this.detection.isScanning,
      bufferLength: this.detection.inputBuffer.length,
      buffer: this.detection.inputBuffer,
      listeners: this.detection.listeners.length
    }
  }
}

// Create singleton instance
export const barcodeDetector = new BarcodeDetector()

// Auto-start when imported
if (typeof window !== 'undefined') {
  barcodeDetector.startListening()
}
