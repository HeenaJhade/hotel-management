import React, { useState, useEffect } from 'react';
import apiClient from "../../../utils/api";
import { Clock, Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { generateActivityLogsReport } from '../utils/pdfGenerator';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getActivityLogs({ page, limit });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    generateActivityLogsReport(logs);
    toast.success('Activity logs report downloaded');
  };

  const getActionColor = (action) => {
    if (action.includes('Created')) return 'bg-green-100 text-green-700';
    if (action.includes('Updated')) return 'bg-blue-100 text-blue-700';
    if (action.includes('Deleted')) return 'bg-red-100 text-red-700';
    if (action.includes('Cancelled')) return 'bg-orange-100 text-orange-700';
    return 'bg-stone-100 text-stone-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-stone-900">Activity Logs</h1>
          <p className="text-stone-500 mt-1">Track all system activities and changes</p>
        </div>
        <Button 
          onClick={handleDownloadReport}
          className="rounded-full bg-primary"
          data-testid="download-logs-report"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-stone-500">Loading activity logs...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-stone-200 text-center">
          <Clock className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No activity logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    data-testid={`activity-log-${log.id}`}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {log.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-stone-900">{log.user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;