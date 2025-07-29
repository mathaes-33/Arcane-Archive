/**
 * @file A utility module for persisting user data using IndexedDB.
 * This provides a robust alternative to localStorage for storing large amounts of data,
 * such as entire book contents and file data URLs.
 */
import { Book } from '@/types';

const DB_NAME = 'ArcaneArchivesDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_books';

let db: IDBDatabase;

/**
 * Opens and initializes the IndexedDB database.
 * Creates the object store if it doesn't exist.
 * @returns A promise that resolves when the database is ready.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // If the database connection is already open, resolve it immediately.
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as IDBRequest).error);
      reject('Error opening user archives.');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    // This event is fired only when the version changes,
    // allowing us to create or modify the database schema.
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        // Use 'id' as the keyPath for storing book objects.
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Retrieves all books from the IndexedDB store.
 * @returns A promise that resolves with an array of Book objects.
 */
export async function getAllBooks(): Promise<Book[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject('Error fetching books from the archives.');
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Saves a book to the IndexedDB store. This will either create a new entry
 * or update an existing one if the ID already exists.
 * @param book The Book object to save.
 * @returns A promise that resolves when the book is saved.
 */
export async function saveBook(book: Book): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(book);

    request.onerror = () => reject('Error saving book to the archives.');
    request.onsuccess = () => resolve();
  });
}

/**
 * Deletes a book from the IndexedDB store by its ID.
 * @param bookId The ID of the book to delete.
 * @returns A promise that resolves when the book is deleted.
 */
export async function deleteBook(bookId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);

    request.onerror = () => reject('Error deleting book from the archives.');
    request.onsuccess = () => resolve();
  });
}
