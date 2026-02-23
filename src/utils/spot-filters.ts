import type { Spot, VehicleType, VehicleLengthRange } from '@/types'

/** Vehicle types that use a {min,max} range for length */
export const RANGED_VEHICLE_TYPES: VehicleType[] = ['MOTORISE', 'FIFTHWHEEL', 'ROULOTTE']

/** Vehicle types that are simple boolean (accepted or not) */
export const BOOLEAN_VEHICLE_TYPES: VehicleType[] = ['CAMPEUR_PORTE', 'TENTE_ROULOTTE', 'TENTE']

/** All vehicle types in display order */
export const ALL_VEHICLE_TYPES: VehicleType[] = [...RANGED_VEHICLE_TYPES, ...BOOLEAN_VEHICLE_TYPES]

/** Get the length range for a ranged vehicle type, or null */
export function getVehicleRange(spot: Spot, vehicleType: VehicleType): VehicleLengthRange {
  switch (vehicleType) {
    case 'MOTORISE':
      return spot.motoriseRange
    case 'FIFTHWHEEL':
      return spot.fifthwheelRange
    case 'ROULOTTE':
      return spot.roulotteRange
    default:
      return null
  }
}

/** Check if a spot accepts a given vehicle type */
export function spotAcceptsVehicleType(spot: Spot, vehicleType: VehicleType): boolean {
  switch (vehicleType) {
    case 'MOTORISE':
      return spot.motoriseRange !== null
    case 'FIFTHWHEEL':
      return spot.fifthwheelRange !== null
    case 'ROULOTTE':
      return spot.roulotteRange !== null
    case 'CAMPEUR_PORTE':
      return spot.campeurPorte
    case 'TENTE_ROULOTTE':
      return spot.tenteRoulotte
    case 'TENTE':
      return spot.tente
    default:
      return false
  }
}

/** Check if a spot accepts a vehicle of a given type AND length (in feet) */
export function spotAcceptsVehicleLength(
  spot: Spot,
  vehicleType: VehicleType,
  length: number
): boolean {
  if (!spotAcceptsVehicleType(spot, vehicleType)) return false

  const range = getVehicleRange(spot, vehicleType)
  if (!range) {
    // Boolean vehicle types: no length constraint
    return true
  }

  return length >= range.min && length <= range.max
}
