
export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  status: 'Pending' | 'Completed';
}

export interface MeetingSummary {
  topic: string;
  date: string;
  keyPoints: string[];
  sentiment: 'Positive' | 'Neutral' | 'Critical';
  actionItems: ActionItem[];
}

export interface AnalyticsData {
  name: string;
  efficiency: number;
  engagement: number;
}
