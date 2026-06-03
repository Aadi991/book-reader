// Reader feature: handles PDF/open book operations (interface placeholder)
export function openBook(bookId) {
  // placeholder: integrate storage + PDF provider
  return Promise.resolve({ bookId })
}

export function getCurrentPosition(bookId) {
  return { page: 1 }
}
