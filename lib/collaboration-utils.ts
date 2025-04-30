import type { Component, Page } from "@/lib/models"

/**
 * Determina si un cambio en un componente es estructural
 * Los cambios estructurales son aquellos que afectan la estructura del árbol de componentes
 * o cambian significativamente la naturaleza del componente
 */
export function isStructuralComponentChange(
  originalComponent: Component | undefined,
  updatedData: Partial<Component>,
): boolean {
  if (!originalComponent) return true // Si es un componente nuevo, es estructural

  // Cambios que consideramos estructurales
  return (
    updatedData.type !== undefined ||
    updatedData.children !== undefined ||
    updatedData.parentId !== undefined ||
    updatedData.layout !== undefined ||
    (updatedData.props && JSON.stringify(originalComponent.props) !== JSON.stringify(updatedData.props))
  )
}

/**
 * Determina si un cambio en una página es estructural
 * Los cambios estructurales son aquellos que afectan la estructura de la página
 * o cambian significativamente sus propiedades
 */
export function isStructuralPageChange(originalPage: Page | undefined, updatedData: Partial<Page>): boolean {
  if (!originalPage) return true // Si es una página nueva, es estructural

  // Cambios que consideramos estructurales
  return (
    updatedData.name !== undefined ||
    updatedData.route !== undefined ||
    (updatedData.pageSettings && JSON.stringify(originalPage.pageSettings) !== JSON.stringify(updatedData.pageSettings))
  )
}

/**
 * Determina si un tipo de cambio siempre debe considerarse estructural
 */
export function isAlwaysStructuralChangeType(changeType: string): boolean {
  return ["ADD_COMPONENT", "REMOVE_COMPONENT", "ADD_PAGE", "REMOVE_PAGE", "DUPLICATE_COMPONENT"].includes(changeType)
}
