// Utilidades para optimizar el rendimiento y gestionar la memoria

// Función para medir el rendimiento de una función
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name = "Function",
): (...args: Parameters<T>) => ReturnType<T> {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now()
    const result = fn.apply(this, args)
    const end = performance.now()

    // Registrar tiempo solo si es significativo (> 5ms)
    if (end - start > 5) {
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`)
    }

    return result
  }
}

// Clase para monitorear el uso de memoria
export class MemoryMonitor {
  private lastMemoryUsage = 0
  private memoryThreshold = 50 // MB
  private checkInterval = 10000 // 10 segundos
  private intervalId: number | null = null
  private callbacks: Array<(usage: number) => void> = []

  // Iniciar monitoreo
  start() {
    if (typeof window === "undefined" || !("performance" in window) || !("memory" in performance)) {
      console.warn("Memory monitoring not supported in this browser")
      return
    }

    this.intervalId = window.setInterval(() => this.checkMemory(), this.checkInterval)
    this.checkMemory() // Verificar inmediatamente
  }

  // Detener monitoreo
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // Verificar uso de memoria
  private checkMemory() {
    if (typeof window === "undefined" || !("performance" in window) || !("memory" in performance)) {
      return
    }

    const memory = (performance as any).memory
    if (!memory) return

    const usedHeapSize = memory.usedJSHeapSize / (1024 * 1024) // Convertir a MB
    const totalHeapSize = memory.totalJSHeapSize / (1024 * 1024) // Convertir a MB
    const usage = {
      used: usedHeapSize.toFixed(2),
      total: totalHeapSize.toFixed(2),
      percentage: ((usedHeapSize / totalHeapSize) * 100).toFixed(2),
    }

    // Verificar si el uso de memoria ha aumentado significativamente
    if (usedHeapSize - this.lastMemoryUsage > this.memoryThreshold) {
      console.warn(`🚨 Memory usage increased by ${(usedHeapSize - this.lastMemoryUsage).toFixed(2)}MB`)

      // Notificar a los callbacks
      this.callbacks.forEach((callback) => callback(usedHeapSize))

      // Sugerir limpieza de memoria
      this.suggestMemoryCleanup()
    }

    this.lastMemoryUsage = usedHeapSize
  }

  // Sugerir limpieza de memoria
  private suggestMemoryCleanup() {
    // Intentar forzar la recolección de basura
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        ;(window as any).gc()
        console.log("🧹 Garbage collection requested")
      } catch (e) {
        console.log("⚠️ Cannot force garbage collection")
      }
    }
  }

  // Añadir callback para notificaciones de memoria
  onMemoryThresholdExceeded(callback: (usage: number) => void) {
    this.callbacks.push(callback)
    return this // Para encadenamiento
  }

  // Establecer umbral de memoria
  setMemoryThreshold(thresholdMB: number) {
    this.memoryThreshold = thresholdMB
    return this // Para encadenamiento
  }

  // Establecer intervalo de verificación
  setCheckInterval(intervalMs: number) {
    this.checkInterval = intervalMs

    // Reiniciar el intervalo si está activo
    if (this.intervalId !== null) {
      this.stop()
      this.start()
    }

    return this // Para encadenamiento
  }
}

// Exportar una instancia singleton
export const memoryMonitor = new MemoryMonitor()

// Iniciar monitoreo automáticamente en el cliente
if (typeof window !== "undefined") {
  // Iniciar después de que la página haya cargado completamente
  window.addEventListener("load", () => {
    memoryMonitor
      .setMemoryThreshold(100) // 100MB
      .setCheckInterval(30000) // 30 segundos
      .onMemoryThresholdExceeded((usage) => {
        console.warn(`🚨 High memory usage detected: ${usage.toFixed(2)}MB`)

        // Limpiar cachés y recursos no utilizados
        if (typeof window !== "undefined") {
          if ("enhancedComponentCache" in window) {
            ;(window as any).enhancedComponentCache.cleanup()
          }
        }
      })
      .start()
  })
}

// Función para detectar dispositivos de bajo rendimiento
export function detectLowPerformanceDevice(): boolean {
  if (typeof window === "undefined") return false

  // Verificar si es un dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Verificar número de núcleos de CPU
  const cpuCores = navigator.hardwareConcurrency || 1

  // Verificar si el navegador tiene reducción de movimiento activada
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Verificar memoria disponible (solo en Chrome)
  let lowMemory = false
  if ("deviceMemory" in navigator) {
    lowMemory = (navigator as any).deviceMemory < 4 // Menos de 4GB
  }

  // Considerar de bajo rendimiento si cumple al menos 2 condiciones
  let lowPerformanceScore = 0
  if (isMobile) lowPerformanceScore++
  if (cpuCores <= 2) lowPerformanceScore++
  if (prefersReducedMotion) lowPerformanceScore++
  if (lowMemory) lowPerformanceScore++

  return lowPerformanceScore >= 2
}

// Función para aplicar configuraciones de rendimiento automáticamente
export function applyPerformanceSettings() {
  const isLowPerformance = detectLowPerformanceDevice()

  if (isLowPerformance) {
    console.log("🔧 Applying low performance settings")

    // Guardar configuración en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "performance_settings",
        JSON.stringify({
          lowPerformanceMode: true,
          virtualizedDistance: 100,
          prefetchEnabled: false,
          animationsReduced: true,
          batchUpdates: true,
          throttleInterval: 100,
        }),
      )
    }

    // Añadir clase CSS para reducir efectos visuales
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("low-performance-mode")
      document.documentElement.classList.add("disable-animations")
    }
  }

  return isLowPerformance
}

// Aplicar configuraciones automáticamente en el cliente
if (typeof window !== "undefined") {
  window.addEventListener("load", applyPerformanceSettings)
}
