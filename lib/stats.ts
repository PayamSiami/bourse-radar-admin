// Mock data for testing
export const mockStats = {
  users: { total: 1250, newUsers: 87, verifiedUsers: 1102, admins: 8 },
  tickets: { open: 23, pending: 45, resolved: 312, total: 380 },
  stocks: { total: 285, activeWithPrice: 242 },
};

export interface DashboardStats {
  users?: { total?: number; newUsers?: number; verifiedUsers?: number; admins?: number };
  tickets?: { open?: number; pending?: number; resolved?: number; total?: number };
  stocks?: { total?: number; activeWithPrice?: number };
}

export async function fetchStats() {
  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStats;
}
