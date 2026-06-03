export class Book {
  constructor({ id, title, author }) {
    this.id = id
    this.title = title
    this.author = author
  }
}

export function sampleBooks() {
  return [
    new Book({ id: '1', title: 'The Odyssey', author: 'Homer' }),
    new Book({ id: '2', title: 'Pride and Prejudice', author: 'Jane Austen' }),
    new Book({ id: '3', title: '1984', author: 'George Orwell' })
  ]
}

export function getBooks() {
  return sampleBooks()
}
