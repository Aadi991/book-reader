// Data layer barrel — re-export selected services and clients
export { default as supabaseClient } from '../../packages/shared/src/services/supabaseClient'
export { default as StorageService } from '../../packages/shared/src/services/StorageService'
export { default as FirestoreService } from '../../packages/shared/src/services/FirestoreService'
export { default as BookRepository } from '../../packages/shared/src/repositories/BookRepository'
export { default as ProgressRepository } from '../../packages/shared/src/repositories/ProgressRepository'
export { default as SettingsRepository } from '../../packages/shared/src/repositories/SettingsRepository'
