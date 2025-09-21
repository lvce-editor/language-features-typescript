import * as GetUserPreferences from '../GetUserPreferences/GetUserPreferences.ts'
import * as GetWatchOptions from '../GetWatchOptions/GetWatchOptions.ts'

export const getConfigureOptions = () => {
  return {
    preferences: GetUserPreferences.getUserPreferences(),
    watchOptions: GetWatchOptions.getWatchOptions(),
  }
}
