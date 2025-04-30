// Utilidades para calcular y aplicar diferencias entre objetos
// Esto reduce significativamente el tamaño de los mensajes enviados

/**
 * Calcula la diferencia entre dos objetos
 * @param oldObj El objeto original
 * @param newObj El objeto nuevo
 * @returns Un objeto que representa las diferencias
 */
export function computeDiff(oldObj: any, newObj: any): any {
  // Si alguno de los objetos es null o undefined, devolver el nuevo objeto
  if (oldObj === null || oldObj === undefined) {
    return { __complete: newObj }
  }

  // Si los tipos son diferentes, devolver el nuevo objeto
  if (typeof oldObj !== typeof newObj) {
    return { __complete: newObj }
  }

  // Si no son objetos, devolver el nuevo valor si es diferente
  if (typeof newObj !== "object" || newObj === null) {
    return oldObj === newObj ? undefined : newObj
  }

  // Si son arrays, manejarlos de forma especial
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    // Si las longitudes son muy diferentes, enviar el array completo
    if (Math.abs(oldObj.length - newObj.length) > oldObj.length * 0.3) {
      return { __complete: newObj }
    }

    // Si son arrays pequeños, enviar el array completo
    if (newObj.length < 10) {
      return oldObj.toString() === newObj.toString() ? undefined : { __complete: newObj }
    }

    // Para arrays grandes, calcular diferencias
    const diff: any = { __array: true, changes: [] }

    // Encontrar elementos modificados
    const minLength = Math.min(oldObj.length, newObj.length)
    for (let i = 0; i < minLength; i++) {
      const itemDiff = computeDiff(oldObj[i], newObj[i])
      if (itemDiff !== undefined) {
        diff.changes.push({ index: i, value: itemDiff })
      }
    }

    // Añadir elementos nuevos
    if (newObj.length > oldObj.length) {
      for (let i = oldObj.length; i < newObj.length; i++) {
        diff.changes.push({ index: i, value: newObj[i] })
      }
    }

    // Marcar elementos eliminados
    if (newObj.length < oldObj.length) {
      diff.length = newObj.length
    }

    return diff.changes.length > 0 || diff.length !== undefined ? diff : undefined
  }

  // Para objetos, calcular diferencias por propiedad
  const diff: any = {}
  let hasDiff = false

  // Propiedades en el objeto nuevo
  for (const key in newObj) {
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      const valueDiff = computeDiff(oldObj[key], newObj[key])
      if (valueDiff !== undefined) {
        diff[key] = valueDiff
        hasDiff = true
      }
    }
  }

  // Propiedades eliminadas en el objeto nuevo
  for (const key in oldObj) {
    if (Object.prototype.hasOwnProperty.call(oldObj, key) && !Object.prototype.hasOwnProperty.call(newObj, key)) {
      diff[key] = { __deleted: true }
      hasDiff = true
    }
  }

  return hasDiff ? diff : undefined
}

/**
 * Aplica una diferencia a un objeto
 * @param oldObj El objeto original
 * @param diff La diferencia a aplicar
 * @returns El objeto actualizado
 */
export function applyDiff(oldObj: any, diff: any): any {
  // Si la diferencia es undefined, no hay cambios
  if (diff === undefined) {
    return oldObj
  }

  // Si la diferencia contiene __complete, reemplazar completamente
  if (diff && diff.__complete !== undefined) {
    return diff.__complete
  }

  // Si la diferencia no es un objeto, reemplazar con el nuevo valor
  if (typeof diff !== "object" || diff === null) {
    return diff
  }

  // Si es una diferencia de array
  if (diff.__array) {
    // Crear una copia del array original
    const result = Array.isArray(oldObj) ? [...oldObj] : []

    // Aplicar cambios
    for (const change of diff.changes) {
      result[change.index] = applyDiff(result[change.index], change.value)
    }

    // Ajustar longitud si es necesario
    if (diff.length !== undefined) {
      result.length = diff.length
    }

    return result
  }

  // Para objetos, aplicar diferencias por propiedad
  const result = { ...oldObj }

  for (const key in diff) {
    if (Object.prototype.hasOwnProperty.call(diff, key)) {
      if (diff[key] && diff[key].__deleted) {
        delete result[key]
      } else {
        result[key] = applyDiff(result[key], diff[key])
      }
    }
  }

  return result
}

/**
 * Comprime un objeto eliminando propiedades innecesarias
 * @param obj El objeto a comprimir
 * @param propsToRemove Lista de propiedades a eliminar
 * @returns El objeto comprimido
 */
export function compressObject(obj: any, propsToRemove: string[]): any {
  if (!obj || typeof obj !== "object") {
    return obj
  }

  // Si es un array, comprimir cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => compressObject(item, propsToRemove))
  }

  // Para objetos, eliminar propiedades innecesarias y comprimir las demás
  const result: any = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Saltar propiedades a eliminar
      if (propsToRemove.includes(key)) {
        continue
      }

      // Comprimir recursivamente
      result[key] = compressObject(obj[key], propsToRemove)
    }
  }

  return result
}
