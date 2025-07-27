/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getUserReports } from "@/lib/realtimeData";
import { MapPin, Search,  Clock, User, AlertTriangle, CheckCircle,} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Enhanced ReportCard for Reports Page
const ReportCard = ({ report }: { report: any }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200';
      case 'pending': return 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200';
      case 'urgent': return 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200';
      default: return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <User className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority?.toLowerCase() as keyof typeof colors] || colors.medium;
  };

  if (!report?.title && !report?.Eventname) return null;

  const title = report.title || report.Eventname;
  const description = report.description || report.EventSummary;
  const location = report.location || report.Location;
  const status = report.status || 'pending';
  const priority = report.priority || 'medium';
  const reportedBy = report.reportedBy || report.username || 'Anonymous';
  const reportDate = report.createdAt || report.date || new Date().toLocaleDateString();

  return (
    <div
      className={`${getStatusColor(status)} border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
      onClick={() => setIsDialogOpen(true)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">by {reportedBy}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{reportDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(priority)}`}>
            {priority.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'resolved' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
        {description}
      </p>

      {/* Location */}
      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-xs line-clamp-1">{location}</span>
      </div>

      {/* Tags */}
      {report.tags && report.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {report.tags.slice(0, 3).map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tag}
            </span>
          ))}
          {report.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{report.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {isDialogOpen && (
        <ReportDialog
          report={{ title, description, location, status, priority, reportedBy, reportDate, ...report }}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

// Enhanced ReportDialog
const ReportDialog = ({
  report,
  onClose,
}: {
  report: any;
  onClose: () => void;
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-500" />
            <span>{report.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {report.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Priority</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  report.priority === 'high' ? 'bg-red-100 text-red-800' :
                  report.priority === 'low' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.priority?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Reported by</p>
              <p className="text-sm text-gray-600">{report.reportedBy}</p>
              <p className="text-xs text-gray-500">{report.reportDate}</p>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm leading-relaxed text-gray-700">{report.description}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{report.location}</p>
            </div>
          </div>

          {/* Tags */}
          {report.tags && report.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {report.category && (
            <div>
              <p className="text-sm font-medium text-gray-900">Category</p>
              <p className="text-sm text-gray-600">{report.category}</p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4">
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                Follow Up
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Share Report
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const userReports = await getUserReports();
        setReports(userReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const title = report.title || report.Eventname || '';
    const description = report.description || report.EventSummary || '';
    const status = report.status || 'pending';
    const priority = report.priority || 'medium';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || status.toLowerCase() === selectedStatus;
    const matchesPriority = selectedPriority === "all" || priority.toLowerCase() === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusOptions = [
    { value: "all", label: "All Status", icon: "📋" },
    { value: "pending", label: "Pending", icon: "⏳" },
    { value: "resolved", label: "Resolved", icon: "✅" },
    { value: "urgent", label: "Urgent", icon: "🚨" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority", icon: "📊" },
    { value: "high", label: "High", icon: "🔴" },
    { value: "medium", label: "Medium", icon: "🟡" },
    { value: "low", label: "Low", icon: "🟢" }
  ];

  const getStatsData = () => {
    const total = reports.length;
    const pending = reports.filter(r => (r.status || 'pending').toLowerCase() === 'pending').length;
    const resolved = reports.filter(r => (r.status || 'pending').toLowerCase() === 'resolved').length;
    const urgent = reports.filter(r => (r.status || 'pending').toLowerCase() === 'urgent').length;
    
    return { total, pending, resolved, urgent };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              📋 Community Reports
            </h1>
            <p className="text-green-200 text-lg">
              Track and manage community-reported issues and events
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-green-200 text-sm">Total Reports</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-green-200 text-sm">Pending</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
              <div className="text-green-200 text-sm">Resolved</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.urgent}</div>
              <div className="text-green-200 text-sm">Urgent</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStatus === status.value
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {status.icon} {status.label}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredReports.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {filteredReports.length} Reports Found
              </h2>
              <div className="text-green-200">
                {selectedStatus !== 'all' && `Status: ${statusOptions.find(s => s.value === selectedStatus)?.label} • `}
                {selectedPriority !== 'all' && `Priority: ${priorityOptions.find(p => p.value === selectedPriority)?.label}`}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.id || `${report.title}-${index}`}
                  report={report}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Reports Found</h3>
            <p className="text-green-200">
              {reports.length === 0 
                ? "No reports have been submitted yet" 
                : "Try adjusting your search terms or filters"
              }
            </p>
            {reports.length === 0 && (
              <button className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                Submit First Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}