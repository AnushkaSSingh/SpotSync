import apiRequest from './api'

export const getParkingOverview = () =>
  apiRequest('/api/parking/overview')

export const getParkingSlots = (options = {}) => {
  const params = new URLSearchParams()

  if (options.parkingLotId != null) {
    params.set('parking_lot_id', options.parkingLotId)
  }

  if (options.availableOnly != null) {
    params.set('available_only', String(options.availableOnly))
  }

  const query = params.toString()
  return apiRequest(`/api/parking/slots${query ? `?${query}` : ''}`)
}

export const getLiveParking = () =>
  apiRequest('/api/parking/live')

export default {
  getParkingOverview,
  getParkingSlots,
  getLiveParking,
}
