// Domain layer barrel — DTOs and data objects
// Add domain types and serialization helpers here

export class BookDTO {
  constructor({ id, title, author, ownerId, storagePath, coverPath, createdAt }) {
    this.id = id
    this.title = title
    this.author = author
    this.ownerId = ownerId
    this.storagePath = storagePath
    this.coverPath = coverPath
    this.createdAt = createdAt
  }
}
