import type { StatusRecord } from "./types";

const STORAGE_KEY = "status_history";
const MAX_RECORDS_PER_SERVICE = 1000;

/**
 * Get all stored status records
 */
export async function getStoredRecords(): Promise<
  Record<string, StatusRecord[]>
> {
  try {
    // Fallback to local storage in browser
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    }

    // Fallback to in-memory on server
    return serverStorage.getAllRecords();
  } catch (error) {
    console.error("Failed to get stored records:", error);
    return {};
  }
}

/**
 * Get records for a specific service
 */
export async function getServiceRecords(
  serviceId: string,
): Promise<StatusRecord[]> {
  const allRecords = await getStoredRecords();
  return allRecords[serviceId] || [];
}

/**
 * Store a new status record
 */
export async function storeStatusRecord(
  serviceId: string,
  record: StatusRecord,
): Promise<void> {
  try {
    const allRecords = await getStoredRecords();

    if (!allRecords[serviceId]) {
      allRecords[serviceId] = [];
    }

    allRecords[serviceId].push(record);

    // Keep only the most recent records
    if (allRecords[serviceId].length > MAX_RECORDS_PER_SERVICE) {
      allRecords[serviceId] = allRecords[serviceId].slice(
        -MAX_RECORDS_PER_SERVICE,
      );
    }

    // Update local storage in browser
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    }

    serverStorage.setAllRecords(allRecords);
  } catch (error) {
    console.error("Failed to store status record:", error);
  }
}

/**
 * Clear all records for a service
 */
export async function clearServiceRecords(serviceId: string): Promise<void> {
  try {
    const allRecords = await getStoredRecords();
    delete allRecords[serviceId];

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    }

    serverStorage.setAllRecords(allRecords);
  } catch (error) {
    console.error("Failed to clear records:", error);
  }
}

/**
 * Get latest record for a service
 */
export async function getLatestRecord(
  serviceId: string,
): Promise<StatusRecord | null> {
  const records = await getServiceRecords(serviceId);
  return records.length > 0 ? records[records.length - 1] : null;
}

/**
 * In-memory storage for server-side status (Simple fallback)
 */
class InMemoryStorage {
  private records: Record<string, StatusRecord[]> = {};

  getRecords(serviceId: string): StatusRecord[] {
    return this.records[serviceId] || [];
  }

  storeRecord(serviceId: string, record: StatusRecord): void {
    if (!this.records[serviceId]) {
      this.records[serviceId] = [];
    }

    this.records[serviceId].push(record);

    if (this.records[serviceId].length > MAX_RECORDS_PER_SERVICE) {
      this.records[serviceId] = this.records[serviceId].slice(
        -MAX_RECORDS_PER_SERVICE,
      );
    }
  }

  getAllRecords(): Record<string, StatusRecord[]> {
    return this.records;
  }

  setAllRecords(records: Record<string, StatusRecord[]>): void {
    this.records = records;
  }

  clear(): void {
    this.records = {};
  }
}

export const serverStorage = new InMemoryStorage();
