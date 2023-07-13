import * as GetUserPreferences from '../GetUserPreferences/GetUserPreferences.js'
import * as GetWatchOptions from '../GetWatchOptions/GetWatchOptions.js'

export const getConfigureOptions = () => {
  return {
    preferences: GetUserPreferences.getUserPreferences(),
    watchOptions: GetWatchOptions.getWatchOptions(),
  }
}
