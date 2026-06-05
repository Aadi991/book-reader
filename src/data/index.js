// Data layer barrel — re-export selected services and clients
export { default as supabaseClient } from '../application/supabaseClient'
export { default as StorageService } from '../application/StorageService'
export { default as FirestoreService } from '../application/FirestoreService'
export { default as BookRepository } from './BookRepository'
export { default as ProgressRepository } from './ProgressRepository'
export { default as SettingsRepository } from './SettingsRepository'
