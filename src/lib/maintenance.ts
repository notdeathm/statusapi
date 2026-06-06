export interface MaintenanceNote {
  isDown: boolean;
  reason: string | null;
  startTime: string | null;
  estimatedDowntime: string | null;
  manuallyTriggered: boolean;
}

export interface MaintenanceData {
  services: Record<string, MaintenanceNote>;
}

// In-memory storage for maintenance notes
class MaintenanceStore {
  private notes: MaintenanceData = {
    services: {},
  };

  async getAllNotes(): Promise<MaintenanceData> {
    return this.notes;
  }

  async getNote(serviceId: string): Promise<MaintenanceNote | null> {
    return this.notes.services[serviceId] || null;
  }

  async setNote(serviceId: string, note: MaintenanceNote) {
    this.notes.services[serviceId] = note;
  }

  // Toggle maintenance mode
  async toggleMaintenance(
    serviceId: string,
    reason: string,
    estimatedDowntime: string,
  ) {
    const current = this.notes.services[serviceId] || {
      isDown: false,
      reason: null,
      startTime: null,
      estimatedDowntime: null,
      manuallyTriggered: false,
    };

    const newNote = {
      isDown: !current.isDown,
      reason: !current.isDown ? reason : null,
      startTime: !current.isDown ? new Date().toISOString() : null,
      estimatedDowntime: !current.isDown ? estimatedDowntime : null,
      manuallyTriggered: true,
    };

    await this.setNote(serviceId, newNote);
  }
}

export const maintenanceStore = new MaintenanceStore();
