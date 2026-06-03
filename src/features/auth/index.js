// Auth feature (presentation and domain split)
export function signIn(username, password) {
  // placeholder: implement auth repository + providers
  return Promise.resolve({ userId: 'user-1', username })
}

export function signOut() {
  return Promise.resolve()
}
