import { useContext } from 'react'
import { useAuth as useAuthContext } from './AuthProvider'

export default function useAuth() {
  return useAuthContext()
}
