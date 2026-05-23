import { useState, useEffect } from "react";
import { 
  Database, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  FileText, 
  Trash2, 
  Save,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  X,
  Download,
  Upload,
  Tag,
  Search,
  Filter,
  ArrowUpDown,
  Bell,
  Settings,
  Target,
  Zap,
  BarChart3,
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  ExternalLink,
  AlertCircle,
  Pencil,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  Menu,
  Moon,
  Sun,
  Info,
  LogOut,
  MessageSquare
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { TagBadge } from "./TagBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";
import TubeLabLogo from "../imports/TubeLabLogo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { OAuthDiagnostics } from "./OAuthDiagnostics";
import { TrialStatusBanner } from "./TrialStatusBanner";
import { FeedbackDialog } from "./FeedbackDialog";
import { importSimpleCSV } from "./VideoImportHelper";
import { importEngagementMetrics, ImportError } from "./EngagementMetricsImporter";
import { ReachDataErrorCorrection } from "./ReachDataErrorCorrection";
import { getMetricsForDateRange as getMetricsHelper } from "./VideoMetricsHelper";
import { VideoBulkUpdateImporter } from "./VideoBulkUpdateImporter";
import { parseDuration, formatDuration } from "../lib/utils";

const API_KEY = "AIzaSyCDaPedxeLy_iaKZZtEWx8m3RPp9DwYfOQ";
const CHANNEL_HANDLE = "@mbd-studio-design";

// Predefined tag categories with hex colors (for dialogs)
// Tag categories configuration - used for styling and default initialization
const TAG_CATEGORIES = {
  tool: {
    label: 'Topic Tags',
    color: '#3B82F6', // blue
    colorDark: '#2563EB', // darker blue for hover
    defaultTags: ['Firefly', 'Figma', 'Figma for Print', 'Photoshop', 'Photoshop Beta', 'Photoshop 2026', 'Project Neo', 'Canva', 'Illustrator', 'Adobe Express', 'Capcut', 'Clipchamp']
  },
  format: {
    label: 'Format Tags',
    color: '#7b29cc', // purple
    colorDark: '#6221a8', // darker purple for hover
    defaultTags: ['Design in Minutes', 'Core Video', 'Short']
  },
  status: {
    label: 'Status Tags',
    color: '#6C52FF', // purple
    colorDark: '#5339E6', // darker purple for hover
    defaultTags: ['Update', 'Wait', 'Unlisted', 'Removed', 'To-Do', 'Recent Videos']
  }
} as const;

export interface AnalyticsSnapshot {
  timestamp: string;
  views: number;
  likes: number;
  comments: number;
  impressions?: number;
  ctr?: number;
  averageViewDuration?: number;
  averageViewPercentage?: number;
  estimatedMinutesWatched?: number; // Watch time in minutes
  topTrafficSource?: string;
  topTrafficSourcePercentage?: number;
  allTrafficSources?: Array<{source: string, views: number, percentage: number}>; // NEW: All traffic sources
  note?: string;
  milestone?: number; // Days after publish (4, 7, 30, etc.)
  dateRange?: 'lifetime' | 'last28'; // Indicates whether snapshot is for lifetime or 28-day period
}

interface PerformanceGoal {
  id: string;
  metricType: 'views' | 'likes' | 'comments' | 'engagement';
  targetValue: number;
  deadline?: string;
  achieved?: boolean;
  createdAt: string;
}

interface NextStepItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
  notes?: string;
  nextSteps?: NextStepItem[] | string; // Support both old string format and new array format
  tags?: string[];
  analyticsHistory?: AnalyticsSnapshot[];
  currentViews?: number;
  currentLikes?: number;
  currentComments?: number;
  performanceGoals?: PerformanceGoal[];
  autoSnapshotEnabled?: boolean;
  snapshotFrequency?: 'daily' | 'weekly';
  lastSnapshotDate?: string;
  videoUpdated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface VideoDatabaseProps {
  userId: string;
  userEmail: string;
  accessToken: string;
  onLogout: () => void;
}

export function VideoDatabase({ userId, userEmail, accessToken, onLogout }: VideoDatabaseProps) {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('tubelab-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Theme color state
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem('tubelab-theme-color');
    return saved || '#5928CB'; // Default purple
  });
  
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [notes, setNotes] = useState("");
  const [nextSteps, setNextSteps] = useState<NextStepItem[]>([]);
  const [newNextStep, setNewNextStep] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [takingSnapshot, setTakingSnapshot] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("date");
  const [showNextStepsOnly, setShowNextStepsOnly] = useState(false);
  const [showGoalsOnly, setShowGoalsOnly] = useState(false);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [selectedPresetFilter, setSelectedPresetFilter] = useState<string>("none");
  const [dateRangeFilter, setDateRangeFilter] = useState<'last28' | 'sincePublished'>('last28');
  const [publishDateFilter, setPublishDateFilter] = useState<string>("all"); // all, 30days, 60days, 90days, thisYear
  
  // List view states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listSortBy, setListSortBy] = useState<string | null>(null);
  const [listSortDirection, setListSortDirection] = useState<'asc' | 'desc'>('desc');
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('tubelab-visible-columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved columns:', e);
      }
    }
    return {
      publishDate: true,
      views: true,
      percentViewed: true,
      impressions: true,
      ctr: true,
      likes: false,
      comments: false,
      duration: false,
      watchTime: false,
      avgViewDuration: false,
      topTrafficSource: true,
    };
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // Tag management - all tags are now stored in database
  const [newTag, setNewTag] = useState("");
  const [videoTags, setVideoTags] = useState<string[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [pendingCustomTag, setPendingCustomTag] = useState("");
  const [allTags, setAllTags] = useState<{
    tool: string[];
    format: string[];
    status: string[];
  }>({ tool: [], format: [], status: [] });
  
  // Performance goals
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalMetric, setGoalMetric] = useState<'views' | 'likes' | 'reach' | 'growth' | 'percentViewed'>('views');
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  
  // Notifications for achieved goals
  const [notifications, setNotifications] = useState<Array<{id: string, videoId: string, videoTitle: string, goalType: string, timestamp: string}>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('tubelab-dismissed-notifications');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse dismissed notifications:', e);
      }
    }
    return new Set();
  });
  
  // Settings dialog
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'analytics' | 'tags' | 'appearance' | 'account'>('analytics');
  const [newSettingsTag, setNewSettingsTag] = useState('');
  const [newSettingsTagCategory, setNewSettingsTagCategory] = useState<'tool' | 'format' | 'status'>('tool');
  const [selectedTagToEdit, setSelectedTagToEdit] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  // Feedback dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  
  // Beta testing OAuth notice
  const [showBetaOAuthNotice, setShowBetaOAuthNotice] = useState(false);
  
  // Import Reach dialog
  const [showImportReachDialog, setShowImportReachDialog] = useState(false);
  const [hasSeenBetaNotice, setHasSeenBetaNotice] = useState(() => {
    return localStorage.getItem('tubelab_beta_oauth_notice_seen') === 'true';
  });
  
  // Auto snapshot settings
  const [autoSnapshotEnabled, setAutoSnapshotEnabled] = useState(false);
  const [snapshotFrequency, setSnapshotFrequency] = useState<'daily' | 'weekly'>('daily');
  const [milestoneAutoSyncEnabled, setMilestoneAutoSyncEnabled] = useState(true); // Default enabled
  
  // Bulk operations
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  
  // Analytics view selection
  const [selectedAnalyticsView, setSelectedAnalyticsView] = useState<'overview' | 'engagement' | 'traffic' | 'retention'>('overview');
  
  // Advanced analytics input dialog
  const [showAdvancedAnalyticsDialog, setShowAdvancedAnalyticsDialog] = useState(false);
  const [advancedAvgDuration, setAdvancedAvgDuration] = useState("");
  const [advancedAvgPercentage, setAdvancedAvgPercentage] = useState("");
  const [advancedTrafficSource, setAdvancedTrafficSource] = useState("");
  const [advancedTrafficPercentage, setAdvancedTrafficPercentage] = useState("");
  const [advancedCTR, setAdvancedCTR] = useState("");
  const [advancedImpressions, setAdvancedImpressions] = useState("");
  
  // YouTube Analytics OAuth
  const [analyticsConnected, setAnalyticsConnected] = useState(false);
  const [connectingAnalytics, setConnectingAnalytics] = useState(false);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(false);
  const [apiNotEnabledError, setApiNotEnabledError] = useState<string | null>(null);
  
  // Video Rankings from YouTube
  const [videoRankings, setVideoRankings] = useState<{ [videoId: string]: number }>({});
  const [fetchingTopContent, setFetchingTopContent] = useState(false);
  const [topContentDateRange, setTopContentDateRange] = useState<'lifetime' | 'last28' | null>(null);
  
  // CSV Import
  const [importingEngagementCSV, setImportingEngagementCSV] = useState(false);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [showEngagementImportDialog, setShowEngagementImportDialog] = useState(false);
  const [engagementDateRange, setEngagementDateRange] = useState<'lifetime' | 'last28'>('lifetime');
  const [engagementCaptureDate, setEngagementCaptureDate] = useState<Date | undefined>(undefined);
  const [engagementDatePickerOpen, setEngagementDatePickerOpen] = useState(false);
  const [pendingEngagementFile, setPendingEngagementFile] = useState<File | null>(null);
  const [showErrorCorrectionDialog, setShowErrorCorrectionDialog] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  
  // Data Cleanup Dialog
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [cleaningData, setCleaningData] = useState(false);
  
  // CSV Export Dialog
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFields, setExportFields] = useState({
    publishedAt: true,
    duration: true,
    views: true,
    likes: true,
    comments: true,
    subscribers: true,
    impressions: true,
    ctr: true,
    percentageViewed: true,
    watchTime: true,
    avgViewDuration: true,
    trafficSource: true,
    tags: true,
    notes: true,
    nextSteps: true,
    thumbnailUrl: false,
    description: false,
  });
  
  // Channel info
  const [channelInfo, setChannelInfo] = useState<{
    title: string;
    subscriberCount: string;
    watchTimeMinutes?: number;
    customUrl?: string;
    thumbnailUrl?: string;
  } | null>(null);
  
  // YouTube channel ID for deep linking to Studio
  const [youtubeChannelId, setYoutubeChannelId] = useState<string | null>(null);
  const [manualChannelIdInput, setManualChannelIdInput] = useState("");
  const [savingChannelId, setSavingChannelId] = useState(false);
  
  // Manual video addition
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [addVideoId, setAddVideoId] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  
  // API quota and error states
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // OAuth error handling
  const [showOAuthErrorDialog, setShowOAuthErrorDialog] = useState(false);
  const [oauthErrorDetails, setOAuthErrorDetails] = useState<{error: string, description?: string}>({error: ""});
  
  // Snapshot note dialog
  const [showSnapshotNoteDialog, setShowSnapshotNoteDialog] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState("");
  const [pendingSnapshotVideoId, setPendingSnapshotVideoId] = useState<string | null>(null);
  
  // Sync date range dialog (for individual video sync - REMOVED, now uses current filter)
  const [showSyncDateRangeDialog, setShowSyncDateRangeDialog] = useState(false);
  const [syncDateRangeChoice, setSyncDateRangeChoice] = useState<'last28' | 'sincePublished'>('sincePublished');
  
  // Main YouTube Sync dialog
  const [showMainSyncDialog, setShowMainSyncDialog] = useState(false);
  const [mainSyncDateRange, setMainSyncDateRange] = useState<'last28' | 'sincePublished'>('sincePublished');
  const [syncAllVideos, setSyncAllVideos] = useState(false);
  
  // Delete snapshot confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteTimestamp, setPendingDeleteTimestamp] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit snapshot note dialog
  const [showEditSnapshotNoteDialog, setShowEditSnapshotNoteDialog] = useState(false);
  const [editingSnapshotTimestamp, setEditingSnapshotTimestamp] = useState<string | null>(null);
  const [editingSnapshotNote, setEditingSnapshotNote] = useState("");
  
  // Clear analytics dialog
  const [showClearAnalyticsDialog, setShowClearAnalyticsDialog] = useState(false);
  const [clearingAnalytics, setClearingAnalytics] = useState(false);
  
  // Multi-select and bulk operations
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [bulkTagsToAdd, setBulkTagsToAdd] = useState<string[]>([]);
  const [bulkTagsToRemove, setBulkTagsToRemove] = useState<string[]>([]);
  const [applyingBulkTags, setApplyingBulkTags] = useState(false);
  
  // Post-sync reach import prompt
  const [showPostSyncReachPrompt, setShowPostSyncReachPrompt] = useState(false);
  
  // Session token management - for authenticated API calls
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Get fresh session token (call this before making API requests)
  const getSessionToken = async (): Promise<string | null> => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setSessionToken(session.access_token);
      return session.access_token;
    }
    return null;
  };
  
  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tubelab-dark-mode', JSON.stringify(isDarkMode));
    
    // Dispatch custom event so Navigation can update
    window.dispatchEvent(new Event('darkModeChange'));
    
    // Cleanup: Remove dark class when component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [isDarkMode]);
  
  // Theme color effect
  useEffect(() => {
    localStorage.setItem('tubelab-theme-color', themeColor);
    // Set CSS variable for theme color
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);
  
  // Force grid view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  
  // Persist visible columns
  useEffect(() => {
    localStorage.setItem('tubelab-visible-columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  
  // Persist dismissed notifications
  useEffect(() => {
    localStorage.setItem('tubelab-dismissed-notifications', JSON.stringify(Array.from(dismissedNotifications)));
  }, [dismissedNotifications]);
  
  // Debug: Log allTags state whenever it changes
  useEffect(() => {
    console.log('🔍 allTags state changed:', allTags);
  }, [allTags]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Get all tags organized by category (all stored in database now)
  const getAllTagsByCategory = () => {
    return {
      tool: {
        label: "Topic Tags",
        color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
        tags: allTags.tool
      },
      format: {
        label: "Format Tags",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700",
        tags: allTags.format
      },
      status: {
        label: "Status Tags",
        color: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
        tags: allTags.status
      }
    };
  };
  
  // Use this for backward compatibility
  const PREDEFINED_TAGS = getAllTagsByCategory();
  
  // Get tag color based on tag categories
  const getTagColor = (tag: string): string => {
    console.log('🎨 getTagColor called for tag:', tag);
    console.log('🎨 Current allTags state:', allTags);
    
    // Check if tag exists in any category in allTags
    if (allTags.tool && allTags.tool.includes(tag)) {
      console.log(`🎨 Found "${tag}" in tool tags, returning blue`);
      return TAG_CATEGORIES.tool.color;
    } else if (allTags.format && allTags.format.includes(tag)) {
      console.log(`🎨 Found "${tag}" in format tags, returning purple`);
      return TAG_CATEGORIES.format.color;
    } else if (allTags.status && allTags.status.includes(tag)) {
      console.log(`🎨 Found "${tag}" in status tags, returning purple`);
      return TAG_CATEGORIES.status.color;
    }
    console.log(`🎨 Tag "${tag}" not found in any category, returning default purple`);
    return '#9333ea'; // Default purple for custom tags
  };

  // Format traffic source from YouTube API values to user-friendly names
  const formatTrafficSource = (source: string | undefined | null): string => {
    if (!source) return "Unknown";
    
    // Map YouTube Analytics API values to user-friendly names
    // Based on YouTube Analytics API insightTrafficSourceType dimension
    const trafficSourceMap: { [key: string]: string } = {
      // YouTube API values (from insightTrafficSourceType dimension)
      "SUBSCRIBER": "Browse Features", // Subscriber feed/home page
      "YT_SEARCH": "YouTube Search",
      "RELATED_VIDEO": "Suggested Videos",
      "BROWSE": "Browse Features",
      "EXT_URL": "External",
      "CHANNEL": "Channel Pages",
      "NO_LINK_OTHER": "Direct or Unknown",
      "PLAYLIST": "Playlists",
      "NOTIFICATION": "Notifications",
      "YT_OTHER_PAGE": "Other YouTube Features",
      "CAMPAIGN_CARD": "Other YouTube Features",
      "END_SCREEN": "Other YouTube Features",
      "ANNOTATION": "Other YouTube Features",
      "LIVE_REDIRECT": "Other YouTube Features",
      // Already formatted values (from manual entry)
      "YouTube Search": "YouTube Search",
      "Suggested Videos": "Suggested Videos",
      "Browse Features": "Browse Features",
      "External": "External",
      "Channel Pages": "Channel Pages",
      "Direct or Unknown": "Direct or Unknown",
      "Playlists": "Playlists",
      "Notifications": "Notifications",
      "Other YouTube Features": "Other YouTube Features",
    };
    
    return trafficSourceMap[source] || source;
  };

  // Get all unique tags from all videos plus database tags
  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    // Add all tags from database
    Object.values(PREDEFINED_TAGS).forEach(category => {
      category.tags.forEach(tag => tagSet.add(tag));
    });
    
    // Add tags from videos (in case there are any orphaned tags)
    videos.forEach(video => {
      video.tags?.forEach(tag => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  };

  // Predefined analytics filters
  const PRESET_FILTERS = [
    {
      id: "packaging",
      name: "📦 Repackage",
      description: "Good video, weak packaging.",
      evaluate: (video: VideoData) => {
        if (!video.analyticsHistory || video.analyticsHistory.length === 0) return false;
        
        // Get the latest snapshot with CTR data
        const latestWithCTR = [...video.analyticsHistory].reverse().find(s => s.ctr !== undefined);
        const ctr = latestWithCTR?.ctr || 0;
        
        // Get the latest snapshot with retention data
        const latestWithRetention = [...video.analyticsHistory].reverse().find(s => 
          s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined
        );
        
        let retention = 0;
        if (latestWithRetention?.averageViewPercentage !== undefined) {
          retention = latestWithRetention.averageViewPercentage;
        } else if (latestWithRetention?.averageViewDuration) {
          const avgViewDuration = latestWithRetention.averageViewDuration; // in seconds
          const videoLength = video.duration ? parseDuration(video.duration) : 1; // in seconds
          retention = (avgViewDuration / videoLength) * 100; // Convert to percentage
        }
        
        return ctr < 4 && retention > 40;
      }
    },
    {
      id: "opportunity",
      name: "💎 Boost",
      description: "Great but under-seen.",
      evaluate: (video: VideoData) => {
        if (!video.analyticsHistory || video.analyticsHistory.length === 0) return false;
        
        // Get the latest snapshot with CTR data
        const latestWithCTR = [...video.analyticsHistory].reverse().find(s => s.ctr !== undefined);
        const ctr = latestWithCTR?.ctr || 0;
        
        // Get the latest snapshot with impressions data
        const latestWithImpressions = [...video.analyticsHistory].reverse().find(s => s.impressions !== undefined);
        const impressions = latestWithImpressions?.impressions || 0;
        
        // Get the latest snapshot with retention data
        const latestWithRetention = [...video.analyticsHistory].reverse().find(s => 
          s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined
        );
        
        let retention = 0;
        if (latestWithRetention?.averageViewPercentage !== undefined) {
          retention = latestWithRetention.averageViewPercentage;
        } else if (latestWithRetention?.averageViewDuration) {
          const avgViewDuration = latestWithRetention.averageViewDuration; // in seconds
          const videoLength = video.duration ? parseDuration(video.duration) : 1; // in seconds
          retention = (avgViewDuration / videoLength) * 100; // Convert to percentage
        }
        
        return ctr >= 4.0 && retention >= 30 && impressions < 1000;
      }
    },
    {
      id: "winners",
      name: "🏆 Winners",
      description: "Your consistent hits.",
      evaluate: (video: VideoData) => {
        if (!video.analyticsHistory || video.analyticsHistory.length === 0) return false;
        
        // Get the latest snapshot with CTR data
        const latestWithCTR = [...video.analyticsHistory].reverse().find(s => s.ctr !== undefined);
        const ctr = latestWithCTR?.ctr || 0;
        
        // Get the latest snapshot with impressions data
        const latestWithImpressions = [...video.analyticsHistory].reverse().find(s => s.impressions !== undefined);
        const impressions = latestWithImpressions?.impressions || 0;
        
        // Get the latest snapshot with retention data
        const latestWithRetention = [...video.analyticsHistory].reverse().find(s => 
          s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined
        );
        
        let retention = 0;
        if (latestWithRetention?.averageViewPercentage !== undefined) {
          retention = latestWithRetention.averageViewPercentage;
        } else if (latestWithRetention?.averageViewDuration) {
          const avgViewDuration = latestWithRetention.averageViewDuration; // in seconds
          const videoLength = video.duration ? parseDuration(video.duration) : 1; // in seconds
          retention = (avgViewDuration / videoLength) * 100; // Convert to percentage
        }
        
        return ctr >= 4.0 && retention >= 30 && impressions > 3000;
      }
    },
    {
      id: "topContent",
      name: "🌟 Top Content",
      description: "YouTube Best Performers",
      evaluate: (video: VideoData) => {
        // Check if this video is in the top 10
        const rank = videoRankings[video.videoId];
        const isTopContent = rank && rank <= 10;
        
        // Debug logging
        if (Object.keys(videoRankings).length > 0) {
          console.log(`🌟 Top Content Check for "${video.title}":`, {
            videoId: video.videoId,
            rank: rank,
            isInTop10: isTopContent,
            totalRanked: Object.keys(videoRankings).length
          });
        }
        
        return isTopContent;
      }
    }
  ];

  // Evaluate preset filter
  const evaluatePresetFilter = (video: VideoData, filterId: string) => {
    if (filterId === "none") return true;
    const filter = PRESET_FILTERS.find(f => f.id === filterId);
    if (!filter) return true;
    
    const result = filter.evaluate(video);
    
    // Debug logging for Winner filter
    if (filterId === "winner") {
      const latestSnapshot = video.analyticsHistory?.[video.analyticsHistory.length - 1];
      console.log(`🏆 Winner Filter Check for "${video.title}":`, {
        videoId: video.videoId,
        hasAnalyticsHistory: !!video.analyticsHistory,
        historyLength: video.analyticsHistory?.length || 0,
        latestSnapshot: latestSnapshot,
        ctr: latestSnapshot?.ctr,
        impressions: latestSnapshot?.impressions,
        averageViewPercentage: latestSnapshot?.averageViewPercentage,
        averageViewDuration: latestSnapshot?.averageViewDuration,
        duration: video.duration,
        result: result
      });
    }
    
    return result;
  };

  // Calculate engagement rate
  const calculateEngagementRate = (video: VideoData) => {
    const views = video.currentViews || 0;
    const likes = video.currentLikes || 0;
    const comments = video.currentComments || 0;
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  };

  // Calculate views per day
  const calculateViewsPerDay = (video: VideoData) => {
    const publishDate = new Date(video.publishedAt);
    const now = new Date();
    const daysSincePublish = Math.max(1, Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round((video.currentViews || 0) / daysSincePublish);
  };

  // Calculate growth rate from analytics history
  const calculateGrowthRate = (video: VideoData) => {
    if (!video.analyticsHistory || video.analyticsHistory.length < 2) return 0;
    
    const sorted = [...video.analyticsHistory].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    if (first.views === 0) return 0;
    
    return ((last.views - first.views) / first.views) * 100;
  };

  // Calculate growth rate based on date range filter
  const getGrowthRateForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number => {
    if (!video.analyticsHistory || video.analyticsHistory.length < 2) return 0;

    if (dateRange === 'sincePublished') {
      // Return lifetime growth rate
      return calculateGrowthRate(video);
    }

    // For "UP TO 28 days": compare latest snapshot to oldest snapshot within 28-day window
    const now = new Date();
    const twentyEightDaysAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    
    const allSnapshots = [...video.analyticsHistory]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Get the latest snapshot (most recent data)
    const latest = allSnapshots[allSnapshots.length - 1];
    
    // Find the oldest snapshot within the 28-day window
    const snapshotsInRange = allSnapshots
      .filter(snapshot => new Date(snapshot.timestamp) >= twentyEightDaysAgo);
    
    // If we have snapshots in the 28-day range, use the oldest one as baseline
    // Otherwise, use the oldest available snapshot (video is younger than 28 days)
    const baseline = snapshotsInRange.length > 0 ? snapshotsInRange[0] : allSnapshots[0];
    
    // Debug logging (5% sample rate)
    if (Math.random() < 0.05 && video.title) {
      console.log(`🔍 Growth calc for "${video.title.substring(0, 30)}":`, {
        totalSnapshots: allSnapshots.length,
        snapshotsInRange: snapshotsInRange.length,
        baselineDate: new Date(baseline.timestamp).toLocaleDateString(),
        latestDate: new Date(latest.timestamp).toLocaleDateString(),
        baselineViews: baseline.views,
        latestViews: latest.views,
        sameSnapshot: baseline.timestamp === latest.timestamp,
        growth28: baseline.timestamp !== latest.timestamp && baseline.views > 0 
          ? (((latest.views - baseline.views) / baseline.views) * 100).toFixed(2) 
          : 0
      });
    }
    
    // If baseline and latest are the same, no growth to calculate
    if (baseline.timestamp === latest.timestamp) return 0;
    if (baseline.views === 0) return 0;
    
    return ((latest.views - baseline.views) / baseline.views) * 100;
  };

  // Get latest impressions from analytics history
  const getLatestImpressions = (video: VideoData): number => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return 0;
    }
    
    const sorted = [...video.analyticsHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const latestWithImpressions = sorted.find(snapshot => 
      snapshot.impressions !== undefined && snapshot.impressions !== null
    );
    
    return latestWithImpressions?.impressions ?? 0;
  };

  // Get latest CTR from analytics history
  const getLatestCTR = (video: VideoData): number | null => {
    // console.log(`🔍 getLatestCTR called for "${video.title}" (ID: ${video.videoId})`);
    // console.log('  analyticsHistory exists:', !!video.analyticsHistory);
    // console.log('  analyticsHistory length:', video.analyticsHistory?.length || 0);
    
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      // console.log(`  ❌ No analytics history for video: ${video.title}`);
      return null;
    }
    
    const sorted = [...video.analyticsHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const latest = sorted[0];
    // console.log(`Latest snapshot for "${video.title}":`, latest);
    // console.log(`CTR value:`, latest.ctr, `Type:`, typeof latest.ctr);
    
    // Find the latest snapshot that has CTR data (not just the latest snapshot overall)
    const latestWithCTR = sorted.find(snapshot => 
      snapshot.ctr !== undefined && snapshot.ctr !== null
    );
    
    return latestWithCTR?.ctr ?? null;
  };

  // Get latest percentage viewed (retention) from analytics history
  const getLatestPercentageViewed = (video: VideoData): number => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return 0;
    }
    
    const latestWithRetention = [...video.analyticsHistory].reverse().find(s => 
      s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined
    );
    
    if (latestWithRetention?.averageViewPercentage !== undefined) {
      return latestWithRetention.averageViewPercentage;
    } else if (latestWithRetention?.averageViewDuration) {
      const avgViewDuration = latestWithRetention.averageViewDuration; // in seconds
      const videoLength = video.duration ? parseDuration(video.duration) : 1; // in seconds
      return (avgViewDuration / videoLength) * 100; // Convert to percentage
    }
    
    return 0;
  };

  // Calculate a "top content" score based on multiple quality metrics
  const getTopContentScore = (video: VideoData): number => {
    // Combine CTR (40%), retention (40%), and views per day (20%)
    const ctr = getLatestCTR(video) || 0;
    const retention = getLatestPercentageViewed(video);
    const viewsPerDay = calculateViewsPerDay(video);
    
    // Normalize views per day (cap at 1000 for scoring purposes)
    const normalizedViewsPerDay = Math.min(viewsPerDay / 1000, 1) * 100;
    
    return (ctr * 0.4) + (retention * 0.4) + (normalizedViewsPerDay * 0.2);
  };

  // Get CTR based on date range filter
  const getCTRForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number | null => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return null;
    }

    if (dateRange === 'sincePublished') {
      // Filter for lifetime snapshots
      const lifetimeSnapshots = [...video.analyticsHistory]
        .filter(s => s.ctr !== undefined && s.ctr !== null && s.dateRange === 'lifetime')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (lifetimeSnapshots.length > 0) {
        return lifetimeSnapshots[0].ctr || null;
      }
      // Fallback to legacy logic if no dateRange-tagged snapshots
      return getLatestCTR(video);
    }

    // For "UP TO 28 days": Use the CTR values directly from snapshots within the window
    // Filter snapshots by the dateRange field (lifetime vs last28), but always include milestones
    const allSnapshots = [...video.analyticsHistory]
      .filter(s => s.ctr !== undefined && s.ctr !== null && (s.dateRange === 'last28' || s.milestone !== undefined))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (allSnapshots.length === 0) {
      // Fallback to legacy logic if no dateRange-tagged snapshots
      return getLatestCTR(video);
    }
    
    // Return the most recent snapshot with dateRange='last28'
    // Return the most recent snapshot with dateRange='last28'
    return allSnapshots[0].ctr || null;
  };

  // Get Impressions based on date range filter
  const getImpressionsForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number | null => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return null;
    }

    if (dateRange === 'sincePublished') {
      // Filter for lifetime snapshots
      const lifetimeSnapshots = [...video.analyticsHistory]
        .filter(s => s.impressions !== undefined && s.impressions !== null && s.dateRange === 'lifetime')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (lifetimeSnapshots.length > 0) {
        return lifetimeSnapshots[0].impressions || null;
      }
      // Fallback: find any snapshot with impressions
      const anyWithImpressions = [...video.analyticsHistory]
        .filter(s => s.impressions !== undefined && s.impressions !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return anyWithImpressions.length > 0 ? anyWithImpressions[0].impressions || null : null;
    }

    // Filter for 28-day snapshots, but always include milestones
    const last28Snapshots = [...video.analyticsHistory]
      .filter(s => s.impressions !== undefined && s.impressions !== null && (s.dateRange === 'last28' || s.milestone !== undefined))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (last28Snapshots.length > 0) {
      return last28Snapshots[0].impressions || null;
    }
    
    // Fallback: find any snapshot with impressions
    const anyWithImpressions = [...video.analyticsHistory]
      .filter(s => s.impressions !== undefined && s.impressions !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return anyWithImpressions.length > 0 ? anyWithImpressions[0].impressions || null : null;
  };

  // LEGACY FUNCTION - keeping for backwards compatibility
  const getCTRForDateRange_OLD = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number | null => {
    // Legacy Debug logging (5% sample rate)
    if (Math.random() < 0.05 && video.title) {
      console.log(`🎯 CTR for "${video.title.substring(0, 30)}":`, {
        snapshotsInRange: snapshotsInRange.length,
        latestCTR28Days: (latestInRange.ctr || 0).toFixed(2) + '%',
        latestCTRLifetime: (allSnapshots[allSnapshots.length - 1].ctr || 0).toFixed(2) + '%',
        date: new Date(latestInRange.timestamp).toLocaleDateString()
      });
    }
    
    return latestInRange.ctr || null;
  };

  // Get percentage viewed (retention) based on date range filter
  const getPercentageViewedForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return 0;
    }

    if (dateRange === 'sincePublished') {
      // Return the latest retention (lifetime)
      return getLatestPercentageViewed(video);
    }

    // For "Last 28 Days", look for snapshots with dateRange='last28'
    const last28Snapshots = [...video.analyticsHistory]
      .filter(s => 
        (s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined) && 
        s.dateRange === 'last28'
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (last28Snapshots.length > 0) {
      // Use the most recent "last28" snapshot
      const latest = last28Snapshots[last28Snapshots.length - 1];
      if (latest.averageViewPercentage !== undefined) {
        return latest.averageViewPercentage;
      }
      if (latest.averageViewDuration) {
        const videoLength = video.duration ? parseDuration(video.duration) : 1;
        return (latest.averageViewDuration / videoLength) * 100;
      }
    }

    // Fallback: For videos published less than 28 days ago, show lifetime retention
    const publishDate = new Date(video.publishedAt);
    const now = new Date();
    const daysSincePublish = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePublish < 28) {
      // Video is too new - just show lifetime retention
      return getLatestPercentageViewed(video);
    }

    // If no last28 snapshots exist, fall back to lifetime
    return getLatestPercentageViewed(video);
  };

  // Get metrics based on date range filter
  // ✅ FIXED VERSION: Now using VideoMetricsHelper which correctly uses YouTube Analytics API 'last28' snapshot data
  const getMetricsForDateRange = getMetricsHelper;

  // Get average view duration based on date range
  const getAvgViewDurationForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): number | null => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return null;
    }

    // Check video age
    const now = new Date();
    const publishDate = new Date(video.publishedAt);
    const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    const isYoungVideo = daysOld <= 28;

    // Get the appropriate snapshots
    let snapshots = video.analyticsHistory.filter(s => s.averageViewDuration !== undefined);

    if (dateRange === 'sincePublished' || isYoungVideo) {
      // Get lifetime data (for young videos, accept both lifetime and last28 since they're identical)
      snapshots = snapshots.filter(s => !s.dateRange || s.dateRange === 'lifetime' || (isYoungVideo && s.dateRange === 'last28'));
    } else {
      // Get last28 data
      snapshots = snapshots.filter(s => s.dateRange === 'last28');
    }

    if (snapshots.length === 0) return null;

    // Return most recent snapshot
    const latest = snapshots.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return latest.averageViewDuration || null;
  };

  // Get top traffic source based on date range
  const getTopTrafficSourceForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished'): string | null => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return null;
    }

    // Check video age
    const now = new Date();
    const publishDate = new Date(video.publishedAt);
    const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    const isYoungVideo = daysOld <= 28;

    // Get the appropriate snapshots
    let snapshots = video.analyticsHistory.filter(s => s.topTrafficSource !== undefined);

    if (dateRange === 'sincePublished' || isYoungVideo) {
      // Get lifetime data (for young videos, accept both lifetime and last28 since they're identical)
      snapshots = snapshots.filter(s => !s.dateRange || s.dateRange === 'lifetime' || (isYoungVideo && s.dateRange === 'last28'));
    } else {
      // Get last28 data
      snapshots = snapshots.filter(s => s.dateRange === 'last28');
    }

    if (snapshots.length === 0) return null;

    // Return most recent snapshot
    const latest = snapshots.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return latest.topTrafficSource || null;
  };
  
  /*
  // OLD BUGGY VERSION - Kept for reference
  const getMetricsForDateRange_OLD = (video: VideoData, dateRange: 'last28' | 'sincePublished') => {
    // Debug shorts metrics (1% sample rate)
    if (video.tags?.includes('Short') && Math.random() < 0.01) {
      console.log(`🎬 Shorts metrics for "${video.title?.substring(0, 30)}":`, {
        currentViews: video.currentViews,
        currentLikes: video.currentLikes,
        hasAnalyticsHistory: !!video.analyticsHistory?.length,
        dateRange
      });
    }
    
    if (dateRange === 'sincePublished') {
      // Return lifetime metrics
      return {
        views: video.currentViews || 0,
        likes: video.currentLikes || 0,
        comments: video.currentComments || 0
      };
    }
    
    // For "UP TO 28 days": compare latest values to oldest snapshot within 28-day window
    const now = new Date();
    const publishDate = new Date(video.publishedAt);
    const twentyEightDaysAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    
    // If video is younger than 28 days, entire lifetime is within "up to 28 days"
    if (publishDate >= twentyEightDaysAgo) {
      return {
        views: video.currentViews || 0,
        likes: video.currentLikes || 0,
        comments: video.currentComments || 0
      };
    }
    
    // For videos older than 28 days, calculate from analytics history
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      // Debug shorts without analytics history
      if (video.tags?.includes('Short')) {
        console.log(`🎬 No analytics history for Short: "${video.title?.substring(0, 40)}"`, {
          currentViews: video.currentViews,
          currentLikes: video.currentLikes,
          publishDate: new Date(video.publishedAt).toLocaleDateString()
        });
      }
      // If no analytics history, fall back to current values (can't calculate growth without baseline)
      return {
        views: video.currentViews || 0,
        likes: video.currentLikes || 0,
        comments: video.currentComments || 0
      };
    }
    
    // Sort snapshots by timestamp (oldest first), and only use lifetime snapshots
    // (we should not use 'last28' snapshots as baseline since they're already calculated deltas)
    const lifetimeSnapshots = video.analyticsHistory.filter(s => !s.dateRange || s.dateRange === 'lifetime');
    
    if (lifetimeSnapshots.length === 0) {
      // If no lifetime snapshots, fall back to current values
      if (video.tags?.includes('Short')) {
        console.log(`🎬 No lifetime snapshots for Short: "${video.title?.substring(0, 40)}"`, {
          totalSnapshots: video.analyticsHistory.length,
          currentViews: video.currentViews
        });
      }
      return {
        views: video.currentViews || 0,
        likes: video.currentLikes || 0,
        comments: video.currentComments || 0
      };
    }
    
    const sorted = [...lifetimeSnapshots].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Use current values as the latest (most accurate)
    const latestViews = video.currentViews || 0;
    const latestLikes = video.currentLikes || 0;
    const latestComments = video.currentComments || 0;
    
    // Find the oldest snapshot within the 28-day window
    const snapshotsInRange = sorted.filter(s => new Date(s.timestamp) >= twentyEightDaysAgo);
    
    // If we have snapshots in range, use the oldest one; otherwise use the oldest available
    const baselineSnapshot = snapshotsInRange.length > 0 ? snapshotsInRange[0] : sorted[0];
    
    // Debug shorts 28-day calculation (100% for debugging)
    if (video.tags?.includes('Short')) {
      console.log(`🎬 28-day calc for "${video.title?.substring(0, 40)}":`, {
        currentViews: video.currentViews,
        latestViews,
        baselineViews: baselineSnapshot.views,
        baselineDate: new Date(baselineSnapshot.timestamp).toLocaleDateString(),
        baselineDateRange: baselineSnapshot.dateRange || 'unspecified',
        calculated28DayViews: Math.max(0, latestViews - (baselineSnapshot.views || 0)),
        snapshotsInRange: snapshotsInRange.length,
        lifetimeSnapshotsTotal: sorted.length,
        totalSnapshotsBeforeFilter: video.analyticsHistory?.length || 0,
        publishDate: new Date(video.publishedAt).toLocaleDateString(),
        daysOld: Math.floor((new Date().getTime() - new Date(video.publishedAt).getTime()) / (24 * 60 * 60 * 1000))
      });
    }
    
    // Calculate the difference between current values and baseline
    return {
      views: Math.max(0, latestViews - (baselineSnapshot.views || 0)),
      likes: Math.max(0, latestLikes - (baselineSnapshot.likes || 0)),
      comments: Math.max(0, latestComments - (baselineSnapshot.comments || 0))
    };
  };
  */

  // Filter and sort videos
  useEffect(() => {
    console.log('⚠️ DUPLICATE FILTER useEffect (line ~912) - THIS SHOULD BE REMOVED');
    console.log('🔄 Re-filtering and sorting videos. Date Range:', dateRangeFilter, 'Sort By:', sortBy);
    let filtered = [...videos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(video => {
        const query = searchQuery.toLowerCase();
        const matchesBasic = video.title?.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query) ||
          video.notes?.toLowerCase().includes(query);
        
        // Check nextSteps (handle both array and string formats)
        let matchesNextSteps = false;
        if (Array.isArray(video.nextSteps)) {
          matchesNextSteps = video.nextSteps.some(item => item.text?.toLowerCase().includes(query));
        } else if (typeof video.nextSteps === 'string') {
          matchesNextSteps = video.nextSteps.toLowerCase().includes(query);
        }
        
        return matchesBasic || matchesNextSteps;
      });
    }

    // Tag filter (multi-select) - videos must have ALL selected tags (AND logic)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(video =>
        selectedTags.every(tag => video.tags?.includes(tag))
      );
    }

    // Always filter out shorts unless "Short" tag is explicitly selected
    if (!selectedTags.includes('Short')) {
      filtered = filtered.filter(video => !video.tags?.includes('Short'));
    }

    // Always filter out unlisted videos unless "Unlisted" tag is explicitly selected
    if (!selectedTags.includes('Unlisted')) {
      filtered = filtered.filter(video => !video.tags?.includes('Unlisted'));
    }

    // Tasks filter - only show videos with uncompleted tasks
    if (showNextStepsOnly) {
      filtered = filtered.filter(video => {
        if (Array.isArray(video.nextSteps)) {
          return video.nextSteps.some(step => !step.completed);
        } else if (typeof video.nextSteps === 'string') {
          return video.nextSteps.trim().length > 0;
        }
        return false;
      });
    }

    // Goals filter
    if (showGoalsOnly) {
      console.log('🎯 Goals Filter Active - Debugging Info:');
      console.log(`  Total videos before Goals filter: ${filtered.length}`);
      
      // Log each video's goal status
      filtered.forEach(video => {
        console.log(`  📹 "${video.title}":`);
        console.log(`    - performanceGoals exists:`, !!video.performanceGoals);
        console.log(`    - performanceGoals value:`, video.performanceGoals);
        console.log(`    - performanceGoals length:`, video.performanceGoals?.length);
        console.log(`    - Will pass filter:`, !!(video.performanceGoals && video.performanceGoals.length > 0));
      });
      
      filtered = filtered.filter(video => {
        const hasGoals = video.performanceGoals && video.performanceGoals.length > 0;
        return hasGoals;
      });
      
      console.log(`  ✅ Videos passing Goals filter: ${filtered.length}`);
      if (filtered.length > 0) {
        console.log('  Videos with goals:', filtered.map(v => v.title));
      }
    }

    // Preset analytics filter
    if (selectedPresetFilter !== "none") {
      filtered = filtered.filter(video => evaluatePresetFilter(video, selectedPresetFilter));
    }

    // Publish date range filter
    if (publishDateFilter !== "all") {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      filtered = filtered.filter(video => {
        if (!video.publishedAt) return false;
        const publishDate = new Date(video.publishedAt);
        
        switch (publishDateFilter) {
          case "30days":
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return publishDate >= thirtyDaysAgo;
          case "60days":
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            return publishDate >= sixtyDaysAgo;
          case "90days":
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return publishDate >= ninetyDaysAgo;
          case "thisYear":
            return publishDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          // Put invalid dates (0 or very old) at the end
          if (dateA === 0 && dateB !== 0) return 1;
          if (dateB === 0 && dateA !== 0) return -1;
          return dateB - dateA;
        case "views":
          const metricsA = getMetricsForDateRange(a, dateRangeFilter);
          const metricsB = getMetricsForDateRange(b, dateRangeFilter);
          return metricsB.views - metricsA.views;
        case "likes":
          const likesMetricsA = getMetricsForDateRange(a, dateRangeFilter);
          const likesMetricsB = getMetricsForDateRange(b, dateRangeFilter);
          return likesMetricsB.likes - likesMetricsA.likes;
        case "ctr":
          const ctrA = getCTRForDateRange(a, dateRangeFilter) || 0;
          const ctrB = getCTRForDateRange(b, dateRangeFilter) || 0;
          return ctrB - ctrA;
        case "growth":
          const growthA = getGrowthRateForDateRange(a, dateRangeFilter);
          const growthB = getGrowthRateForDateRange(b, dateRangeFilter);
          return growthB - growthA;
        case "percentViewed":
          const percentA = getPercentageViewedForDateRange(a, dateRangeFilter);
          const percentB = getPercentageViewedForDateRange(b, dateRangeFilter);
          return percentB - percentA;
        case "ranking":
          // Sort by ranking using videoRankings map
          const rankA = videoRankings[a.videoId];
          const rankB = videoRankings[b.videoId];
          // Videos without rankings go to the end
          if (!rankA && !rankB) return 0;
          if (!rankA) return 1;
          if (!rankB) return -1;
          return rankA - rankB; // Lower rank number comes first
        default:
          return 0;
      }
    });

    // Log top 5 videos after sorting (for debugging)
    if (filtered.length > 0 && (sortBy === 'views' || sortBy === 'likes' || sortBy === 'ctr' || sortBy === 'growth' || sortBy === 'percentViewed')) {
      console.log(`\n📊 Top 5 videos by ${sortBy} (${dateRangeFilter === 'last28' ? '28 Days' : 'Lifetime'}):`);
      filtered.slice(0, 5).forEach((video, index) => {
        if (!video.title) return; // Skip videos without titles
        let value = 0;
        let lifetimeValue = 0;
        if (sortBy === 'views') {
          const metrics = getMetricsForDateRange(video, dateRangeFilter);
          const lifetimeMetrics = getMetricsForDateRange(video, 'sincePublished');
          value = metrics.views;
          lifetimeValue = lifetimeMetrics.views;
        } else if (sortBy === 'likes') {
          const metrics = getMetricsForDateRange(video, dateRangeFilter);
          const lifetimeMetrics = getMetricsForDateRange(video, 'sincePublished');
          value = metrics.likes;
          lifetimeValue = lifetimeMetrics.likes;
        } else if (sortBy === 'ctr') {
          value = getCTRForDateRange(video, dateRangeFilter) || 0;
          lifetimeValue = getCTRForDateRange(video, 'sincePublished') || 0;
          console.log(`  ${index + 1}. "${video.title.substring(0, 40)}"`);
          console.log(`     28-day CTR: ${value.toFixed(2)}% | Lifetime CTR: ${lifetimeValue.toFixed(2)}% | Same? ${value === lifetimeValue ? 'YES ⚠️' : 'NO ✓'}`);
          return; // Skip the generic logging below
        } else if (sortBy === 'growth') {
          value = getGrowthRateForDateRange(video, dateRangeFilter);
          lifetimeValue = getGrowthRateForDateRange(video, 'sincePublished');
          console.log(`  ${index + 1}. "${video.title.substring(0, 40)}"`);
          console.log(`     28-day Growth: ${value.toFixed(2)}% | Lifetime Growth: ${lifetimeValue.toFixed(2)}% | Same? ${value === lifetimeValue ? 'YES ⚠️' : 'NO ✓'}`);
          return;
        } else if (sortBy === 'percentViewed') {
          value = getPercentageViewedForDateRange(video, dateRangeFilter);
          lifetimeValue = getPercentageViewedForDateRange(video, 'sincePublished');
          console.log(`  ${index + 1}. "${video.title.substring(0, 40)}"`);
          console.log(`     28-day Retention: ${value.toFixed(2)}% | Lifetime Retention: ${lifetimeValue.toFixed(2)}% | Same? ${value === lifetimeValue ? 'YES ⚠️' : 'NO ✓'}`);
          return;
        }
        console.log(`  ${index + 1}. "${video.title.substring(0, 40)}"`);
        if (sortBy === 'views' || sortBy === 'likes') {
          console.log(`     ${dateRangeFilter === 'last28' ? '28-day' : 'Lifetime'}: ${value} | Lifetime: ${lifetimeValue}`);
        } else {
          console.log(`     ${dateRangeFilter === 'last28' ? '28-day' : 'Lifetime'}: ${value.toFixed(2)} | Lifetime: ${lifetimeValue.toFixed(2)}`);
        }
      });
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, selectedTags, sortBy, showNextStepsOnly, showGoalsOnly, selectedPresetFilter, dateRangeFilter, videoRankings, publishDateFilter]);

  // Fetch videos from database
  const fetchDatabaseVideos = async () => {
    try {
      console.log('📥 Fetching videos from database...');
      const token = await getSessionToken();
      if (!token) {
        console.error("No session token available");
        toast.error("Authentication required. Please log in again.");
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos from database");
      }

      const data = await response.json();
      
      // Sort videos by publish date (newest first)
      const sortedVideos = (data.videos || []).sort((a: VideoData, b: VideoData) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return dateB - dateA;
      });
      
      console.log(`✅ Loaded ${sortedVideos.length} videos into state`);
      // Debug: Check if videos have tags
      if (sortedVideos.length > 0) {
        console.log('🔍 Sample video with tags:', {
          title: sortedVideos[0].title?.substring(0, 40),
          tags: sortedVideos[0].tags,
          hasTagsProperty: 'tags' in sortedVideos[0],
          tagsIsArray: Array.isArray(sortedVideos[0].tags)
        });
      }
      setVideos(sortedVideos);
      
      // Fetch custom tags
      try {
        const tagsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          console.log('📌 Loaded tags from database:', JSON.stringify(tagsData, null, 2));
          
          // Always set allTags if we got a valid response
          if (tagsData.customTags) {
            // Ensure the structure is correct (has all three categories as arrays)
            const loadedTags = {
              tool: Array.isArray(tagsData.customTags.tool) ? tagsData.customTags.tool.filter((tag: string) => tag !== 'one video data') : [],
              format: Array.isArray(tagsData.customTags.format) ? tagsData.customTags.format : [],
              status: Array.isArray(tagsData.customTags.status) ? tagsData.customTags.status : []
            };
            console.log('🔍 Processed loadedTags (removed "one video data" from tool tags):', JSON.stringify(loadedTags, null, 2));
            
            // Check if we have any tags
            const hasAnyTags = loadedTags.tool.length > 0 || loadedTags.format.length > 0 || loadedTags.status.length > 0;
            console.log('🔍 hasAnyTags check:', hasAnyTags, 'tool.length:', loadedTags.tool.length, 'format.length:', loadedTags.format.length, 'status.length:', loadedTags.status.length);
            
            if (hasAnyTags) {
              // We have tags - use them
              console.log('✅ Setting allTags to loaded tags:', JSON.stringify(loadedTags, null, 2));
              setAllTags(loadedTags);
              
              // Save cleaned tags back to database (to persist removal of "one video data" from topic tags)
              const putResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ customTags: loadedTags }),
                }
              );
              console.log('💾 Saved cleaned tags to database');
            } else {
              // All arrays are empty, initialize with defaults and save to database
              const defaultTags = {
                tool: [...TAG_CATEGORIES.tool.defaultTags],
                format: [...TAG_CATEGORIES.format.defaultTags],
                status: [...TAG_CATEGORIES.status.defaultTags]
              };
              console.log('🆕 Database has empty tags, initializing with defaults:', defaultTags);
              setAllTags(defaultTags);
              
              // Save default tags to database
              const putResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ customTags: defaultTags }),
                }
              );
              const putResult = await putResponse.json();
              console.log('💾 PUT response for default tags:', putResult);
            }
          } else {
            // No customTags in response, initialize with defaults
            const defaultTags = {
              tool: [...TAG_CATEGORIES.tool.defaultTags],
              format: [...TAG_CATEGORIES.format.defaultTags],
              status: [...TAG_CATEGORIES.status.defaultTags]
            };
            console.log('🆕 No customTags in response, initializing defaults:', defaultTags);
            setAllTags(defaultTags);
            
            // Save default tags to database
            const putResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ customTags: defaultTags }),
              }
            );
            const putResult = await putResponse.json();
            console.log('💾 PUT response for default tags (no customTags case):', putResult);
          }
        }
      } catch (error) {
        // Silently fail and use default tags - this is not a critical error
        console.log("Using default tags due to fetch error");
        const defaultTags = {
          tool: [...TAG_CATEGORIES.tool.defaultTags],
          format: [...TAG_CATEGORIES.format.defaultTags],
          status: [...TAG_CATEGORIES.status.defaultTags]
        };
        setAllTags(defaultTags);
      }
    } catch (error) {
      // Only log without scary red error - this runs on every page load
      console.log("Database fetch issue:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Get channel ID from handle
  const getChannelId = async () => {
    // Remove @ symbol if present
    const handleWithoutAt = CHANNEL_HANDLE.replace('@', '');
    
    console.log('🔍 Looking up channel ID for handle:', handleWithoutAt);
    
    // Try using forHandle parameter (works for newer channels)
    let response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handleWithoutAt}&key=${API_KEY}`
    );
    let data = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log('✅ Found channel by forHandle:', data.items[0].id);
      return data.items[0].id;
    }
    console.log('❌ forHandle lookup failed');
    
    // Fallback: Try using forUsername parameter (works for older channels)
    response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${handleWithoutAt}&key=${API_KEY}`
    );
    data = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log('✅ Found channel by forUsername:', data.items[0].id);
      return data.items[0].id;
    }
    console.log('❌ forUsername lookup failed');
    
    // Last resort: Search by channel name (WARNING: May return wrong channel!)
    console.log('⚠️  Trying channel search as last resort - this may return wrong results!');
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handleWithoutAt)}&type=channel&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    
    if (searchData.items && searchData.items.length > 0) {
      console.log('⚠️  Found channel by search (may be wrong!):', searchData.items[0].snippet.channelId);
      console.log('⚠️  Channel name from search:', searchData.items[0].snippet.channelTitle);
      return searchData.items[0].snippet.channelId;
    }
    
    console.log('Channel lookup failed. API response:', data);
    throw new Error("Channel not found. Please check your channel handle.");
  };

  // Fetch video stats from YouTube
  const fetchVideoStats = async (videoId: string) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoId}&key=${API_KEY}`
    );
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found on YouTube");
    }

    const item = data.items[0];
    const durationInSeconds = parseDuration(item.contentDetails?.duration || "PT0S");
    
    return {
      videoId: item.id,
      currentViews: parseInt(item.statistics.viewCount || "0"),
      currentLikes: parseInt(item.statistics.likeCount || "0"),
      currentComments: parseInt(item.statistics.commentCount || "0"),
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
      duration: item.contentDetails?.duration,
      durationInSeconds,
      isShort: durationInSeconds < 60,
    };
  };

  // Fetch channel info (title, subscribers, watch time if Analytics connected)
  const fetchChannelInfo = async () => {
    try {
      const channelId = await getChannelId();
      
      console.log('🔍 Fetching channel info for channel ID:', channelId);
      console.log('🔍 Using channel handle:', CHANNEL_HANDLE);
      
      // Fetch channel statistics from YouTube Data API
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log('Channel info not found');
        return;
      }

      const channel = data.items[0];
      console.log('📺 Channel found:', channel.snippet.title);
      console.log('👥 Subscriber count:', channel.statistics.subscriberCount);
      const info: any = {
        title: channel.snippet.title,
        subscriberCount: channel.statistics.subscriberCount,
        customUrl: channel.snippet.customUrl || CHANNEL_HANDLE,
        thumbnailUrl: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      };

      // Try to fetch watch time from Analytics API if connected
      if (analyticsConnected) {
        try {
          // Get fresh Supabase session token
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.access_token) {
            // Session not available yet - skip analytics
          } else {
            const analyticsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/channel-stats`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );
          
            if (analyticsResponse.ok) {
              const analyticsData = await analyticsResponse.json();
              if (analyticsData.watchTimeMinutes) {
                info.watchTimeMinutes = analyticsData.watchTimeMinutes;
              }
            } else {
              const errorData = await analyticsResponse.json();
              
              // If OAuth session expired, update the connection status silently on page load
              if (errorData.error?.includes('OAuth session expired') || errorData.error?.includes('Please reconnect')) {
                setAnalyticsConnected(false);
                console.log('ℹ️  YouTube Analytics session expired. Please reconnect in Settings.');
              }
            }
          }
        } catch (err) {
          console.log('Watch time not available from Analytics API:', err);
        }
      }

      setChannelInfo(info);
    } catch (error) {
      console.log('Channel info fetch skipped:', error);
    }
  };

  // Fetch YouTube channel ID for deep linking to Studio
  const fetchYouTubeChannelId = async () => {
    try {
      console.log('🔍 Fetching YouTube channel ID from database...');
      const token = await getSessionToken();
      if (!token) {
        console.log('⚠️ No session token - skipping channel ID fetch');
        return;
      }
      
      console.log('🔑 Token obtained, making request...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/youtube/channel-id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('📡 Channel ID response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Channel ID response data:', data);
        
        if (data.channelId) {
          setYoutubeChannelId(data.channelId);
          console.log('✅ YouTube channel ID loaded:', data.channelId);
        } else {
          console.log('ℹ️ No channel ID saved in database yet');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch channel ID:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Channel ID fetch error:', error);
    }
  };

  // Save YouTube channel ID manually
  const saveChannelIdManually = async () => {
    if (!manualChannelIdInput.trim()) {
      toast.error("Please enter a valid channel ID");
      return;
    }

    setSavingChannelId(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/youtube/channel-id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ channelId: manualChannelIdInput.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setYoutubeChannelId(data.channelId);
        setManualChannelIdInput("");
        toast.success("Channel ID saved successfully!");
        console.log("✅ Channel ID manually saved:", data.channelId);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save channel ID: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving channel ID:", error);
      toast.error("Failed to save channel ID");
    } finally {
      setSavingChannelId(false);
    }
  };

  // Fetch all video rankings from YouTube Analytics
  const fetchTopVideos = async () => {
    if (!analyticsConnected) {
      toast.error("Please connect YouTube Analytics first");
      return;
    }

    setFetchingTopContent(true);
    try {
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log("No session available for top content fetch");
        setFetchingTopContent(false);
        return;
      }
      
      // Map dateRangeFilter to server's expected format
      const serverDateRange = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
      
      // Fetch all videos (limit=200 to ensure we get everything)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/top-videos?limit=200&dateRange=${serverDateRange}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if OAuth session expired
        if (errorData.error?.includes('OAuth session expired') || errorData.error?.includes('Please reconnect')) {
          setAnalyticsConnected(false);
          toast.error('YouTube Analytics session expired. Please reconnect in Settings.');
        } else if (errorData.error === "API_NOT_ENABLED") {
          toast.error("YouTube Analytics API is not enabled. Please enable it in Google Cloud Console.");
        } else if (errorData.error === "ANALYTICS_UNAVAILABLE") {
          toast.error("YouTube Analytics API is temporarily unavailable. Please try again later.");
        } else {
          toast.error(`Failed to fetch video rankings: ${errorData.error || 'Unknown error'}`);
        }
        
        setVideoRankings({});
        return;
      }

      const data = await response.json();
      
      if (data.success && data.topVideos) {
        // Create a map of videoId -> rank (1, 2, 3, etc.)
        const rankings: { [videoId: string]: number } = {};
        data.topVideos.forEach((v: any, index: number) => {
          rankings[v.videoId] = index + 1;
        });
        
        setVideoRankings(rankings);
        setTopContentDateRange(serverDateRange);
        console.log('✅ Video rankings fetched:', Object.keys(rankings).length);
        console.log('📊 Date range:', serverDateRange);
        console.log('🏆 Top 10:', Object.entries(rankings).slice(0, 10));
        toast.success(`Loaded rankings for ${Object.keys(rankings).length} videos (${serverDateRange === 'lifetime' ? 'Lifetime' : 'Last 28 Days'})`);
      } else {
        setVideoRankings({});
        setTopContentDateRange(null);
        toast.info("No ranking data available");
      }
    } catch (error) {
      console.log("Error fetching video rankings:", error);
      toast.error("Failed to fetch video rankings");
      setVideoRankings({});
    } finally {
      setFetchingTopContent(false);
    }
  };

  // Fetch videos from YouTube API
  const fetchYouTubeVideos = async () => {
    const channelId = await getChannelId();
    
    // Get uploads playlist
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      console.log('Channel API response:', channelData);
      throw new Error("Channel data not found. Please check your API key and channel ID.");
    }
    
    if (!channelData.items[0].contentDetails) {
      console.log('Channel data:', channelData.items[0]);
      throw new Error("Channel content details not found");
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get ALL videos from uploads playlist (not just 50)
    let allPlaylistItems: any[] = [];
    let nextPageToken: string | undefined = undefined;
    
    do {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();
      
      if (playlistData.items) {
        allPlaylistItems = allPlaylistItems.concat(playlistData.items);
      }
      
      nextPageToken = playlistData.nextPageToken;
      console.log(`📥 Fetched ${playlistData.items?.length || 0} videos, total so far: ${allPlaylistItems.length}${nextPageToken ? ', more pages available' : ', all pages fetched'}`);
    } while (nextPageToken);

    console.log(`📊 Total videos in channel: ${allPlaylistItems.length}`);

    // Get video IDs in batches of 50 (API limit)
    const allVideos: any[] = [];
    
    for (let i = 0; i < allPlaylistItems.length; i += 50) {
      const batch = allPlaylistItems.slice(i, i + 50);
      const videoIds = batch.map((item: any) => item.snippet.resourceId.videoId).join(",");

      // Get video statistics, content details, and status (for privacy)
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails,status&id=${videoIds}&key=${API_KEY}`
      );
      const statsData = await statsResponse.json();
      
      if (i === 0) {
        // Log the full response to see what's available for first video
        console.log('📝 YouTube API video response (first video):', statsData.items?.[0]);
      }

      const batchVideos = statsData.items.map((item: any) => {
        // Log debug info for first video only
        if (i === 0 && item === statsData.items[0]) {
          console.log('🔍 First video data check:', {
            videoId: item.id,
            title: item.snippet.title,
            titleLength: item.snippet.title?.length,
            duration: item.contentDetails?.duration,
            views: item.statistics.viewCount,
            privacyStatus: item.status?.privacyStatus,
          });
        }
        
        return {
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
          currentViews: parseInt(item.statistics.viewCount || "0"),
          currentLikes: parseInt(item.statistics.likeCount || "0"),
          currentComments: parseInt(item.statistics.commentCount || "0"),
          duration: item.contentDetails?.duration,
          contentType: item.snippet?.liveBroadcastContent,
          privacyStatus: item.status?.privacyStatus,
        };
      });
      
      allVideos.push(...batchVideos);
      console.log(`✅ Processed batch ${Math.floor(i / 50) + 1}, total videos: ${allVideos.length}`);
    }
    
    // Auto-tag YouTube Shorts (videos < 60 seconds) and Unlisted videos
    const processedVideos = allVideos.map((video: any) => {
      const tags: string[] = [];
      
      // Check for unlisted status
      if (video.privacyStatus === 'unlisted') {
        tags.push('Unlisted');
        console.log(`🔒 Auto-tagged as Unlisted: "${video.title}"`);
      }
      
      // Check for shorts
      if (!video.duration) {
        console.log(`⚠️ Video "${video.title}" - duration unknown, keeping it`);
        return { ...video, tags };
      }
      const durationInSeconds = parseDuration(video.duration);
      const isShort = durationInSeconds < 60;
      
      if (isShort) {
        tags.push('Short');
        console.log(`📱 Auto-tagged as Short: "${video.title}" (${durationInSeconds}s)`);
      }
      
      return { ...video, tags };
    });
    
    const shortCount = processedVideos.filter(v => v.tags?.includes("Short")).length;
    const unlistedCount = processedVideos.filter(v => v.tags?.includes("Unlisted")).length;
    console.log(`✅ Total fetched: ${allVideos.length} videos`);
    console.log(`🎬 Auto-tagged: ${shortCount} Shorts`);
    console.log(`🔒 Auto-tagged: ${unlistedCount} Unlisted`);
    console.log(`📹 Public videos: ${allVideos.length - shortCount - unlistedCount}`);
    return processedVideos;
  };

  // Sync videos from YouTube to database
  const syncVideos = async () => {
    setSyncing(true);
    setQuotaExceeded(false);
    try {
      console.log("🔄 Starting YouTube sync...");
      const token = await getSessionToken();
      if (!token) {
        console.error("No session token available");
        toast.error("Authentication required. Please log in again.");
        return;
      }
      
      const youtubeVideos = await fetchYouTubeVideos();
      console.log(`✅ Fetched ${youtubeVideos.length} videos from YouTube (Shorts already filtered)`);
      
      // Get existing videos to check which ones are new
      const existingVideosMap = new Map();
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          data.videos.forEach((v: VideoData) => {
            existingVideosMap.set(v.videoId, v);
          });
          console.log(`📋 Found ${existingVideosMap.size} existing videos in database`);
        } else {
          console.log("⚠️ Failed to fetch existing videos, status:", response.status);
          throw new Error("Failed to fetch existing videos - aborting sync to prevent data loss");
        }
      } catch (err) {
        console.log("❌ CRITICAL: Could not fetch existing videos:", err);
        toast.error("Failed to fetch existing videos. Aborting sync to protect your data.");
        throw err; // Stop the sync to prevent data loss
      }
      
      // Log first video to verify data structure
      if (youtubeVideos.length > 0) {
        const firstVideo = youtubeVideos[0];
        console.log('🔍 First video to be saved:', {
          videoId: firstVideo.videoId,
          title: firstVideo.title,
          titleLength: firstVideo.title?.length,
          hasDescription: !!firstVideo.description,
          hasThumbnail: !!firstVideo.thumbnailUrl,
          views: firstVideo.currentViews,
          duration: firstVideo.duration,
          contentType: firstVideo.contentType,
        });
      }
      
      // Save each video to database
      let savedCount = 0;
      let errorCount = 0;
      
      for (const video of youtubeVideos) {
        try {
          // Remove fields that shouldn't be saved to database
          const { contentType, tags, ...videoToSave } = video;
          
          // Handle tags: preserve existing tags for existing videos, apply auto-tags for new videos
          const existingVideo = existingVideosMap.get(video.videoId);
          const isNewVideo = !existingVideo;
          
          if (isNewVideo) {
            // New video: apply auto-tags (like "Short")
            (videoToSave as any).tags = tags || [];
            console.log(`🆕 NEW VIDEO: "${video.title?.substring(0, 40)}" - applying tags: ${JSON.stringify(tags || [])}`);
          } else if (existingVideo) {
            // Existing video: ALWAYS preserve existing tags
            const existingTags = existingVideo.tags || [];
            // Auto-tag Shorts and Unlisted if not already tagged (for videos added before auto-tagging)
            let updatedTags = [...existingTags];
            let tagsAdded = false;
            
            if (tags && tags.includes("Short") && !existingTags.includes("Short")) {
              updatedTags.push("Short");
              tagsAdded = true;
            }
            
            // Check both: current sync tags AND privacy status from the video data
            if ((tags && tags.includes("Unlisted") || video.privacyStatus === 'unlisted') && !existingTags.includes("Unlisted")) {
              updatedTags.push("Unlisted");
              tagsAdded = true;
            }
            
            (videoToSave as any).tags = updatedTags;
            
            if (tagsAdded) {
              console.log(`🏷️ EXISTING VIDEO: "${video.title?.substring(0, 40)}" - added auto-tags. Tags: ${JSON.stringify(updatedTags)}`);
            } else {
              console.log(`🏷️ EXISTING VIDEO: "${video.title?.substring(0, 40)}" - preserved tags: ${JSON.stringify(existingTags)}`);
            }
          } else {
            // This should never happen, but just in case
            console.log(`⚠️ WARNING: Video "${video.title}" not found in existingVideosMap but isNewVideo is false!`);
            (videoToSave as any).tags = tags || [];
          }
          
          // Log videos being saved to verify tags are preserved
          if (savedCount < 3 || (videoToSave as any).tags?.length > 0) {
            console.log(`📤 Saving video #${savedCount + 1} to database:`, {
              videoId: videoToSave.videoId,
              title: videoToSave.title?.substring(0, 50),
              duration: videoToSave.duration,
              isNew: isNewVideo,
              tagsBeingSent: (videoToSave as any).tags,
              existingTags: existingVideo?.tags,
              tagsFromYouTube: tags,
            });
          }
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(videoToSave),
            }
          );
          
          if (response.ok) {
            savedCount++;
            const result = await response.json();
            
            // Verify tags were preserved in the response
            if (!isNewVideo && existingVideo?.tags?.length > 0) {
              const returnedTags = result.video?.tags || [];
              if (returnedTags.length === 0) {
                console.log(`❌ TAG LOSS DETECTED for "${video.title?.substring(0, 40)}":`, {
                  videoId: video.videoId,
                  sentTags: (videoToSave as any).tags,
                  existingTags: existingVideo.tags,
                  returnedTags: returnedTags,
                  message: "Tags were lost during save! Server returned empty tags array."
                });
              } else if (returnedTags.length !== existingVideo.tags.length) {
                console.warn(`⚠️ TAG MISMATCH for "${video.title?.substring(0, 40)}":`, {
                  videoId: video.videoId,
                  sentTags: (videoToSave as any).tags,
                  existingTags: existingVideo.tags,
                  returnedTags: returnedTags
                });
              }
            }
            
            if (savedCount === 1) {
              console.log(`✅ First video saved successfully. Returned data:`, {
                videoId: result.video?.videoId,
                title: result.video?.title,
                hasAllFields: !!(result.video?.title && result.video?.thumbnailUrl && result.video?.currentViews !== undefined),
              });
            } else {
              console.log(`✅ Saved: ${video.title}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ Failed to save "${video.title}" (${video.videoId}):`, errorText);
            errorCount++;
          }
        } catch (err) {
          console.log(`❌ Error saving video "${video.title}" (${video.videoId}):`, err);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast.success(`Synced ${savedCount} videos from YouTube${errorCount > 0 ? ` (${errorCount} errors)` : ''}`);
        
        // Prompt user to import reach data after successful sync
        setShowPostSyncReachPrompt(true);
      } else {
        toast.error("No videos were saved. Check console for errors.");
      }
      
      console.log(`📊 Sync complete: ${savedCount} saved, ${errorCount} errors`);
      await fetchDatabaseVideos();
      setQuotaExceeded(false);
    } catch (error) {
      console.log("❌ Error syncing videos:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
        setQuotaExceeded(true);
        toast.error("YouTube API quota exceeded. Use 'Add Video' to manually add videos by ID.");
      } else {
        toast.error(`Failed to sync videos: ${errorMessage}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Manually add a single video by ID
  const addVideoManually = async () => {
    if (!addVideoId.trim()) {
      toast.error("Please enter a video ID");
      return;
    }

    setAddingVideo(true);
    const token = await getSessionToken();
    if (!token) {
      console.error("No session token available");
      toast.error("Authentication required. Please log in again.");
      setAddingVideo(false);
      return;
    }
    
    try {
      // Fetch video data from YouTube
      const stats = await fetchVideoStats(addVideoId.trim());
      
      // Auto-tag if it's a Short
      const tags = stats.isShort ? ["Short"] : [];
      
      // Create video object
      const videoData = {
        videoId: addVideoId.trim(),
        title: stats.title,
        description: stats.description,
        publishedAt: stats.publishedAt,
        thumbnailUrl: stats.thumbnailUrl,
        currentViews: stats.currentViews,
        currentLikes: stats.currentLikes,
        currentComments: stats.currentComments,
        duration: stats.duration,
        tags: tags,
      };
      
      // Save to database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(videoData),
        }
      );
      
      if (response.ok) {
        toast.success(`Added video: ${stats.title}`);
        await fetchDatabaseVideos();
        setShowAddVideoDialog(false);
        setAddVideoId("");
      } else {
        throw new Error("Failed to save video");
      }
    } catch (error) {
      console.log("Error adding video:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
        setQuotaExceeded(true);
        toast.error("YouTube API quota exceeded. Try again tomorrow (resets midnight Pacific Time).");
      } else {
        toast.error(`Failed to add video: ${errorMessage}`);
      }
    } finally {
      setAddingVideo(false);
    }
  };

  // Open sync date range dialog
  const openSnapshotNoteDialog = (videoId: string) => {
    try {
      console.log("🎯 ==============================================");
      console.log("🎯 SYNC BUTTON CLICKED");
      console.log("🎯 ==============================================");
      console.log("🎯 Video ID:", videoId);
      console.log("🎯 Current dateRangeFilter state:", dateRangeFilter);
      console.log("🎯 Will take snapshot with dateRange:", dateRangeFilter);
      console.log("🎯 Expected snapshot dateRange field:", dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28');
      console.log("🎯 ==============================================");
      // Call takeSnapshot directly with the current filter (no dialog)
      takeSnapshot(videoId, false, "", dateRangeFilter);
    } catch (error) {
      console.log("❌ ERROR in openSnapshotNoteDialog:", error);
      toast.error("Error syncing video: " + error);
    }
  };
  
  // Take analytics snapshot (with optional note and date range override)
  const takeSnapshot = async (videoId: string, silent = false, note?: string, dateRangeOverride?: 'last28' | 'sincePublished') => {
    console.log("🚨🚨🚨 takeSnapshot CALLED! videoId:", videoId, "analyticsConnected:", analyticsConnected);
    if (!silent) setTakingSnapshot(true);
    
    // Use override if provided, otherwise use current filter
    const effectiveDateRange = dateRangeOverride || dateRangeFilter;
    console.log(`📅 Requesting date range: ${effectiveDateRange} ${dateRangeOverride ? '(override)' : '(from filter)'}`);
    
    // Find video to check publish date
    const video = videos.find(v => v.videoId === videoId);
    if (video && effectiveDateRange === 'last28') {
      const publishedDate = new Date(video.publishedAt);
      const now = new Date();
      const daysOld = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOld < 28) {
        console.log(`⚠️  WARNING: Video "${video.title}" is only ${daysOld} days old.`);
        console.log(`   📊 For videos newer than 28 days, "Last 28 Days" and "Lifetime" data are IDENTICAL.`);
        console.log(`   💡 This may create confusing duplicate snapshots. Consider using "Lifetime" for new videos.`);
        // Keep as last28 per user request
      }
    }
    
    try {
      // First, get fresh data from YouTube
      console.log("📸 Fetching video stats for:", videoId);
      const stats = await fetchVideoStats(videoId);
      console.log("📸 Got video stats:", stats);
      
      // If YouTube Analytics is connected, try to fetch advanced analytics
      let advancedAnalytics = null;
      if (analyticsConnected) {
        try {
          console.log("📸 Taking snapshot - fetching analytics for:", videoId);
          
          // Get fresh Supabase session token
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.access_token) {
            console.log("⚠️ No session available - skipping analytics data");
          } else {
            // Pass publishedAt so server can check video age even if not in DB yet
            const publishedAtParam = video?.publishedAt ? `&publishedAt=${encodeURIComponent(video.publishedAt)}` : '';
            const analyticsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${videoId}?dateRange=${effectiveDateRange}${publishedAtParam}&v=${Date.now()}`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );
          
          console.log("📸 Snapshot analytics response status:", analyticsResponse.status);
          
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log("📸 Snapshot analytics data:", analyticsData);
            
            // DEBUG: Log raw YouTube API response structure
            if (analyticsData._debug) {
              console.log("🔍 === YOUTUBE API DEBUG INFO (SNAPSHOT) ===");
              console.log("📋 Column Headers:", analyticsData._debug.columnHeaders);
              console.log("📊 Data Rows:", analyticsData._debug.rows);
              console.log("📝 Requested Metrics:", analyticsData._debug.requestedMetrics);
              console.log("🎯 IMPRESSIONS DEBUG:");
              console.log("  - impressionsFetched:", analyticsData._debug.impressionsFetched);
              console.log("  - impressionsValue:", analyticsData._debug.impressionsValue);
              console.log("  - note:", analyticsData._debug.impressionsNote);
              
              if (analyticsData._debug.impressionsDebug) {
                console.log("🔍 DETAILED IMPRESSIONS FETCH DEBUG:");
                console.log("  - Attempted:", analyticsData._debug.impressionsDebug.attempted);
                console.log("  - Success:", analyticsData._debug.impressionsDebug.success);
                console.log("  - Response Status:", analyticsData._debug.impressionsDebug.responseStatus);
                console.log("  - Response OK:", analyticsData._debug.impressionsDebug.responseOk);
                console.log("  - Has Rows:", analyticsData._debug.impressionsDebug.hasRows);
                console.log("  - Row Count:", analyticsData._debug.impressionsDebug.rowCount);
                console.log("  - Raw Value:", analyticsData._debug.impressionsDebug.rawValue);
                console.log("  - Error:", analyticsData._debug.impressionsDebug.error);
              }
              console.log("==========================================");
            }
            
            if (analyticsData.analytics) {
              advancedAnalytics = analyticsData.analytics;
              
              // CRITICAL FIX: Use realtime data ONLY for lifetime mode
              // For "last28" mode, we MUST use the Analytics API data as-is (even if delayed)
              // because realtime data is LIFETIME, not 28-day data
              if (analyticsData.useRealtimeViews && effectiveDateRange === 'sincePublished') {
                console.log("🔄🔄🔄 USING REALTIME DATA for LIFETIME snapshot (Analytics API has delay) 🔄🔄🔄");
                console.log("  - Video age:", analyticsData.daysSincePublish, "days");
                console.log("  - Analytics API views (delayed):", advancedAnalytics.views);
                console.log("  - Realtime Data API views:", stats.currentViews);
                console.log("  - OVERRIDING with realtime views for snapshot!");
                
                // Override with realtime data
                advancedAnalytics.views = stats.currentViews;
                advancedAnalytics.likes = stats.currentLikes;
                advancedAnalytics.comments = stats.currentComments;
              } else if (analyticsData.useRealtimeViews && effectiveDateRange === 'last28') {
                console.log("⚠️ WARNING: Server suggested useRealtimeViews but we're in LAST28 mode");
                console.log("  - NOT using realtime data because realtime = lifetime, not 28-day");
                console.log("  - Using Analytics API 28-day data:", advancedAnalytics.views, "views");
              }
              
              console.log("✅✅✅ ANALYTICS DATA RECEIVED ✅✅✅");
              console.log("  - Final date range for snapshot:", effectiveDateRange);
              console.log("  - Views returned by Analytics API:", advancedAnalytics.views);
              console.log("  - Likes returned by Analytics API:", advancedAnalytics.likes);
              console.log("  - Comments returned by Analytics API:", advancedAnalytics.comments);
              console.log("  - This is the data that will be saved to the snapshot");
              console.log("  - If these numbers look wrong, check the server logs for the YouTube API response");
            } else {
              console.warn("⚠️ Analytics response OK but no analytics data in response");
              console.warn("⚠️ Full response:", analyticsData);
            }
          } else {
            const errorData = await analyticsResponse.json().catch(() => ({}));
            
            // Check if OAuth session expired
            if (errorData.error?.includes('OAuth session expired') || errorData.error?.includes('Please reconnect')) {
              console.log("❌ Analytics API Error: OAuth session expired");
              setAnalyticsConnected(false);
              if (!silent) {
                toast.error('YouTube Analytics session expired. Please reconnect in Settings.');
              }
            } else if (errorData.error?.includes('No analytics data available') || analyticsResponse.status === 404) {
              // Video has no analytics data (too new, private, unlisted, etc.)
              // This is NOT an error - we'll just use basic metrics
              console.log('ℹ️  No analytics data available for this video (too new, private, or no views). Using basic metrics only.');
            } else {
              // Actual error that needs attention
              console.log("❌ Analytics API Error:");
              console.log("  - Status:", analyticsResponse.status);
              console.log("  - Error:", errorData.error || 'Unknown error');
              if (!silent) {
                toast.error(`Analytics unavailable: ${errorData.error || 'Unknown error'}`);
              }
            }
          }
          }
        } catch (err) {
          console.log("❌ Exception fetching analytics:", err instanceof Error ? err.message : err);
          console.log("ℹ️  Continuing with basic metrics only");
          if (!silent) {
            toast.error("Could not fetch analytics. Using basic metrics only.");
          }
        }
      } else {
        console.log("ℹ️ Analytics not connected - using basic snapshot");
      }
      
      console.log("🚀 Preparing to save snapshot...");
      console.log("📊 Analytics connected:", analyticsConnected);
      console.log("📊 Got advanced analytics:", !!advancedAnalytics);
      console.log("📊 Date range for this snapshot:", effectiveDateRange);
      console.log("📊 Current date range filter:", dateRangeFilter);
      
      if (advancedAnalytics) {
        console.log("📊 Advanced analytics views:", advancedAnalytics.views);
        console.log("📊 Advanced analytics likes:", advancedAnalytics.likes);
        console.log("📊 Advanced analytics comments:", advancedAnalytics.comments);
      }
      console.log("📊 Stats (lifetime) views:", stats.currentViews);
      console.log("📊 Stats (lifetime) likes:", stats.currentLikes);
      console.log("📊 Stats (lifetime) comments:", stats.currentComments);
      
      // Note: If analytics are connected but no data is available (e.g., video is too new, private, or unlisted),
      // we'll still allow the snapshot to be created with basic metrics from YouTube Data API.
      // This is better than blocking the snapshot entirely.
      if (analyticsConnected && !advancedAnalytics) {
        console.log("ℹ️  Analytics connected but no advanced data available. Using basic metrics.");
        console.log("ℹ️  This can happen if the video is too new, private, unlisted, or has no views yet.");
      }
      
      // Choose endpoint based on whether we have advanced analytics
      const endpoint = advancedAnalytics 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/advanced-snapshot`
        : `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/snapshot`;
      
      console.log("🎯 Snapshot endpoint:", endpoint);
      
      // Build payload with advanced analytics if available
      // NOTE: Impressions and CTR are never included from YouTube Analytics API
      // They must be manually imported via CSV - the API doesn't provide this data
      const payload: any = advancedAnalytics
        ? {
            views: advancedAnalytics.views, // Use analytics views for the date range, not total views
            likes: advancedAnalytics.likes,
            comments: advancedAnalytics.comments,
            averageViewDuration: advancedAnalytics.averageViewDuration,
            averageViewPercentage: advancedAnalytics.averageViewPercentage,
            estimatedMinutesWatched: advancedAnalytics.estimatedMinutesWatched,
            topTrafficSource: advancedAnalytics.topTrafficSource,
            topTrafficSourcePercentage: advancedAnalytics.topTrafficSourcePercentage,
            allTrafficSources: advancedAnalytics.allTrafficSources, // Include all traffic sources
            note: note || undefined,
            dateRange: effectiveDateRange === 'sincePublished' ? 'lifetime' : 'last28', // SMART SYNC: Pass chosen date range
          }
        : {
            views: stats.currentViews, // Only used when analytics NOT connected
            likes: stats.currentLikes,
            comments: stats.currentComments,
            note: note || undefined,
            dateRange: effectiveDateRange === 'sincePublished' ? 'lifetime' : 'last28', // SMART SYNC: Pass chosen date range
          };
      
      console.log("📊 Snapshot will use views:", payload.views, advancedAnalytics ? "(from Analytics API for date range)" : "(lifetime total - analytics not connected)");
      
      // Impressions and CTR are NOT included - they must be manually imported via CSV
      
      console.log("��� Snapshot payload:", payload);
      console.log("🌐 Making POST request to snapshot endpoint...");
      
      // Get session token for authenticated request
      const token = await getSessionToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const snapshotResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      console.log("📡 Snapshot response received! Status:", snapshotResponse.status);
      console.log("📡 Response OK?", snapshotResponse.ok);

      console.log("📦 Snapshot response received, parsing...");
      const snapshotData = await snapshotResponse.json();
      console.log("📦 Snapshot data parsed:", snapshotData);
      
      // Log debug data if available
      if (snapshotData._debug) {
        console.log("🐛 DEBUG DATA FROM SERVER:", snapshotData._debug);
        console.log("🐛 Impressions debug:", {
          impressionsFetched: snapshotData._debug.impressionsFetched,
          impressionsValue: snapshotData._debug.impressionsValue,
          note: snapshotData._debug.impressionsNote
        });
      }
      
      const oldCount = selectedVideo?.analyticsHistory?.length || 0;
      const newCount = snapshotData.video?.analyticsHistory?.length || 0;
      console.log(`📊 Snapshot counts - Old: ${oldCount}, New: ${newCount}`);
      
      if (snapshotData.success) {
        console.log("✅ Snapshot was successful! Processing...");
        const message = advancedAnalytics 
          ? (note ? "Advanced analytics captured with note" : "Advanced analytics captured")
          : (note ? "Basic data captured with note" : "Basic data captured");
        
        console.log("🔔 Showing toast notifications...");
        if (!silent) {
          // Check for new video with Analytics API delay
          if (effectiveDateRange === 'last28' && advancedAnalytics && stats) {
            const publishDate = new Date(snapshotData.video.publishedAt);
            const daysSincePublish = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
            const missingViews = stats.currentViews - advancedAnalytics.views;
            
            if (daysSincePublish <= 30 && missingViews > 5) {
              toast.warning(`⏱️ Note: Analytics API has a 2-3 day delay. This ${daysSincePublish}-day-old video snapshot shows ${advancedAnalytics.views} views, but currently has ${stats.currentViews} realtime views. For new videos, use "Lifetime" mode for more complete data.`, {
                duration: 10000,
              });
            }
          }
          
          toast.success(message);
          toast.info(`Sync History: ${oldCount} → ${newCount}`);
          toast.success('✅ Data added to Overview analytics', { duration: 3000 });
        }
        
        console.log("🔄 Updating videos state...");
        // Update the video in the local state with functional updates to ensure fresh state
        setVideos(prevVideos => prevVideos.map(v => 
          v.videoId === videoId ? { ...snapshotData.video } : v
        ));
        
        console.log("🎯 Checking if we need to update selectedVideo...", {
          selectedVideoId: selectedVideo?.videoId,
          snapshotVideoId: videoId,
          match: selectedVideo?.videoId === videoId
        });
        
        if (selectedVideo?.videoId === videoId) {
          console.log("🔄 Updating selectedVideo state...");
          // Create a new object reference to force React to re-render
          setSelectedVideo({ ...snapshotData.video });
          console.log("✅ selectedVideo state updated!");
          
          // Show confirmation
          if (!silent) {
            setTimeout(() => {
              console.log("🔔 Showing final confirmation toast...");
              toast.success(`✅ UI updated! Now showing ${snapshotData.video.analyticsHistory.length} history entries`);
            }, 300);
          }
        }
        console.log("✅ Snapshot processing complete!");
      } else {
        console.error("❌ Snapshot failed! Response:", snapshotData);
      }
    } catch (error) {
      console.error("Error taking snapshot:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
        if (!silent) {
          toast.error("API quota exceeded. Manual data capture requires API access.");
        }
      } else {
        if (!silent) toast.error("Failed to capture analytics data");
      }
    } finally {
      if (!silent) setTakingSnapshot(false);
    }
  };
  
  // Confirm and take snapshot with note
  const confirmSnapshotWithNote = async () => {
    console.log("✅ Snapshot confirmed! Starting snapshot process...");
    if (!pendingSnapshotVideoId) {
      console.error("❌ No pending snapshot video ID!");
      return;
    }
    
    console.log("📸 Calling takeSnapshot for videoId:", pendingSnapshotVideoId);
    setShowSnapshotNoteDialog(false);
    await takeSnapshot(pendingSnapshotVideoId, false, snapshotNote);
    setPendingSnapshotVideoId(null);
    setSnapshotNote("");
  };
  
  // Confirm sync with chosen date range
  const confirmSyncWithDateRange = async () => {
    if (!pendingSnapshotVideoId) return;
    
    setShowSyncDateRangeDialog(false);
    
    // Pass the chosen date range directly to takeSnapshot
    await takeSnapshot(pendingSnapshotVideoId, false, "", syncDateRangeChoice);
    setPendingSnapshotVideoId(null);
  };

  // Check for video updates
  const checkVideoUpdate = async (videoId: string) => {
    try {
      const token = await getSessionToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      
      const stats = await fetchVideoStats(videoId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/check-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(stats),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned non-JSON response (likely HTML error page)");
        toast.error("Server temporarily unavailable. Please try again in a moment.");
        return;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.updated) {
        toast.success("Video metadata updated from YouTube");
        setVideos(videos.map(v => 
          v.videoId === videoId ? data.video : v
        ));
        
        if (selectedVideo?.videoId === videoId) {
          setSelectedVideo({ ...data.video });
        }
      } else {
        toast.info("Video is already up to date");
      }
    } catch (error) {
      console.error("Error checking video update:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("Server temporarily unavailable")) {
        toast.error("Server temporarily unavailable. Please try again in a moment.");
      } else {
        toast.error("Failed to check for updates. Please try again.");
      }
    }
  };

  // Refresh all data (stats + analytics) - combines basic stats and advanced analytics
  const refreshAllData = async () => {
    if (videos.length === 0) {
      toast.error("No videos in database. Click 'Sync from YouTube' first.");
      return;
    }
    
    const token = await getSessionToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    
    setCheckingUpdates(true);
    setFetchingAnalytics(true);
    setQuotaExceeded(false);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    console.log(`🔄 Refreshing all data (stats + analytics) for ${videos.length} videos...`);
    
    // Validate YouTube video ID format (11 characters, alphanumeric with dashes/underscores)
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    
    try {
      for (const video of videos) {
        // Skip invalid video IDs
        if (!videoIdPattern.test(video.videoId)) {
          console.log(`⚠️ Skipping invalid video ID: ${video.videoId}`);
          skippedCount++;
          continue;
        }
        
        try {
          console.log(`📊 Fetching stats for: ${video.title || video.videoId}`);
          
          // Fetch fresh data from YouTube
          const stats = await fetchVideoStats(video.videoId);
          
          console.log(`✅ Got stats for ${video.videoId}:`, {
            views: stats.currentViews,
            likes: stats.currentLikes,
            title: stats.title
          });
          
          // Update the video with complete data
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/check-update`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(stats),
            }
          );

          if (response.ok) {
            successCount++;
            console.log(`✅ Updated database for ${video.videoId}`);
          } else {
            const errorText = await response.text();
            console.error(`❌ Failed to update ${video.videoId}:`, errorText);
            errorCount++;
          }
          
          // 2. Fetch advanced analytics if connected
          // NOTE: Impressions and CTR will NOT be included - they must be manually imported via CSV
          if (analyticsConnected) {
            try {
              // Get fresh Supabase session token
              const supabase = getSupabaseClient();
              const { data: { session } } = await supabase.auth.getSession();
              
              if (!session?.access_token) {
                console.log("⚠️ No session available - skipping analytics sync for", video.videoId);
                continue; // Skip this video's analytics
              }
              
              const analyticsResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${video.videoId}`,
                {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                }
              );
              
              if (analyticsResponse.ok) {
                const data = await analyticsResponse.json();
                
                if (data.analytics) {
                  // Check if video is younger than 28 days
                  const publishedDate = new Date(video.publishedAt);
                  const now = new Date();
                  const daysOld = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
                  

                  if (daysOld < 28 && dateRangeFilter === 'last28') {
                    console.log(`⚠️  WARNING: Video "${video.title}" is only ${daysOld} days old.`);
                    console.log(`   📊 For videos newer than 28 days, "Last 28 Days" and "Lifetime" data are IDENTICAL.`);
                    console.log(`   💡 This may create confusing duplicate snapshots. Consider using "Lifetime" for new videos.`);
                  }
                  
                  // Save the analytics data (without impressions/CTR - manual import only)
                  // SMART SYNC: Include the current date range filter
                  const analyticsPayload: any = {
                    views: data.analytics.views,
                    likes: data.analytics.likes,
                    comments: data.analytics.comments,
                    averageViewDuration: data.analytics.averageViewDuration,
                    averageViewPercentage: data.analytics.averageViewPercentage,
                    topTrafficSource: data.analytics.topTrafficSource,
                    topTrafficSourcePercentage: data.analytics.topTrafficSourcePercentage,
                    allTrafficSources: data.analytics.allTrafficSources, // Include all traffic sources
                    dateRange: dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28', // Pass current filter
                  };
                  // impressions and CTR are NOT included - they must be manually imported
                  
                  const snapshotResponse = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(analyticsPayload),
                    }
                  );
                  
                  if (!snapshotResponse.ok) {
                    const errorText = await snapshotResponse.text();
                    console.error(`❌ Failed to save analytics snapshot for ${video.videoId}:`, errorText);
                  } else {
                    console.log(`✅ Analytics saved for: ${video.title}`);
                  }
                }
              } else {
                const errorData = await analyticsResponse.json().catch(() => ({}));
                console.log(`⏭️  Analytics not available for: ${video.title}`, errorData.error);
                
                // Check if OAuth session expired
                if (errorData.error?.includes('OAuth session expired') || errorData.error?.includes('Please reconnect')) {
                  setAnalyticsConnected(false);
                  toast.error('YouTube Analytics session expired. Please reconnect in Settings.');
                  return; // Stop processing
                }
              }
            } catch (analyticsError) {
              console.log(`⚠️ Analytics fetch failed for: ${video.title}`, analyticsError);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (error) {
          console.error(`❌ Failed to fetch data for video ${video.videoId}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
            setQuotaExceeded(true);
            toast.error("YouTube API quota exceeded. Try again tomorrow.");
            break; // Stop processing if quota is exceeded
          }
          
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully fetched data for ${successCount} video(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}${skippedCount > 0 ? `. ${skippedCount} invalid entries skipped` : ''}`);  
        await fetchDatabaseVideos();
      } else if (skippedCount > 0) {
        toast.warning(`Skipped ${skippedCount} invalid video entries. Use "Clean Up Invalid Entries" to remove them.`);
      } else {
        toast.error("Failed to fetch video data. Check if API quota is exceeded.");
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
      toast.error("Failed to fetch video data");
    } finally {
      setCheckingUpdates(false);
      setFetchingAnalytics(false);
    }
  };

  // Combined sync and refresh: Get all videos from YouTube (including new ones) AND refresh their data
  const syncAndRefreshAll = async (dateRange?: 'last28' | 'sincePublished', videoIdsToSync?: string[]) => {
    setSyncing(true);
    setQuotaExceeded(false);
    
    const token = await getSessionToken();
    if (!token) {
      toast.error("Authentication required");
      setSyncing(false);
      return;
    }
    
    // Use provided date range or default to 'sincePublished'
    const effectiveDateRange = dateRange || 'sincePublished';
    const syncingFiltered = videoIdsToSync && videoIdsToSync.length > 0;
    console.log(`🔄 Main YouTube Sync using date range: ${effectiveDateRange}${syncingFiltered ? ` (filtering to ${videoIdsToSync.length} videos)` : ''}`);
    
    try {
      // Step 1: Sync videos from YouTube (this gets all videos including new ones)
      console.log("�� Step 1: Syncing videos from YouTube...");
      const youtubeVideos = await fetchYouTubeVideos();
      console.log(`✅ Fetched ${youtubeVideos.length} videos from YouTube`);
      
      // Filter videos if specific IDs are provided
      const videosToProcess = syncingFiltered 
        ? youtubeVideos.filter(v => videoIdsToSync.includes(v.videoId))
        : youtubeVideos;
      
      if (syncingFiltered) {
        console.log(`📋 Filtered to ${videosToProcess.length} videos (from ${videoIdsToSync.length} requested)`);
      }
      
      // Get existing videos to preserve tags
      const existingVideosMap = new Map();
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          data.videos.forEach((v: VideoData) => {
            existingVideosMap.set(v.videoId, v);
          });
          console.log(`📋 Found ${existingVideosMap.size} existing videos for tag preservation`);
        }
      } catch (err) {
        console.error("⚠️ Could not fetch existing videos for tag preservation:", err);
      }
      
      // Save each video to database
      let savedCount = 0;
      let errorCount = 0;
      
      for (const video of videosToProcess) {
        try {
          // Remove fields that shouldn't be saved to database
          const { contentType, tags, ...videoToSave } = video;
          
          // Handle tags: preserve existing tags for existing videos, apply auto-tags for new videos
          const existingVideo = existingVideosMap.get(video.videoId);
          const isNewVideo = !existingVideo;
          
          if (isNewVideo) {
            // New video: apply auto-tags (like "Short")
            (videoToSave as any).tags = tags || [];
            console.log(`🆕 NEW VIDEO: "${video.title?.substring(0, 40)}" - applying tags: ${JSON.stringify(tags || [])}`);
          } else if (existingVideo) {
            // Existing video: ALWAYS preserve existing tags
            const existingTags = existingVideo.tags || [];
            // Auto-tag Shorts and Unlisted if not already tagged (for videos added before auto-tagging)
            let updatedTags = [...existingTags];
            let tagsAdded = false;
            
            if (tags && tags.includes("Short") && !existingTags.includes("Short")) {
              updatedTags.push("Short");
              tagsAdded = true;
            }
            
            // Check both: current sync tags AND privacy status from the video data
            if ((tags && tags.includes("Unlisted") || video.privacyStatus === 'unlisted') && !existingTags.includes("Unlisted")) {
              updatedTags.push("Unlisted");
              tagsAdded = true;
            }
            
            (videoToSave as any).tags = updatedTags;
            
            if (tagsAdded) {
              console.log(`🏷️ EXISTING VIDEO: "${video.title?.substring(0, 40)}" - added auto-tags. Tags: ${JSON.stringify(updatedTags)}`);
            } else {
              console.log(`🏷️ EXISTING VIDEO: "${video.title?.substring(0, 40)}" - preserved tags: ${JSON.stringify(existingTags)}`);
            }
          }
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(videoToSave),
            }
          );
          
          if (response.ok) {
            savedCount++;
            console.log(`✅ Saved: ${video.title}`);
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      console.log(`📊 Sync complete: ${savedCount} saved, ${errorCount} errors`);
      
      // Reload the database to get the updated list
      await fetchDatabaseVideos();
      
      if (savedCount > 0) {
        toast.success(`Synced ${savedCount} ${syncingFiltered ? 'filtered ' : ''}video${savedCount !== 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} error${errorCount !== 1 ? 's' : ''})` : ''}`);
      }
      
      // Step 2: Refresh analytics for all videos
      console.log(`🔄 Step 2: Refreshing analytics for ${syncingFiltered ? 'filtered' : 'all'} videos...`);
      setSyncing(false); // End syncing state
      setCheckingUpdates(true);
      setFetchingAnalytics(true);
      
      // Get the current videos from state (after sync)
      const allCurrentVideos = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(res => res.json()).then(data => data.videos || []);
      
      // Filter videos if specific IDs are provided
      const currentVideos = syncingFiltered
        ? allCurrentVideos.filter(v => videoIdsToSync.includes(v.videoId))
        : allCurrentVideos;
      
      if (syncingFiltered) {
        console.log(`📋 Refreshing analytics for ${currentVideos.length} filtered videos`);
      }
      
      let successCount = 0;
      let analyticsErrorCount = 0;
      const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
      
      for (const video of currentVideos) {
        if (!videoIdPattern.test(video.videoId)) {
          continue;
        }
        
        try {
          // Fetch fresh stats
          const stats = await fetchVideoStats(video.videoId);
          
          // Update video in database
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/check-update`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(stats),
            }
          );

          if (response.ok) {
            successCount++;
          }
          
          // Fetch analytics if connected
          if (analyticsConnected) {
            try {
              // Get fresh Supabase session token
              const supabase = getSupabaseClient();
              const { data: { session } } = await supabase.auth.getSession();
              
              if (!session?.access_token) {
                console.log("⚠️ No session available - skipping analytics for", video.videoId);
                continue; // Skip this video's analytics
              }
              
              // Pass publishedAt so server can check video age even if not in DB yet
              const publishedAtParam = video.publishedAt ? `&publishedAt=${encodeURIComponent(video.publishedAt)}` : '';
              const analyticsResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${video.videoId}?dateRange=${effectiveDateRange}${publishedAtParam}`,
                {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                }
              );
              
              if (analyticsResponse.ok) {
                const data = await analyticsResponse.json();
                
                if (data.analytics) {
                  // Check if server flagged this for realtime data override
                  console.log(`📊 Analytics response for "${video.title}":`, {
                    useRealtimeViews: data.useRealtimeViews,
                    effectiveDateRange: data.effectiveDateRange,
                    apiViews: data.analytics.views,
                    currentViews: stats.currentViews
                  });
                  
                  // For young videos, server returns useRealtimeViews=true
                  // In this case, use current stats instead of Analytics API data
                  const finalViews = data.useRealtimeViews ? stats.currentViews : data.analytics.views;
                  const finalLikes = data.useRealtimeViews ? stats.currentLikes : data.analytics.likes;
                  const finalComments = data.useRealtimeViews ? stats.currentComments : data.analytics.comments;
                  
                  // Use effectiveDateRange from server (may differ from requested)
                  const finalDateRange = data.effectiveDateRange || effectiveDateRange;
                  
                  console.log(`💾 Saving snapshot with ${data.useRealtimeViews ? 'REALTIME' : 'ANALYTICS'} data:`, {
                    views: finalViews,
                    dateRange: finalDateRange === 'sincePublished' ? 'lifetime' : 'last28'
                  });
                  
                  const analyticsPayload: any = {
                    views: finalViews,
                    likes: finalLikes,
                    comments: finalComments,
                    averageViewDuration: data.analytics.averageViewDuration,
                    averageViewPercentage: data.analytics.averageViewPercentage,
                    estimatedMinutesWatched: data.analytics.estimatedMinutesWatched,
                    topTrafficSource: data.analytics.topTrafficSource,
                    topTrafficSourcePercentage: data.analytics.topTrafficSourcePercentage,
                    allTrafficSources: data.analytics.allTrafficSources, // Include all traffic sources
                    dateRange: finalDateRange === 'sincePublished' ? 'lifetime' : 'last28',
                  };
                  
                  await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(analyticsPayload),
                    }
                  );
                }
              } else {
                const errorData = await analyticsResponse.json().catch(() => ({}));
                console.log(`⏭️  Analytics not available for: ${video.title}`, errorData.error);
                
                // Check if OAuth session expired
                if (errorData.error?.includes('OAuth session expired') || errorData.error?.includes('Please reconnect')) {
                  setAnalyticsConnected(false);
                  console.log('YouTube Analytics session expired during automated snapshot');
                  return; // Stop processing
                }
              }
            } catch (analyticsError) {
              console.log(`⚠️ Analytics fetch failed for: ${video.title}`, analyticsError);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
            setQuotaExceeded(true);
            toast.error("YouTube API quota exceeded. Try again tomorrow.");
            break;
          }
          
          analyticsErrorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Refreshed analytics for ${successCount} video(s)`);
      }
      
      await fetchDatabaseVideos();
      setQuotaExceeded(false);
      
    } catch (error) {
      console.error("❌ Error in sync and refresh:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("quota exceeded") || errorMessage.includes("quotaExceeded")) {
        setQuotaExceeded(true);
        toast.error("YouTube API quota exceeded. Try again tomorrow.");
      } else {
        toast.error(`Failed to sync and refresh: ${errorMessage}`);
      }
    } finally {
      setSyncing(false);
      setCheckingUpdates(false);
      setFetchingAnalytics(false);
    }
  };

  // Auto-create snapshots for milestone days (4, 7, 28 days after publish)
  // Fetches actual historical data from YouTube Analytics API for accurate milestone stats
  const createMilestoneSnapshots = async () => {
    if (videos.length === 0) {
      toast.error("No videos in database");
      return;
    }
    
    if (!analyticsConnected) {
      toast.error("YouTube Analytics not connected. Please connect OAuth first.");
      return;
    }
    
    setTakingSnapshot(true);
    const MILESTONES = [4, 7, 28]; // Days after publish
    let snapshotsCreated = 0;
    let skippedCount = 0;
    let shortsSkipped = 0;
    let noDataSkipped = 0;
    let apiErrors = 0;
    
    try {
      console.log(`🎯 Checking milestone snapshots for ${videos.length} videos...`);
      
      for (const video of videos) {
        // Skip YouTube Shorts (videos under 60 seconds)
        // Also skip videos without duration data
        if (!video.duration) {
          console.log(`⚠️ Skipping video without duration: "${video.title}"`);
          continue;
        }
        
        const durationInSeconds = parseDuration(video.duration);
        if (durationInSeconds < 60) {
          shortsSkipped++;
          console.log(`⏭️ Skipping Short: "${video.title}" (${durationInSeconds}s)`);
          continue;
        }
        
        const publishDate = new Date(video.publishedAt);
        const now = new Date();
        const daysSincePublish = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`📅 "${video.title}": ${daysSincePublish} days since publish, duration: ${durationInSeconds}s`);
        
        for (const milestone of MILESTONES) {
          // Only create snapshot if we've passed the milestone
          if (daysSincePublish >= milestone) {
            // Calculate the milestone date (publish date + milestone days)
            const milestoneDate = new Date(publishDate);
            milestoneDate.setDate(milestoneDate.getDate() + milestone);
            
            // Check if snapshot for this milestone already exists AND has the correct date
            const existingMilestoneSnapshot = video.analyticsHistory?.find(
              snapshot => snapshot.milestone === milestone
            );
            
            // Check if the existing snapshot's timestamp is close to the actual milestone date
            // If not (off by more than 5 days), we'll recreate it with correct historical data
            let shouldRecreate = false;
            if (existingMilestoneSnapshot) {
              const snapshotDate = new Date(existingMilestoneSnapshot.timestamp);
              const daysDiff = Math.abs((snapshotDate.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysDiff > 5) {
                shouldRecreate = true;
                console.log(`⚠️ Found ${milestone}-day snapshot but date is wrong (off by ${Math.round(daysDiff)} days). Will recreate with correct historical data.`);
                
                // Delete the incorrect snapshot by removing it from the array
                try {
                  const deleteResponse = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/snapshots/milestone/${milestone}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${session.access_token}`,
                      },
                    }
                  );
                  
                  if (deleteResponse.ok) {
                    console.log(`🗑️ Deleted incorrect ${milestone}-day snapshot`);
                  } else {
                    console.error(`Failed to delete incorrect snapshot`);
                  }
                } catch (error) {
                  console.error(`Error deleting incorrect snapshot:`, error);
                }
              }
            }
            
            if (!existingMilestoneSnapshot || shouldRecreate) {
              console.log(`📸 Fetching historical ${milestone}-day data for: ${video.title}`);
              
              try {
                // Fetch historical analytics from YouTube Analytics API
                const analyticsResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${video.videoId}/historical?milestoneDate=${milestoneDate.toISOString()}`,
                  {
                    headers: {
                      Authorization: `Bearer ${session.access_token}`,
                    },
                  }
                );
                
                if (!analyticsResponse.ok) {
                  const errorText = await analyticsResponse.text();
                  console.error(`❌ Failed to fetch historical analytics for: ${video.title}`, errorText);
                  apiErrors++;
                  continue;
                }
                
                const analyticsData = await analyticsResponse.json();
                
                if (!analyticsData.analytics) {
                  noDataSkipped++;
                  console.log(`⚠️ No historical data available for ${milestone}-day milestone: ${video.title}`);
                  continue;
                }
                
                const analytics = analyticsData.analytics;
                console.log(`✅ Retrieved historical data: ${analytics.views} views, ${analytics.likes} likes`);
                
                // Get the latest impressions/CTR from existing snapshots (not available via API)
                let impressions = null;
                let ctr = null;
                
                if (video.analyticsHistory && video.analyticsHistory.length > 0) {
                  const sortedSnapshots = [...video.analyticsHistory].sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  );
                  const latestWithReach = sortedSnapshots.find(s => 
                    s.impressions !== undefined && s.impressions !== null
                  );
                  if (latestWithReach) {
                    impressions = latestWithReach.impressions;
                    ctr = latestWithReach.ctr;
                    console.log(`  📊 Using Reach data from latest snapshot: ${impressions} impressions, ${ctr}% CTR`);
                  }
                }
                
                // Create milestone snapshot using the historical data
                const snapshotData: any = {
                  views: analytics.views,
                  likes: analytics.likes,
                  comments: analytics.comments,
                  averageViewDuration: analytics.averageViewDuration,
                  averageViewPercentage: analytics.averageViewPercentage,
                  estimatedMinutesWatched: analytics.estimatedMinutesWatched,
                  topTrafficSource: analytics.topTrafficSource,
                  topTrafficSourcePercentage: analytics.topTrafficSourcePercentage,
                  allTrafficSources: analytics.allTrafficSources, // Include all traffic sources
                  impressions: impressions,
                  ctr: ctr,
                  note: `Milestone snapshot: ${milestone} days after publish (${milestoneDate.toLocaleDateString()}) - historical data from YouTube Analytics`,
                  milestone: milestone,
                  // Use milestone date as timestamp
                  timestamp: milestoneDate.toISOString(),
                };
                
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify(snapshotData),
                  }
                );
                
                if (response.ok) {
                  snapshotsCreated++;
                  console.log(`✅ Created ${milestone}-day milestone snapshot for: ${video.title}`);
                } else {
                  const errorText = await response.text();
                  console.error(`❌ Failed to create ${milestone}-day snapshot for: ${video.title}`, {
                    status: response.status,
                    error: errorText
                  });
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (error) {
                console.error(`❌ Error creating ${milestone}-day milestone snapshot for "${video.title}":`, error);
                apiErrors++;
              }
            } else {
              skippedCount++;
              console.log(`✓ ${milestone}-day snapshot already exists for: ${video.title}`);
            }
          }
        }
      }
      
      const messages = [];
      if (snapshotsCreated > 0) messages.push(`Created ${snapshotsCreated} milestone sync(s)`);
      if (skippedCount > 0) messages.push(`${skippedCount} already existed`);
      if (shortsSkipped > 0) messages.push(`${shortsSkipped} shorts skipped`);
      if (noDataSkipped > 0) messages.push(`${noDataSkipped} milestones had no data`);
      if (apiErrors > 0) messages.push(`${apiErrors} API errors`);
      
      if (snapshotsCreated > 0) {
        toast.success(messages.join(', '));
        await fetchDatabaseVideos();
      } else if (messages.length > 0) {
        toast.info(messages.join(', '));
      } else {
        toast.info(`No videos have reached milestone days yet`);
      }
    } catch (error) {
      console.error("Error creating milestone snapshots:", error);
      toast.error("Failed to create milestone auto-sync data");
    } finally {
      setTakingSnapshot(false);
    }
  };

  // AUTO-SNAPSHOT AUTOMATION: Runs on page load
  // Checks all videos with auto-snapshot enabled and creates snapshots based on frequency
  // Also creates milestone snapshots (4/7/28 days) automatically
  const runAutoSnapshots = async (silent = true) => {
    if (videos.length === 0) {
      if (!silent) toast.info("No videos to sync");
      return;
    }
    
    console.log(`🤖 Running auto-snapshot automation for ${videos.length} videos...`);
    
    let frequencySnapshotsCreated = 0;
    let milestoneSnapshotsCreated = 0;
    const MILESTONES = [4, 7, 28];
    
    try {
      for (const video of videos) {
        // Skip YouTube Shorts (videos under 60 seconds)
        // Also skip videos without duration data
        if (!video.duration) {
          continue;
        }
        
        const durationInSeconds = parseDuration(video.duration);
        if (durationInSeconds < 60) {
          continue;
        }
        
        // 1. Check if video has auto-snapshot enabled and needs a frequency-based snapshot
        if (video.autoSnapshotEnabled && video.snapshotFrequency) {
          const now = new Date();
          const lastSnapshot = video.lastSnapshotDate ? new Date(video.lastSnapshotDate) : null;
          
          let needsSnapshot = false;
          if (!lastSnapshot) {
            needsSnapshot = true; // Never had a snapshot
            console.log(`📸 ${video.title}: No previous snapshot, creating first one`);
          } else {
            const hoursSinceLastSnapshot = (now.getTime() - lastSnapshot.getTime()) / (1000 * 60 * 60);
            
            if (video.snapshotFrequency === 'daily' && hoursSinceLastSnapshot >= 24) {
              needsSnapshot = true;
              console.log(`📸 ${video.title}: Daily snapshot due (${Math.floor(hoursSinceLastSnapshot)}h since last)`);
            } else if (video.snapshotFrequency === 'weekly' && hoursSinceLastSnapshot >= 168) {
              needsSnapshot = true;
              console.log(`📸 ${video.title}: Weekly snapshot due (${Math.floor(hoursSinceLastSnapshot)}h since last)`);
            }
          }
          
          if (needsSnapshot) {
            try {
              // Fetch fresh data
              const stats = await fetchVideoStats(video.videoId);
              
              // Try to fetch analytics if connected
              // Always use 'sincePublished' for auto-snapshots to ensure consistent cumulative data
              let analytics = null;
              if (analyticsConnected) {
                try {
                  const analyticsResponse = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${video.videoId}?dateRange=sincePublished`,
                    {
                      headers: {
                        Authorization: `Bearer ${session.access_token}`,
                      },
                    }
                  );
                  
                  if (analyticsResponse.ok) {
                    const data = await analyticsResponse.json();
                    analytics = data.analytics;
                  }
                } catch (err) {
                  console.log(`⚠️ Analytics not available for auto-snapshot`);
                }
              }
              
              // Create snapshot
              const snapshotData = {
                views: stats.currentViews,
                likes: stats.currentLikes,
                comments: stats.currentComments,
                impressions: analytics?.impressions,
                ctr: analytics?.ctr,
                averageViewDuration: analytics?.averageViewDuration,
                averageViewPercentage: analytics?.averageViewPercentage,
                estimatedMinutesWatched: analytics?.estimatedMinutesWatched,
                topTrafficSource: analytics?.topTrafficSource,
                topTrafficSourcePercentage: analytics?.topTrafficSourcePercentage,
                note: `Auto-snapshot (${video.snapshotFrequency})`,
              };
              
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify(snapshotData),
                }
              );
              
              if (response.ok) {
                frequencySnapshotsCreated++;
                console.log(`✅ Created ${video.snapshotFrequency} snapshot for: ${video.title}`);
              }
              
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`❌ Failed to create auto-snapshot for ${video.title}:`, error);
            }
          }
        }
        
        // 2. Check for milestone snapshots (4/7/28 days) - only if enabled
        if (milestoneAutoSyncEnabled) {
          const publishDate = new Date(video.publishedAt);
          const now = new Date();
          const daysSincePublish = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
          
          for (const milestone of MILESTONES) {
            if (daysSincePublish >= milestone) {
            const hasMilestoneSnapshot = video.analyticsHistory?.some(
              snapshot => snapshot.milestone === milestone
            );
            
            if (!hasMilestoneSnapshot) {
              console.log(`🎯 Looking for ${milestone}-day snapshot data for: ${video.title}`);
              
              try {
                const milestoneDate = new Date(publishDate);
                milestoneDate.setDate(milestoneDate.getDate() + milestone);
                
                // Find the closest existing snapshot to the milestone date
                let closestSnapshot = null;
                let smallestDiff = Infinity;
                
                if (video.analyticsHistory && video.analyticsHistory.length > 0) {
                  for (const snapshot of video.analyticsHistory) {
                    const snapshotDate = new Date(snapshot.timestamp);
                    const diff = Math.abs(snapshotDate.getTime() - milestoneDate.getTime());
                    const daysDiff = diff / (1000 * 60 * 60 * 24);
                    
                    // Only consider snapshots within 3 days of the milestone
                    if (daysDiff <= 3 && diff < smallestDiff) {
                      smallestDiff = diff;
                      closestSnapshot = snapshot;
                    }
                  }
                }
                
                if (closestSnapshot) {
                  // Get the latest impressions/CTR if not in the closest snapshot
                  let impressions = closestSnapshot.impressions;
                  let ctr = closestSnapshot.ctr;
                  
                  if ((impressions === undefined || impressions === null) && video.analyticsHistory) {
                    const sortedSnapshots = [...video.analyticsHistory].sort((a, b) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );
                    const latestWithReach = sortedSnapshots.find(s => 
                      s.impressions !== undefined && s.impressions !== null
                    );
                    if (latestWithReach) {
                      impressions = latestWithReach.impressions;
                      ctr = latestWithReach.ctr;
                    }
                  }
                  
                  const snapshotData = {
                    views: closestSnapshot.views,
                    likes: closestSnapshot.likes,
                    comments: closestSnapshot.comments,
                    averageViewDuration: closestSnapshot.averageViewDuration,
                    averageViewPercentage: closestSnapshot.averageViewPercentage,
                    estimatedMinutesWatched: closestSnapshot.estimatedMinutesWatched,
                    topTrafficSource: closestSnapshot.topTrafficSource,
                    topTrafficSourcePercentage: closestSnapshot.topTrafficSourcePercentage,
                    impressions: impressions,
                    ctr: ctr,
                    note: `Milestone snapshot: ${milestone} days after publish (${milestoneDate.toLocaleDateString()}) - using data from ${new Date(closestSnapshot.timestamp).toLocaleDateString()}`,
                    milestone: milestone,
                    timestamp: milestoneDate.toISOString(),
                  };
                  
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(snapshotData),
                    }
                  );
                  
                  if (response.ok) {
                    milestoneSnapshotsCreated++;
                    console.log(`✅ Created ${milestone}-day milestone for: ${video.title}`);
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              } catch (error) {
                console.error(`❌ Failed to create milestone snapshot:`, error);
              }
            }
          }
        }
        } // End milestone auto-sync check
      }
      
      // Show results
      const totalCreated = frequencySnapshotsCreated + milestoneSnapshotsCreated;
      if (totalCreated > 0) {
        const messages = [];
        if (frequencySnapshotsCreated > 0) messages.push(`${frequencySnapshotsCreated} auto-sync(s)`);
        if (milestoneSnapshotsCreated > 0) messages.push(`${milestoneSnapshotsCreated} milestone(s)`);
        
        if (!silent) {
          toast.success(`✅ Created ${messages.join(' and ')}`);
        } else {
          console.log(`✅ Auto-sync complete: Created ${messages.join(' and ')}`);
        }
        
        await fetchDatabaseVideos();
      } else {
        console.log(`✅ Auto-sync check complete: No new data needed`);
        if (!silent) {
          toast.info("All data is up to date");
        }
      }
    } catch (error) {
      console.error("❌ Error running auto-snapshots:", error);
      if (!silent) {
        toast.error("Auto-snapshot automation failed");
      }
    }
  };

  // Clear all analytics data while preserving core video information
  const clearAllAnalytics = async () => {
    setClearingAnalytics(true);
    try {
      console.log("🧹 Starting clear all analytics request...");
      
      // First check if server is reachable
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/health`;
      console.log("🏥 Testing server health at:", healthUrl);
      
      try {
        const healthCheck = await fetch(healthUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        console.log("🏥 Health check response:", healthCheck.status);
        if (!healthCheck.ok) {
          throw new Error(`Server health check failed with status ${healthCheck.status}`);
        }
      } catch (healthError) {
        console.error("❌ Server is not reachable:", healthError);
        console.error("❌ Error type:", healthError instanceof TypeError ? "TypeError" : typeof healthError);
        console.error("❌ Full error details:", JSON.stringify(healthError, Object.getOwnPropertyNames(healthError)));
        
        const errorMsg = healthError instanceof Error ? healthError.message : String(healthError);
        toast.error(`Server connection failed: ${errorMsg}. The Edge Function may not be deployed yet. Please wait a moment and try again.`);
        setClearingAnalytics(false);
        return;
      }
      
      const clearUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/clear-analytics`;
      console.log("🧹 Calling clear analytics at:", clearUrl);
      
      const response = await fetch(clearUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log("📡 Clear analytics response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Clear analytics failed:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("✅ Clear analytics response:", data);
      
      if (data.success) {
        const message = data.errorCount 
          ? `Cleared analytics from ${data.clearedCount} videos (${data.errorCount} failures)`
          : `Successfully cleared analytics from ${data.clearedCount} videos`;
        toast.success(message);
        
        console.log("🔄 Fetching updated video data...");
        await fetchDatabaseVideos();
        setShowClearAnalyticsDialog(false);
      } else {
        toast.error(data.error || "Failed to clear analytics data");
      }
    } catch (error) {
      console.error("❌ Error clearing analytics:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to clear analytics: ${errorMessage}`);
    } finally {
      setClearingAnalytics(false);
    }
  };

  // Retag all shorts based on video duration
  const retagShorts = async () => {
    if (videos.length === 0) {
      toast.error("No videos in database");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    setTakingSnapshot(true);
    let taggedCount = 0;
    
    try {
      toast.info(`Checking ${videos.length} videos for shorts...`);
      
      for (const video of videos) {
        if (!video.duration) continue;
        
        const durationInSeconds = parseDuration(video.duration);
        const isShort = durationInSeconds < 60;
        
        // Determine new tags
        const currentTags = video.tags || [];
        let newTags = [...currentTags];
        
        if (isShort && !currentTags.includes("Short")) {
          // Add Short tag
          newTags.push("Short");
          taggedCount++;
        } else if (!isShort && currentTags.includes("Short")) {
          // Remove Short tag if video is not actually a short
          newTags = newTags.filter(tag => tag !== "Short");
          taggedCount++;
        } else {
          // No change needed
          continue;
        }
        
        // Update tags
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/tags`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ tags: newTags }),
            }
          );
        } catch (err) {
          console.error(`Failed to update tags for ${video.videoId}:`, err);
        }
      }
      
      toast.success(`✅ Tagged ${taggedCount} shorts`);
      await fetchDatabaseVideos();
    } catch (error) {
      console.error("Error retagging shorts:", error);
      toast.error("Failed to retag shorts");
    } finally {
      setTakingSnapshot(false);
    }
  };

  // Fix milestone snapshot timestamps for all videos
  const fixMilestoneTimestamps = async () => {
    if (videos.length === 0) {
      toast.error("No videos in database");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    setTakingSnapshot(true);
    let fixedCount = 0;
    let totalFixed = 0;
    
    try {
      toast.info(`Checking milestone timestamps for ${videos.length} videos...`);
      
      for (const video of videos) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/fix-milestone-timestamps`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          
          const data = await response.json();
          
          if (data.success && data.message.includes("Fixed")) {
            fixedCount++;
            const count = parseInt(data.message.match(/\d+/)?.[0] || "0");
            totalFixed += count;
            console.log(`✅ ${data.message} for: ${video.title}`);
          }
        } catch (error) {
          console.error(`Error fixing timestamps for ${video.title}:`, error);
        }
      }
      
      if (totalFixed > 0) {
        toast.success(`Fixed ${totalFixed} milestone snapshot timestamp(s) across ${fixedCount} video(s)`);
        await fetchDatabaseVideos();
      } else {
        toast.info("All milestone timestamps are already correct");
      }
    } catch (error) {
      console.error("Error fixing milestone timestamps:", error);
      toast.error("Failed to fix milestone timestamps");
    } finally {
      setTakingSnapshot(false);
    }
  };

  // Add new next step item
  const addNextStep = () => {
    if (!newNextStep.trim()) return;
    
    const newItem: NextStepItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNextStep.trim(),
      completed: false
    };
    
    setNextSteps([...nextSteps, newItem]);
    setNewNextStep("");
  };
  
  // Toggle next step completion
  const toggleNextStep = (id: string) => {
    setNextSteps(nextSteps.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };
  
  // Delete next step item
  const deleteNextStep = (id: string) => {
    setNextSteps(nextSteps.filter(item => item.id !== id));
  };

  // Save notes and next steps
  const saveNotes = async () => {
    if (!selectedVideo) return;
    
    const token = await getSessionToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    
    setSavingNotes(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/notes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes, nextSteps }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Notes saved");
        
        // Update the video in the local state
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Update publish date for a video (admin function)
  const updatePublishDate = async (videoId: string, newDate: string) => {
    try {
      console.log(`Updating publish date for ${videoId} to ${newDate}`);
      
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("Session expired. Please refresh the page.");
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            videoId: videoId,
            publishedAt: newDate,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const video = videos.find(v => v.videoId === videoId);
        toast.success(`Updated publish date for video ${videoId}${video ? ` (${video.title})` : ''}`);
        
        // Update the video in the local state
        setVideos(prevVideos => prevVideos.map(v => 
          v.videoId === videoId ? data.video : v
        ));
        
        if (selectedVideo?.videoId === videoId) {
          setSelectedVideo({ ...data.video });
        }
      } else {
        console.error('Update failed:', data);
        toast.error(`Failed to update publish date for ${videoId}`);
      }
    } catch (error) {
      console.error("Error updating publish date:", error);
      toast.error("Failed to update publish date");
    }
  };

  // Add tag to video - shows category dialog for custom tags
  const addTag = async () => {
    if (!selectedVideo || !newTag.trim()) return;
    
    // Check if this is a new tag (not in existing tags)
    const allExistingTags = [
      ...allTags.tool,
      ...allTags.format,
      ...allTags.status
    ];
    
    if (!allExistingTags.includes(newTag.trim())) {
      // Show category selection dialog for new tag
      setPendingCustomTag(newTag.trim());
      setShowCategoryDialog(true);
      return;
    }
    
    // If it's already a known tag, just add it
    await addTagToVideo(newTag.trim());
  };
  
  // Actually add the tag to the video
  const addTagToVideo = async (tag: string) => {
    if (!selectedVideo) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    const updatedTags = [...(selectedVideo.tags || []), tag];
    
    try {
      const token = await getSessionToken();
      if (!token) {
        console.error("No session token available");
        toast.error("Please sign in to add tags");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: updatedTags }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Tag added");
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
        setVideoTags(data.video.tags || []);
        setNewTag("");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    }
  };
  
  // Add tag with category
  const addCustomTagWithCategory = async (category: 'tool' | 'format' | 'status') => {
    if (!pendingCustomTag) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    // Add to tags list
    const updatedTags = {
      ...allTags,
      [category]: [...allTags[category], pendingCustomTag]
    };
    setAllTags(updatedTags);
    
    // Save to database
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ customTags: updatedTags }),
        }
      );
    } catch (error) {
      console.error("Error saving tags:", error);
    }
    
    // Add tag to video
    await addTagToVideo(pendingCustomTag);
    
    // Close dialog and reset
    setShowCategoryDialog(false);
    setPendingCustomTag("");
  };
  
  // Add tag from settings (all tags are now in database)
  const addCustomTagFromSettings = async () => {
    if (!newSettingsTag.trim()) {
      toast.error("Please enter a tag name");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    // Check if tag already exists
    const allExistingTags = [
      ...allTags.tool,
      ...allTags.format,
      ...allTags.status
    ];
    
    if (allExistingTags.includes(newSettingsTag.trim())) {
      toast.error("This tag already exists");
      return;
    }
    
    // Add to tags list
    const updatedTags = {
      ...allTags,
      [newSettingsTagCategory]: [...allTags[newSettingsTagCategory], newSettingsTag.trim()]
    };
    setAllTags(updatedTags);
    
    // Save to database
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ customTags: updatedTags }),
        }
      );
      
      if (response.ok) {
        toast.success(`Tag "${newSettingsTag.trim()}" added to ${newSettingsTagCategory} category`);
        setNewSettingsTag('');
      } else {
        toast.error("Failed to save tag");
      }
    } catch (error) {
      console.error("Error saving tags:", error);
      toast.error("Failed to save tag");
    }
  };
  
  // Rename existing tag (all tags are now editable)
  const renameCustomTag = async () => {
    if (!selectedTagToEdit || !newTagName.trim()) {
      toast.error("Please select a tag and enter a new name");
      return;
    }
    
    if (selectedTagToEdit === newTagName.trim()) {
      toast.error("New name must be different from current name");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    // Check if new name already exists
    const allExistingTags = [
      ...allTags.tool,
      ...allTags.format,
      ...allTags.status
    ];
    
    if (allExistingTags.includes(newTagName.trim())) {
      toast.error("A tag with this name already exists");
      return;
    }
    
    // Find which category the tag belongs to
    let category: 'tool' | 'format' | 'status' | null = null;
    
    if (allTags.tool.includes(selectedTagToEdit)) {
      category = 'tool';
    } else if (allTags.format.includes(selectedTagToEdit)) {
      category = 'format';
    } else if (allTags.status.includes(selectedTagToEdit)) {
      category = 'status';
    }
    
    if (!category) {
      toast.error("Tag not found");
      return;
    }
    
    // Update tags list (rename the tag)
    const updatedTags = {
      ...allTags,
      [category]: allTags[category].map(tag => 
        tag === selectedTagToEdit ? newTagName.trim() : tag
      )
    };
    setAllTags(updatedTags);
    
    // Update all videos that use this tag
    const updatedVideos = videos.map(video => {
      if (video.tags?.includes(selectedTagToEdit)) {
        return {
          ...video,
          tags: video.tags.map(tag => tag === selectedTagToEdit ? newTagName.trim() : tag)
        };
      }
      return video;
    });
    setVideos(updatedVideos);
    
    // Save to database
    try {
      // Save updated tags
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ customTags: updatedTags }),
        }
      );
      
      // Update all videos with the renamed tag
      const videosToUpdate = videos.filter(v => v.tags?.includes(selectedTagToEdit));
      for (const video of videosToUpdate) {
        const updatedTags = video.tags!.map(tag => 
          tag === selectedTagToEdit ? newTagName.trim() : tag
        );
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/tags`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ tags: updatedTags }),
          }
        );
      }
      
      toast.success(`Tag renamed from "${selectedTagToEdit}" to "${newTagName.trim()}"`);
      setSelectedTagToEdit('');
      setNewTagName('');
    } catch (error) {
      console.error("Error renaming tag:", error);
      toast.error("Failed to rename tag");
    }
  };

  // Reset tags to default
  const resetTagsToDefault = async () => {
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    const defaultTags = {
      tool: [...TAG_CATEGORIES.tool.defaultTags],
      format: [...TAG_CATEGORIES.format.defaultTags],
      status: [...TAG_CATEGORIES.status.defaultTags]
    };
    
    console.log('🔄 Resetting tags to default:', defaultTags);
    setAllTags(defaultTags);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/custom-tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ customTags: defaultTags }),
        }
      );
      const result = await response.json();
      console.log('✅ Reset tags response:', result);
      toast.success("Tags reset to default successfully");
      
      // Reset the edit form
      setSelectedTagToEdit('');
      setNewTagName('');
    } catch (error) {
      console.error("❌ Error resetting tags:", error);
      toast.error("Failed to reset tags");
    }
  };

  // Remove tag from video
  const removeTag = async (tagToRemove: string) => {
    if (!selectedVideo) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    const updatedTags = (selectedVideo.tags || []).filter(tag => tag !== tagToRemove);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/tags`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tags: updatedTags }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Tag removed");
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
        setVideoTags(data.video.tags || []);
      }
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Failed to remove tag");
    }
  };

  // Add performance goal
  const addPerformanceGoal = async () => {
    if (!selectedVideo || !goalTarget) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    const newGoal: PerformanceGoal = {
      id: Date.now().toString(),
      metricType: goalMetric,
      targetValue: parseFloat(goalTarget),
      deadline: goalDeadline || undefined,
      achieved: false,
      createdAt: new Date().toISOString(),
    };
    
    const updatedGoals = [...(selectedVideo.performanceGoals || []), newGoal];
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/goals`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ goals: updatedGoals }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Performance goal added");
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
        setShowGoalDialog(false);
        setGoalTarget("");
        setGoalDeadline("");
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Failed to add goal");
    }
  };

  // Remove performance goal
  const removePerformanceGoal = async (goalId: string) => {
    if (!selectedVideo) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    const updatedGoals = (selectedVideo.performanceGoals || []).filter(g => g.id !== goalId);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/goals`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ goals: updatedGoals }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Performance goal removed");
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
      }
    } catch (error) {
      console.error("Error removing goal:", error);
      toast.error("Failed to remove goal");
    }
  };

  // Check and update goal achievement status
  const checkGoalAchievement = (goal: PerformanceGoal, video: VideoData) => {
    let currentValue = 0;
    
    switch (goal.metricType) {
      case 'views':
        currentValue = video.currentViews || 0;
        break;
      case 'likes':
        currentValue = video.currentLikes || 0;
        break;
      case 'reach':
        // Use CTR (Click-Through Rate) as the reach metric
        const ctr = getCTRForDateRange(video, dateRangeFilter);
        currentValue = ctr || 0;
        break;
      case 'growth':
        // Calculate growth as views per day
        currentValue = calculateViewsPerDay(video);
        break;
      case 'percentViewed':
        // Use retention percentage
        currentValue = getLatestPercentageViewed(video);
        break;
      case 'comments':
        currentValue = video.currentComments || 0;
        break;
      case 'engagement':
        currentValue = calculateEngagementRate(video);
        break;
    }
    
    return currentValue >= goal.targetValue;
  };

  // Fetch all analytics for all videos
  const fetchAllAnalytics = async () => {
    if (!analyticsConnected) {
      toast.error("Please connect YouTube Analytics first");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    setFetchingAnalytics(true);
    setAnalyticsError(null);
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    let internalErrorCount = 0;
    
    try {
      toast.info(`Fetching analytics for ${videos.length} videos...`);
      
      for (const video of videos) {
        try {
          console.log(`Fetching analytics for: ${video.title}`);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${video.videoId}?dateRange=${dateRangeFilter}&v=${Date.now()}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.analytics) {
              // Check if video is younger than 28 days
              const publishedDate = new Date(video.publishedAt);
              const now = new Date();
              const daysOld = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
              
              // Determine actual date range to use

              if (daysOld < 28 && dateRangeFilter === 'last28') {
                console.log(`⚠️  WARNING: Video "${video.title}" is only ${daysOld} days old.`);
                console.log(`   📊 For videos newer than 28 days, "Last 28 Days" and "Lifetime" data are IDENTICAL.`);
                console.log(`   💡 This may create confusing duplicate snapshots. Consider using \"Lifetime\" for new videos.`);
              }
              
              // Auto-save the analytics data
              // NOTE: Impressions and CTR are NOT included - they must be manually imported via CSV
              const analyticsPayload: any = {
                views: data.analytics.views,
                likes: data.analytics.likes,
                comments: data.analytics.comments,
                averageViewDuration: data.analytics.averageViewDuration,
                averageViewPercentage: data.analytics.averageViewPercentage,
                topTrafficSource: data.analytics.topTrafficSource,
                topTrafficSourcePercentage: data.analytics.topTrafficSourcePercentage,
                dateRange: dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28', // Pass current filter
              };
              // impressions and CTR are NOT included - they must be manually imported
              
              await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}/advanced-snapshot`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify(analyticsPayload),
                }
              );
              
              successCount++;
              console.log(`✅ Analytics fetched for: ${video.title}`);
            }
          } else {
            const errorData = await response.json().catch(() => null);
            
            // Check for "too new" error (videos published within last 3 days)
            if (response.status === 404 || (response.status === 400 && errorData?.error?.includes("too new"))) {
              skippedCount++;
              console.log(`⏭️  Skipped (too new): ${video.title}`);
            }
            // Check for internal error (500) from Google Analytics API
            else if (response.status === 503 || errorData?.error === "ANALYTICS_UNAVAILABLE" || errorData?.error?.code === 500 || errorData?.error?.status === "INTERNAL") {
              console.error("Google Analytics API Internal Error (temporarily unavailable):", errorData);
              internalErrorCount++;
            } else {
              failCount++;
              console.error(`❌ Failed: ${video.title}`, errorData);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to fetch analytics for ${video.title}:`, error);
          failCount++;
        }
      }
      
      // Show results
      let message = `Analytics complete: ${successCount} videos updated`;
      if (skippedCount > 0) message += `, ${skippedCount} skipped (too new)`;
      if (internalErrorCount > 0) message += `, ${internalErrorCount} temporarily unavailable`;
      if (failCount > 0) message += `, ${failCount} failed`;
      
      if (successCount > 0) {
        toast.success(message);
        await fetchDatabaseVideos();
      } else if (skippedCount > 0 && failCount === 0 && internalErrorCount === 0) {
        toast.info("All videos are too new for analytics. YouTube Analytics has a 2-3 day delay. Please try again in a few days.");
      } else if (internalErrorCount > 0 && successCount === 0 && failCount === 0) {
        setAnalyticsError("YouTube Analytics API returned 500 Internal Server Error. This is a temporary issue on Google's side, not your application. Please wait 30-60 minutes and try again, or use 'Add Advanced Data' to manually enter metrics.");
        toast.error("Analytics API temporarily unavailable (Google 500 error). Try again in 30-60 minutes.");
      } else if (failCount > 0) {
        toast.error(message);
      }
    } catch (error) {
      console.error("Error in bulk analytics fetch:", error);
      toast.error("Failed to complete bulk analytics fetch");
    } finally {
      setFetchingAnalytics(false);
    }
  };
  
  // Add advanced analytics snapshot
  const addAdvancedAnalytics = async () => {
    if (!selectedVideo) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/advanced-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            averageViewDuration: advancedAvgDuration ? Math.round(parseFloat(advancedAvgDuration) * 60) : undefined, // Convert minutes to seconds
            averageViewPercentage: advancedAvgPercentage ? parseFloat(advancedAvgPercentage) : undefined,
            topTrafficSource: advancedTrafficSource || undefined,
            topTrafficSourcePercentage: advancedTrafficPercentage ? parseFloat(advancedTrafficPercentage) : undefined,
            ctr: advancedCTR ? parseFloat(advancedCTR) : undefined,
            impressions: advancedImpressions ? parseInt(advancedImpressions) : undefined,
            dateRange: dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28', // Pass current filter
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Advanced analytics added");
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo({ ...data.video });
        setShowAdvancedAnalyticsDialog(false);
        
        // Reset form
        setAdvancedAvgDuration("");
        setAdvancedAvgPercentage("");
        setAdvancedTrafficSource("");
        setAdvancedTrafficPercentage("");
        setAdvancedCTR("");
        setAdvancedImpressions("");
      }
    } catch (error) {
      console.error("Error adding advanced analytics:", error);
      toast.error("Failed to add advanced analytics");
    }
  };

  // Handle engagement CSV file selection - shows dialog first
  const handleEngagementFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPendingEngagementFile(file);
    setEngagementCaptureDate(undefined); // Reset date picker
    setShowEngagementImportDialog(true);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  // Confirm date range selection and process the engagement CSV
  const confirmEngagementImport = async () => {
    if (!pendingEngagementFile) return;
    
    setShowEngagementImportDialog(false);
    setImportingEngagementCSV(true);
    
    // Show info toast about the import process
    toast.info('Importing reach metrics... This may take a moment.', {
      description: 'Temporary YouTube API errors will be automatically retried.'
    });
    
    try {
      const result = await importEngagementMetrics(
        pendingEngagementFile,
        fetchDatabaseVideos,
        engagementDateRange,
        engagementCaptureDate // Pass the optional capture date
      );
      
      if (result.successCount > 0) {
        toast.success(`✅ Imported reach metrics for ${result.successCount} video(s)`);
      }
      
      if (result.errors.length > 0) {
        setImportErrors(result.errors);
        setShowErrorCorrectionDialog(true);
        toast.warning(`⚠️ ${result.errors.length} video(s) could not be matched. Review errors.`);
      }
    } catch (error) {
      console.error('Error importing engagement metrics:', error);
      toast.error('Failed to import reach metrics');
    } finally {
      setImportingEngagementCSV(false);
      setPendingEngagementFile(null);
      setEngagementCaptureDate(undefined);
    }
  };
  
  // Confirm main YouTube sync with selected date range
  const confirmMainSync = () => {
    setShowMainSyncDialog(false);
    // If "Sync All Videos" is checked, sync all videos; otherwise sync only filtered videos
    const videoIdsToSync = syncAllVideos ? undefined : filteredVideos.map(v => v.videoId);
    // Call syncAndRefreshAll with the selected date range and conditionally filtered video IDs
    syncAndRefreshAll(mainSyncDateRange, videoIdsToSync);
  };
  
  // Format duration in seconds to readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Delete a specific snapshot (opens confirmation dialog)
  const deleteSnapshot = (snapshotTimestamp: string) => {
    if (!selectedVideo) {
      console.log("No video selected");
      return;
    }
    
    console.log("Opening delete confirmation for snapshot:", snapshotTimestamp);
    setPendingDeleteTimestamp(snapshotTimestamp);
    setDeleteConfirmOpen(true);
  };
  
  // Confirm and execute snapshot deletion
  const confirmDeleteSnapshot = async () => {
    if (!selectedVideo || !pendingDeleteTimestamp) {
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    console.log("=== DELETE SNAPSHOT START ===");
    console.log("Deleting snapshot with timestamp:", pendingDeleteTimestamp);
    console.log("Current video:", selectedVideo.videoId);
    console.log("Current snapshot count:", selectedVideo.analyticsHistory?.length);
    
    setIsDeleting(true);
    
    try {
      const updatedHistory = selectedVideo.analyticsHistory?.filter(
        s => s.timestamp !== pendingDeleteTimestamp
      ) || [];
      
      console.log("Filtered snapshot count:", updatedHistory.length);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...selectedVideo,
            analyticsHistory: updatedHistory,
          }),
        }
      );
      
      console.log("Delete response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Server returned video with snapshots:", data.video.analyticsHistory?.length);
        console.log("Server returned snapshots:", data.video.analyticsHistory?.map((s: any) => s.timestamp));
        
        // Close dialog first
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setPendingDeleteTimestamp(null);
        
        // Then update state - create new object reference to force React re-render
        setSelectedVideo({ ...data.video });
        setVideos(prevVideos => {
          const updated = prevVideos.map(v => 
            v.videoId === selectedVideo.videoId ? data.video : v
          );
          console.log("Updated videos array");
          return updated;
        });
        
        toast.success("YouTube sync deleted");
        console.log("=== DELETE SNAPSHOT SUCCESS ===");
        console.log("Updated selectedVideo with", data.video.analyticsHistory?.length, "snapshots");
      } else {
        const errorText = await response.text();
        console.error("Failed to delete snapshot:", errorText);
        toast.error("Failed to delete YouTube sync");
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setPendingDeleteTimestamp(null);
      }
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      toast.error("Failed to delete snapshot");
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setPendingDeleteTimestamp(null);
    }
  };
  
  // Remove all Nov 1 data from all videos
  const removeNov1Data = async () => {
    try {
      console.log("=== REMOVING ALL NOV 1 DATA ===");
      let updatedCount = 0;
      let errorCount = 0;
      const nov1Date = new Date('2025-11-01');
      const nov2Date = new Date('2025-11-02'); // To check if timestamp is before Nov 2
      
      toast.info("Scanning videos for Nov 1 data...");
      
      // Process each video sequentially to avoid overwhelming the server
      const updatedVideos = [];
      
      for (const video of videos) {
        if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
          updatedVideos.push(video);
          continue;
        }
        
        // Filter out any snapshots from Nov 1, 2024
        const filteredHistory = video.analyticsHistory.filter(snapshot => {
          const snapshotDate = new Date(snapshot.timestamp);
          const isNov1 = snapshotDate >= nov1Date && snapshotDate < nov2Date;
          
          if (isNov1) {
            console.log(`Removing Nov 1 snapshot from "${video.title}": ${snapshot.timestamp}`);
          }
          
          return !isNov1;
        });
        
        // If any snapshots were removed, update the video
        if (filteredHistory.length < video.analyticsHistory.length) {
          updatedCount++;
          console.log(`Updating ${video.title} (${video.analyticsHistory.length - filteredHistory.length} snapshot(s) removed)`);
          
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  ...video,
                  analyticsHistory: filteredHistory,
                }),
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              updatedVideos.push(data.video);
              console.log(`✅ Successfully updated "${video.title}"`);
            } else {
              const errorText = await response.text();
              console.error(`❌ Failed to update video "${video.title}":`, response.status, errorText);
              errorCount++;
              updatedVideos.push(video); // Keep original if update failed
            }
          } catch (updateError) {
            console.error(`❌ Exception updating "${video.title}":`, updateError);
            errorCount++;
            updatedVideos.push(video); // Keep original if update failed
          }
        } else {
          updatedVideos.push(video);
        }
      }
      
      setVideos(updatedVideos);
      
      if (updatedCount > 0) {
        const message = errorCount > 0 
          ? `Removed Nov 1 data from ${updatedCount} video(s) (${errorCount} failed)`
          : `Removed Nov 1 data from ${updatedCount} video(s)`;
        toast.success(message);
        console.log(`✅ ${message}`);
        
        // Refresh the page to update all charts
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.info("No Nov 1 data found");
        console.log("���️ No Nov 1 data found in any videos");
      }
    } catch (error) {
      console.error("Error removing Nov 1 data:", error);
      toast.error("Failed to remove Nov 1 data");
    }
  };
  
  // Open edit snapshot note dialog
  const openEditSnapshotNote = (snapshotTimestamp: string) => {
    if (!selectedVideo) return;
    
    const snapshot = selectedVideo.analyticsHistory?.find(s => s.timestamp === snapshotTimestamp);
    setEditingSnapshotTimestamp(snapshotTimestamp);
    setEditingSnapshotNote(snapshot?.note || "");
    setShowEditSnapshotNoteDialog(true);
  };
  
  // Update snapshot note
  const updateSnapshotNote = async () => {
    if (!selectedVideo || !editingSnapshotTimestamp) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/snapshot/${editingSnapshotTimestamp}/note`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ note: editingSnapshotNote }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedVideo({ ...data.video });
        setVideos(prevVideos =>
          prevVideos.map(v => v.videoId === selectedVideo.videoId ? data.video : v)
        );
        toast.success("Note updated");
        setShowEditSnapshotNoteDialog(false);
        setEditingSnapshotTimestamp(null);
        setEditingSnapshotNote("");
      } else {
        toast.error("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating snapshot note:", error);
      toast.error("Failed to update note");
    }
  };
  
  // Check YouTube Analytics connection status
  const checkAnalyticsConnection = async () => {
    try {
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        // Silently set to disconnected - this is expected on initial page load
        setAnalyticsConnected(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      setAnalyticsConnected(data.connected || false);
    } catch (error) {
      // Silently fail - this runs on every page load and is expected to fail if not connected
      setAnalyticsConnected(false);
    }
  };
  
  // Proceed with OAuth connection (called after beta notice is acknowledged)
  const proceedWithOAuthConnection = async () => {
    console.log("=== 🚀 Initiating OAuth Connection (v2) ===");
    setConnectingAnalytics(true);
    try {
      const redirectUri = `${window.location.origin}/oauth-callback.html`;
      
      console.log("📋 OAuth Configuration:");
      console.log("  - Current origin:", window.location.origin);
      console.log("  - Expected redirect URI:", redirectUri);
      console.log("  - Client ID: 430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com");
      console.log("\n⚠️  IMPORTANT: This redirect URI MUST be added to Google Cloud Console!");
      console.log("   Copy this EXACTLY: ", redirectUri);
      console.log("   Go to: https://console.cloud.google.com/apis/credentials");
      console.log("   Add it under 'Authorized redirect URIs'\n");
      
      toast.info("Generating OAuth authorization URL...", { duration: 2000 });
      
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("❌ No valid Supabase session");
        toast.error("Session expired. Please refresh the page and try again.");
        setConnectingAnalytics(false);
        return;
      }
      
      console.log("🔐 Using fresh Supabase access token for OAuth initiation");
      console.log("🔐 Token preview:", session.access_token.substring(0, 50) + "...");
      console.log("🔐 Token length:", session.access_token.length);
      console.log("🔐 User ID from session:", session.user?.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/auth-url`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Origin: window.location.origin,
          },
        }
      );
      
      console.log("📡 Server response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Failed to get auth URL:", errorData);
        toast.error(`Failed to initiate OAuth: ${errorData.error || 'Unknown error'}`, { duration: 8000 });
        return;
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        console.log("✅ Auth URL generated successfully!");
        console.log("🌐 Opening Google OAuth consent screen in popup...");
        console.log("Auth URL (first 150 chars):", data.authUrl.substring(0, 150) + "...");
        console.log("🔍 FULL AUTH URL:", data.authUrl);
        
        toast.success("Opening Google authorization popup...", { duration: 2000 });
        
        // Open OAuth in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.authUrl,
          'YouTubeOAuth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );
        
        if (!popup) {
          toast.error("Popup was blocked! Please allow popups for this site.", { duration: 8000 });
          setConnectingAnalytics(false);
          return;
        }
        
        // Poll for OAuth code in localStorage (set by callback page)
        const pollInterval = setInterval(() => {
          const oauthCode = localStorage.getItem('youtube_oauth_code');
          const oauthError = localStorage.getItem('youtube_oauth_error');
          
          // Check if popup was closed
          if (popup.closed) {
            clearInterval(pollInterval);
            
            if (oauthCode) {
              console.log("✅ OAuth code received from callback!");
              localStorage.removeItem('youtube_oauth_code'); // Clean up
              
              // Exchange code for tokens
              handleOAuthCallback(oauthCode);
            } else if (oauthError) {
              console.error("❌ OAuth error:", oauthError);
              localStorage.removeItem('youtube_oauth_error'); // Clean up
              toast.error(`Authorization failed: ${oauthError}`, { duration: 8000 });
              setConnectingAnalytics(false);
            } else {
              console.log("⚠️ Popup closed without OAuth code");
              toast.info("Authorization cancelled", { duration: 4000 });
              setConnectingAnalytics(false);
            }
          }
        }, 500);
        
        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          if (!popup.closed) {
            popup.close();
          }
          setConnectingAnalytics(false);
        }, 5 * 60 * 1000);
        
      } else {
        console.error("❌ No auth URL in server response:", data);
        toast.error("Failed to get authorization URL from server", { duration: 8000 });
      }
    } catch (error) {
      console.error("❌ Exception while initiating OAuth:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      toast.error(`Failed to initiate YouTube Analytics connection: ${error instanceof Error ? error.message : 'Unknown error'}`, { duration: 10000 });
    } finally {
      setConnectingAnalytics(false);
    }
    console.log("=== 🏁 OAuth Initiation Complete ===");
  };
  
  // Connect YouTube Analytics (wrapper that shows beta notice first)
  const connectYouTubeAnalytics = async () => {
    // Show beta notice if user hasn't seen it yet
    if (!hasSeenBetaNotice) {
      setShowBetaOAuthNotice(true);
      return;
    }
    
    // Otherwise proceed directly
    await proceedWithOAuthConnection();
  };
  
  // Handle beta notice acknowledgment
  const handleBetaNoticeAcknowledged = () => {
    localStorage.setItem('tubelab_beta_oauth_notice_seen', 'true');
    setHasSeenBetaNotice(true);
    setShowBetaOAuthNotice(false);
    // Immediately proceed with connection
    proceedWithOAuthConnection();
  };
  
  // Disconnect YouTube Analytics
  const disconnectYouTubeAnalytics = async () => {
    try {
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("No valid Supabase session");
        toast.error("Session expired. Please refresh the page.");
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/disconnect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsConnected(false);
        toast.success("YouTube Analytics disconnected");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect YouTube Analytics");
    }
  };
  
  // Fetch analytics for current video
  const fetchVideoAnalytics = async (videoId: string) => {
    if (!analyticsConnected) {
      toast.error("Please connect YouTube Analytics first");
      return;
    }
    
    setFetchingAnalytics(true);
    try {
      console.log("Fetching analytics for video:", videoId);
      
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("No valid Supabase session");
        toast.error("Session expired. Please refresh the page.");
        setFetchingAnalytics(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${videoId}?dateRange=${dateRangeFilter}&v=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      const data = await response.json();
      
      console.log("Analytics response status:", response.status);
      console.log("Analytics response data:", data);
      
      // DEBUG: Log raw YouTube API response structure
      if (data._debug) {
        console.log("🔍 === YOUTUBE API DEBUG INFO ===");
        console.log("📋 Column Headers:", data._debug.columnHeaders);
        console.log("📊 Data Rows:", data._debug.rows);
        console.log("📝 Requested Metrics:", data._debug.requestedMetrics);
        console.log("================================");
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("No analytics data available for this video yet. YouTube may need more time to process data.");
        } else if (response.status === 400 && data.error?.includes("too new")) {
          // Video is too new (published within last 3 days)
          toast.info("This video is too new for analytics. YouTube Analytics has a 2-3 day delay. Please try again in a few days.");
        } else if (response.status === 403 && data.error === "API_NOT_ENABLED") {
          // YouTube Analytics API not enabled
          const activationUrl = data.activationUrl || "https://console.developers.google.com/apis/api/youtubeanalytics.googleapis.com/overview?project=430888277505";
          
          // Set persistent error state
          setApiNotEnabledError(activationUrl);
          
          toast.error(
            <div className="flex flex-col gap-2">
              <div className="font-bold">⚠️ YouTube Analytics API Not Enabled</div>
              <div className="text-sm">You need to enable the API in Google Cloud Console:</div>
              <ol className="text-xs list-decimal list-inside space-y-1">
                <li>Click the link below</li>
                <li>Click "Enable" button</li>
                <li>Wait 5 minutes for changes to propagate</li>
                <li>Come back and try again</li>
              </ol>
              <a
                href={activationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300 font-semibold"
              >
                🔗 Enable YouTube Analytics API →
              </a>
            </div>,
            { duration: 15000 }
          );
        } else if (data.details && data.details.includes("youtubeanalytics.googleapis.com")) {
          // Fallback for generic API not enabled error
          const match = data.details.match(/project=(\d+)/);
          const projectId = match ? match[1] : "430888277505";
          const activationUrl = `https://console.developers.google.com/apis/api/youtubeanalytics.googleapis.com/overview?project=${projectId}`;
          
          // Set persistent error state
          setApiNotEnabledError(activationUrl);
          
          toast.error(
            <div className="flex flex-col gap-2">
              <div className="font-bold">YouTube Analytics API Not Enabled</div>
              <div className="text-sm">Click below to enable it (takes 1 minute):</div>
              <a
                href={activationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300"
              >
                Enable YouTube Analytics API →
              </a>
              <div className="text-xs text-gray-400 mt-1">After enabling, wait 2-3 minutes then try again.</div>
            </div>,
            { duration: 10000 }
          );
        } else {
          throw new Error(data.error || "Failed to fetch analytics");
        }
        return;
      }
      
      if (data.analytics) {
        console.log("Analytics data received:", data.analytics);
        
        // Clear any previous API error state
        setApiNotEnabledError(null);
        
        // Auto-fill the advanced analytics form
        setAdvancedImpressions(data.analytics.impressions?.toString() || "");
        setAdvancedCTR(data.analytics.ctr?.toString() || "");
        setAdvancedAvgDuration(data.analytics.averageViewDuration?.toString() || "");
        setAdvancedAvgPercentage(data.analytics.averageViewPercentage?.toString() || "");
        setAdvancedTrafficSource(data.analytics.topTrafficSource || "");
        setAdvancedTrafficPercentage(data.analytics.topTrafficSourcePercentage?.toString() || "");
        
        setShowAdvancedAnalyticsDialog(true);
        toast.success("Analytics data fetched! Review and save.");
      } else {
        toast.error("No analytics data returned from YouTube");
      }
    } catch (error) {
      console.error("Error fetching video analytics:", error);
      toast.error(`Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFetchingAnalytics(false);
    }
  };

  // Bulk tag operations
  const handleBulkTag = () => {
    if (selectedVideoIds.length === 0) {
      toast.error("No videos selected");
      return;
    }
    setShowBulkTagDialog(true);
  };

  const applyBulkTags = async () => {
    if (bulkTagsToAdd.length === 0 && bulkTagsToRemove.length === 0) {
      toast.error("Please select tags to add or remove");
      return;
    }

    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }

    setApplyingBulkTags(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const videoId of selectedVideoIds) {
        const video = videos.find(v => v.videoId === videoId);
        if (!video) continue;

        let updatedTags = [...(video.tags || [])];
        
        // Add new tags
        bulkTagsToAdd.forEach(tag => {
          if (!updatedTags.includes(tag)) {
            updatedTags.push(tag);
          }
        });
        
        // Remove tags
        updatedTags = updatedTags.filter(tag => !bulkTagsToRemove.includes(tag));

        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/tags`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ tags: updatedTags }),
            }
          );
          
          const data = await response.json();
          if (data.success) {
            successCount++;
            setVideos(videos.map(v => 
              v.videoId === videoId ? { ...v, tags: updatedTags } : v
            ));
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error updating tags for video ${videoId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Updated ${successCount} video${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} video${errorCount > 1 ? 's' : ''}`);
      }

      // Reset state
      setSelectedVideoIds([]);
      setBulkTagsToAdd([]);
      setBulkTagsToRemove([]);
      setShowBulkTagDialog(false);
      await fetchDatabaseVideos();
    } catch (error) {
      console.error("Error applying bulk tags:", error);
      toast.error("Failed to update tags");
    } finally {
      setApplyingBulkTags(false);
    }
  };

  const toggleVideoSelection = (videoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedVideoIds(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const selectAllVideos = () => {
    setSelectedVideoIds(filteredVideos.map(v => v.videoId));
  };

  const deselectAllVideos = () => {
    setSelectedVideoIds([]);
  };

  // Fetch analytics for both 28 days AND lifetime (with impressions/CTR) and create two snapshots
  const fetchDualSnapshot = async (videoId: string) => {
    if (!analyticsConnected) {
      toast.error("Please connect YouTube Analytics first");
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    setFetchingAnalytics(true);
    
    try {
      console.log("🎯 Fetching dual snapshot (28 days + lifetime) for video:", videoId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${videoId}/dual-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      const data = await response.json();
      
      console.log("Dual snapshot response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to fetch dual snapshot");
      }
      
      if (data.success) {
        // Refresh the video data
        await fetchDatabaseVideos();
        
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-bold">✅ Dual Snapshot Complete!</div>
            <div className="text-xs">Created 2 snapshots:</div>
            <div className="text-xs">• Lifetime: {data.lifetimeData.views.toLocaleString()} views, {data.lifetimeData.ctr}% CTR</div>
            <div className="text-xs">• Last 28 days: {data.last28Data.views.toLocaleString()} views, {data.last28Data.ctr}% CTR</div>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.error("No data returned from dual snapshot");
      }
    } catch (error) {
      console.error("Error fetching dual snapshot:", error);
      toast.error(`Failed to fetch dual snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFetchingAnalytics(false);
    }
  };

  // Export data to CSV with custom fields
  const exportToCSV = (useDialog = true) => {
    if (useDialog) {
      setShowExportDialog(true);
      return;
    }
    
    // Build headers based on selected fields
    const headerMap: { [key: string]: string } = {
      publishedAt: "Published Date",
      duration: "Duration",
      views: "Views",
      likes: "Likes",
      comments: "Comments",
      subscribers: "Subscribers",
      impressions: "Impressions",
      ctr: "CTR %",
      percentageViewed: "Percentage Viewed %",
      watchTime: "Watch Time (min)",
      avgViewDuration: "Avg View Duration (sec)",
      trafficSource: "Top Traffic Source",
      tags: "Tags",
      notes: "Notes",
      nextSteps: "Tasks",
      thumbnailUrl: "Thumbnail URL",
      description: "Description"
    };
    
    const headers = ["Video ID", "Title"];
    const selectedFieldKeys: string[] = [];
    
    Object.entries(exportFields).forEach(([key, selected]) => {
      if (selected && headerMap[key]) {
        headers.push(headerMap[key]);
        selectedFieldKeys.push(key);
      }
    });
    
    const rows = filteredVideos.map(video => {
      // Handle nextSteps in both formats
      let nextStepsText = "";
      if (Array.isArray(video.nextSteps)) {
        nextStepsText = video.nextSteps.map(item => item.text).join("; ");
      } else if (typeof video.nextSteps === 'string') {
        nextStepsText = video.nextSteps;
      }
      
      // Get latest analytics snapshot data
      const latestSnapshot = video.analyticsHistory && video.analyticsHistory.length > 0
        ? [...video.analyticsHistory].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
        : null;
      
      const row = [
        video.videoId || '',
        `"${(video.title || '').replace(/"/g, '""')}"`
      ];
      
      selectedFieldKeys.forEach(key => {
        switch (key) {
          case 'publishedAt':
            row.push(`"${formatDate(video.publishedAt)}"`);
            break;
          case 'duration':
            row.push(formatVideoDuration(video.duration));
            break;
          case 'views':
            row.push(String(video.currentViews || 0));
            break;
          case 'likes':
            row.push(String(video.currentLikes || 0));
            break;
          case 'comments':
            row.push(String(video.currentComments || 0));
            break;
          case 'subscribers':
            row.push(String(channelInfo?.subscriberCount || 0));
            break;
          case 'impressions':
            row.push(String(latestSnapshot?.impressions || 0));
            break;
          case 'ctr':
            row.push(String(latestSnapshot?.ctr || 0));
            break;
          case 'percentageViewed':
            row.push(String(latestSnapshot?.averageViewPercentage || 0));
            break;
          case 'watchTime':
            // Convert watch time from seconds to minutes if needed
            const watchTimeMinutes = latestSnapshot?.averageViewDuration 
              ? Math.round((video.currentViews || 0) * latestSnapshot.averageViewDuration / 60)
              : 0;
            row.push(String(watchTimeMinutes));
            break;
          case 'avgViewDuration':
            row.push(String(latestSnapshot?.averageViewDuration || 0));
            break;
          case 'trafficSource':
            row.push(`"${(latestSnapshot?.topTrafficSource || '').replace(/"/g, '""')}"`);
            break;
          case 'tags':
            row.push(`"${(video.tags || []).join(', ')}"`);
            break;
          case 'notes':
            row.push(`"${(video.notes || '').replace(/"/g, '""')}"`);
            break;
          case 'nextSteps':
            row.push(`"${nextStepsText.replace(/"/g, '""')}"`);
            break;
          case 'thumbnailUrl':
            row.push(video.thumbnailUrl || '');
            break;
          case 'description':
            row.push(`"${(video.description || '').replace(/"/g, '""')}"`);
            break;
        }
      });
      
      return row;
    });
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tubelab-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredVideos.length} videos to CSV`);
    setShowExportDialog(false);
  };

  // Bulk update videos from CSV
  const handleBulkUpdate = async (updates: Array<{
    videoId: string;
    tags?: string[];
    videoNotes?: string;
    nextStepNotes?: string;
  }>) => {
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        // Update tags if provided
        if (update.tags && update.tags.length > 0) {
          const tagsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${update.videoId}/tags`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ tags: update.tags }),
            }
          );

          if (!tagsResponse.ok) {
            console.error(`Failed to update tags for ${update.videoId}`);
            errorCount++;
            continue;
          }
        }

        // Update notes if provided
        if (update.videoNotes || update.nextStepNotes) {
          const video = videos.find(v => v.videoId === update.videoId);
          
          // Convert nextStepNotes string to array format
          let nextStepsData = video?.nextSteps || [];
          if (update.nextStepNotes) {
            // Split by newlines and convert to checklist items
            nextStepsData = update.nextStepNotes.split('\n')
              .filter(line => line.trim())
              .map(line => ({
                id: Math.random().toString(36).substr(2, 9),
                text: line.trim(),
                completed: false
              }));
          }
          
          const notesResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${update.videoId}/notes`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                notes: update.videoNotes || video?.notes || "",
                nextSteps: nextStepsData,
              }),
            }
          );

          if (!notesResponse.ok) {
            console.error(`Failed to update notes for ${update.videoId}`);
            errorCount++;
            continue;
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error updating video ${update.videoId}:`, error);
        errorCount++;
      }
    }

    // Refresh the videos list
    await fetchDatabaseVideos();

    return { successCount, errorCount };
  };

  // Delete video
  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video from your database?")) {
      return;
    }

    try {
      // Get fresh Supabase session token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("Session expired. Please refresh the page.");
        return;
      }
      
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      toast.success("Video deleted");
      setVideos(videos.filter(v => v.videoId !== videoId));
      
      if (selectedVideo?.videoId === videoId) {
        setIsDialogOpen(false);
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  // Clean up invalid video entries
  const cleanupInvalidVideos = async () => {
    // Validate YouTube video ID format (11 characters, alphanumeric with dashes/underscores)
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    const invalidVideos = videos.filter(v => !videoIdPattern.test(v.videoId));
    
    if (invalidVideos.length === 0) {
      toast.info("No invalid video entries found");
      return;
    }
    
    if (!confirm(`Found ${invalidVideos.length} invalid video entries (e.g., date strings). Delete them?`)) {
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const video of invalidVideos) {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to delete invalid video ${video.videoId}:`, error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Cleaned up ${successCount} invalid entries${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        await fetchDatabaseVideos();
      } else {
        toast.error("Failed to clean up invalid entries");
      }
    } catch (error) {
      console.error("Error cleaning up invalid videos:", error);
      toast.error("Failed to clean up invalid entries");
    }
  };

  // Delete all videos from database
  const clearAllVideos = async () => {
    if (!confirm(`⚠️ This will delete ALL ${videos.length} videos from your database. This cannot be undone.\n\nYou can re-sync from YouTube afterwards.\n\nAre you sure?`)) {
      return;
    }
    
    if (!confirm(`Really delete all ${videos.length} videos? Click OK to confirm.`)) {
      return;
    }
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      console.log(`🗑️ Deleting all ${videos.length} videos from database...`);
      
      for (const video of videos) {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${video.videoId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          successCount++;
          console.log(`🗑️ Deleted: ${video.title}`);
        } catch (error) {
          console.error(`Failed to delete video ${video.videoId}:`, error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Cleared ${successCount} videos${errorCount > 0 ? ` (${errorCount} failed)` : ''}. Ready for fresh sync!`);
        await fetchDatabaseVideos();
      } else {
        toast.error("Failed to clear videos");
      }
      
      console.log(`✅ Clear complete: ${successCount} deleted, ${errorCount} errors`);
    } catch (error) {
      console.error("Error clearing videos:", error);
      toast.error("Failed to clear videos");
    } finally {
      setLoading(false);
    }
  };

  // Nuclear option: Delete ALL analytics history using the proper server endpoint
  const cleanupBasicAnalytics = async () => {
    setCleaningData(true);
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      setCleaningData(false);
      return;
    }
    
    // Count snapshots before deletion
    let totalSnapshotsDeleted = 0;
    const videosWithSnapshots = videos.filter(v => v.analyticsHistory && v.analyticsHistory.length > 0);
    videosWithSnapshots.forEach(v => {
      totalSnapshotsDeleted += v.analyticsHistory?.length || 0;
    });
    
    try {
      console.log('💣 Starting NUCLEAR cleanup - deleting ALL analytics history...');
      console.log(`  - Will clear ${totalSnapshotsDeleted} snapshots from ${videosWithSnapshots.length} videos`);
      console.log('  - ALL data will be removed: views, likes, comments, impressions, CTR, retention, traffic, etc.');
      console.log('  - Videos themselves will NOT be deleted (title, tags, notes, performance goals preserved)');
      
      // Use the proper server endpoint that clears ALL analytics at once
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/clear-analytics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      console.log('📡 Clear analytics response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to clear analytics:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Server response:', result);
      
      // Refresh videos to show updated data
      console.log('🔄 Refreshing video list...');
      await fetchDatabaseVideos();
      
      console.log('✅ Nuclear cleanup complete!');
      console.log(`  - Videos processed: ${result.clearedCount || videosWithSnapshots.length}`);
      console.log(`  - Total snapshots deleted: ${totalSnapshotsDeleted}`);
      console.log('  - Your database is now clean. Ready to rebuild from scratch!');
      
      toast.success(
        `Nuclear cleanup complete! Deleted ${totalSnapshotsDeleted} snapshots from ${result.clearedCount || videosWithSnapshots.length} videos. ` +
        `Ready to rebuild with fresh data!`,
        { duration: 5000 }
      );
      
      setShowCleanupDialog(false);
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      toast.error(`Failed to clean up analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleaningData(false);
    }
  };

  // Open video details dialog
  const openVideoDetails = (video: VideoData) => {
    setSelectedVideo(video);
    setActiveTab("details"); // Reset to details tab when opening modal
    setNotes(video.notes || "");
    
    // Handle migration from string to array format for nextSteps
    if (Array.isArray(video.nextSteps)) {
      setNextSteps(video.nextSteps);
    } else if (typeof video.nextSteps === 'string' && video.nextSteps.trim()) {
      // Migrate old string format to array (split by newlines)
      const items = video.nextSteps.split('\n').filter(line => line.trim()).map(line => ({
        id: Math.random().toString(36).substr(2, 9),
        text: line.trim(),
        completed: false
      }));
      setNextSteps(items);
    } else {
      setNextSteps([]);
    }
    
    setVideoTags(video.tags || []);
    setAutoSnapshotEnabled(video.autoSnapshotEnabled || false);
    setSnapshotFrequency(video.snapshotFrequency || 'daily');
    setIsDialogOpen(true);
  };

  // Toggle auto snapshot
  const toggleAutoSnapshot = async (enabled: boolean) => {
    if (!selectedVideo) return;
    
    // Get fresh Supabase session token
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("Session expired. Please refresh the page.");
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/auto-snapshot`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            autoSnapshotEnabled: enabled,
            snapshotFrequency 
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
        setVideos(videos.map(v => 
          v.videoId === selectedVideo.videoId ? data.video : v
        ));
        setSelectedVideo(data.video);
        setAutoSnapshotEnabled(enabled);
      }
    } catch (error) {
      console.error("Error toggling auto-snapshot:", error);
      toast.error("Failed to update auto-sync setting");
    }
  };

  // Format number with commas
  const formatNumber = (num?: number) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  // Format watch time minutes to hours
  const formatWatchTime = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return "N/A";
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hours`;
  };

  // Format video duration from ISO 8601 to readable format (e.g., "4:13")
  const formatVideoDuration = (duration?: string) => {
    if (!duration) return "0:00";
    const seconds = parseDuration(duration);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const getChartData = (video: VideoData) => {
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return [];
    }

    // Check if video is ≤28 days old
    const now = new Date();
    const publishDate = new Date(video.publishedAt);
    const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    const isYoungVideo = daysOld <= 28;

    // Filter and sort snapshots by timestamp (oldest to newest) for proper chronological display
    const filteredSnapshots = [...video.analyticsHistory]
      .filter(snapshot => {
        // Strictly filter snapshots based on dateRange - never mix lifetime and 28-day
        // But always include milestones in 28-day view
        const snapshotDateRange = snapshot.dateRange || 'lifetime';
        const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
        
        // If we're in 28-day view, include both last28 snapshots AND milestones
        if (currentFilter === 'last28') {
          return snapshotDateRange === 'last28' || snapshot.milestone !== undefined;
        }
        
        // For lifetime view, only show lifetime snapshots
        return snapshotDateRange === currentFilter;
      })
      .sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    // For lifetime data, enforce monotonic increasing (views should never decrease)
    const isLifetimeView = dateRangeFilter === 'sincePublished';
    
    // Use helper to make dates unique and add basic metrics
    const chartData = makeChartDataUnique(filteredSnapshots).map(snapshot => ({
      date: snapshot.date,
      timestamp: snapshot.timestamp,
      views: snapshot.views,
      likes: snapshot.likes,
      comments: snapshot.comments,
      key: snapshot.key,
    }));

    // Enforce monotonic increasing for lifetime data
    if (isLifetimeView && chartData.length > 1) {
      let maxViews = chartData[0].views || 0;
      let maxLikes = chartData[0].likes || 0;
      let maxComments = chartData[0].comments || 0;
      
      for (let i = 1; i < chartData.length; i++) {
        // Ensure values never decrease (lifetime metrics are cumulative)
        if (chartData[i].views < maxViews) {
          console.warn(`⚠️ Lifetime views decreased from ${maxViews} to ${chartData[i].views} on ${chartData[i].date}. Enforcing monotonic increase.`);
          chartData[i].views = maxViews;
        } else {
          maxViews = chartData[i].views;
        }
        
        if (chartData[i].likes < maxLikes) {
          chartData[i].likes = maxLikes;
        } else {
          maxLikes = chartData[i].likes;
        }
        
        if (chartData[i].comments < maxComments) {
          chartData[i].comments = maxComments;
        } else {
          maxComments = chartData[i].comments;
        }
      }
    }

    return chartData;
  };

  // Helper function to handle duplicate dates in chart data
  const makeChartDataUnique = <T extends { timestamp: string }>(snapshots: T[]): Array<T & { date: string, key: string }> => {
    // First pass: identify dates with multiple snapshots
    const dateCounts: { [key: string]: number } = {};
    snapshots.forEach(snapshot => {
      const baseDate = new Date(snapshot.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateCounts[baseDate] = (dateCounts[baseDate] || 0) + 1;
    });
    
    // Track date occurrences for labeling
    const dateOccurrence: { [key: string]: number } = {};
    
    return snapshots.map((snapshot, idx) => {
      const snapshotDate = new Date(snapshot.timestamp);
      const baseDate = snapshotDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      
      // Track occurrence count
      dateOccurrence[baseDate] = (dateOccurrence[baseDate] || 0) + 1;
      
      // If this date has multiple snapshots, append time to make them unique
      let displayDate = baseDate;
      if (dateCounts[baseDate] > 1) {
        const time = snapshotDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        displayDate = `${baseDate}\n${time}`;
      }
      
      return {
        ...snapshot,
        date: displayDate,
        key: `${snapshot.timestamp}-${idx}`,
      };
    });
  };

  // Get performance metrics data for chart
  const getPerformanceMetrics = (video: VideoData, dateRange: 'last28' | 'sincePublished' = 'sincePublished') => {
    const ctr = getCTRForDateRange(video, dateRange);
    const hasCTR = ctr !== null && ctr !== 0;
    const percentageViewed = getPercentageViewedForDateRange(video, dateRange);
    
    return [
      {
        metric: "Views/Day",
        value: calculateViewsPerDay(video),
      },
      {
        metric: hasCTR ? "CTR %" : "Engagement %",
        value: hasCTR ? parseFloat(ctr!.toFixed(2)) : parseFloat(calculateEngagementRate(video).toFixed(2)),
      },
      {
        metric: "Growth %",
        value: parseFloat(getGrowthRateForDateRange(video, dateRange).toFixed(2)),
      },
      {
        metric: "% Viewed",
        value: parseFloat(percentageViewed.toFixed(2)),
      },
    ];
  };

  // List view sorting
  const handleListSort = (column: string) => {
    if (listSortBy === column) {
      setListSortDirection(listSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setListSortBy(column);
      setListSortDirection('desc');
    }
  };

  // Get sorted videos for list view
  const getSortedListVideos = () => {
    if (!listSortBy) return filteredVideos;
    
    const sorted = [...filteredVideos].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (listSortBy) {
        case 'publishDate':
          aVal = new Date(a.publishedAt).getTime();
          bVal = new Date(b.publishedAt).getTime();
          break;
        case 'views':
          aVal = getMetricsForDateRange(a, dateRangeFilter).views || 0;
          bVal = getMetricsForDateRange(b, dateRangeFilter).views || 0;
          break;
        case 'percentViewed':
          aVal = getPercentageViewedForDateRange(a, dateRangeFilter);
          bVal = getPercentageViewedForDateRange(b, dateRangeFilter);
          break;
        case 'impressions':
          aVal = getImpressionsForDateRange(a, dateRangeFilter) || 0;
          bVal = getImpressionsForDateRange(b, dateRangeFilter) || 0;
          break;
        case 'ctr':
          aVal = getCTRForDateRange(a, dateRangeFilter) || 0;
          bVal = getCTRForDateRange(b, dateRangeFilter) || 0;
          break;
        case 'likes':
          aVal = getMetricsForDateRange(a, dateRangeFilter).likes || 0;
          bVal = getMetricsForDateRange(b, dateRangeFilter).likes || 0;
          break;
        case 'comments':
          aVal = getMetricsForDateRange(a, dateRangeFilter).comments || 0;
          bVal = getMetricsForDateRange(b, dateRangeFilter).comments || 0;
          break;
        case 'avgViewDuration':
          aVal = getAvgViewDurationForDateRange(a, dateRangeFilter) || 0;
          bVal = getAvgViewDurationForDateRange(b, dateRangeFilter) || 0;
          break;
        case 'watchTime':
          // Get watch time in hours for sorting
          const aSnapshots = a.analyticsHistory?.filter(s => {
            const snapshotDateRange = s.dateRange || 'lifetime';
            const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
            return snapshotDateRange === currentFilter && s.estimatedMinutesWatched !== undefined;
          }) || [];
          const aLatestSnapshot = aSnapshots.sort((x, y) => 
            new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
          )[0];
          aVal = aLatestSnapshot?.estimatedMinutesWatched || 0;
          
          const bSnapshots = b.analyticsHistory?.filter(s => {
            const snapshotDateRange = s.dateRange || 'lifetime';
            const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
            return snapshotDateRange === currentFilter && s.estimatedMinutesWatched !== undefined;
          }) || [];
          const bLatestSnapshot = bSnapshots.sort((x, y) => 
            new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
          )[0];
          bVal = bLatestSnapshot?.estimatedMinutesWatched || 0;
          break;
        case 'topTrafficSource':
          aVal = getTopTrafficSourceForDateRange(a, dateRangeFilter) || '';
          bVal = getTopTrafficSourceForDateRange(b, dateRangeFilter) || '';
          break;
        default:
          return 0;
      }
      
      if (listSortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return sorted;
  };

  // Export list view to CSV
  const exportListViewToCSV = () => {
    const videosToExport = getSortedListVideos();
    
    // Build CSV header based on visible columns
    const headers = ['Title'];
    if (visibleColumns.publishDate) headers.push('Publish Date');
    if (visibleColumns.views) headers.push('Views');
    if (visibleColumns.percentViewed) headers.push('% Viewed');
    if (visibleColumns.impressions) headers.push('Impressions');
    if (visibleColumns.ctr) headers.push('CTR %');
    if (visibleColumns.likes) headers.push('Likes');
    if (visibleColumns.comments) headers.push('Comments');
    if (visibleColumns.duration) headers.push('Duration');
    if (visibleColumns.watchTime) headers.push('Watch Time (hours)');
    if (visibleColumns.avgViewDuration) headers.push('Avg View Duration (s)');
    if (visibleColumns.topTrafficSource) headers.push('Top Traffic Source');
    
    // Build CSV rows
    const rows = videosToExport.map(video => {
      const row = [video.title];
      
      if (visibleColumns.publishDate) {
        row.push(new Date(video.publishedAt).toLocaleDateString());
      }
      if (visibleColumns.views) {
        row.push(String(getMetricsForDateRange(video, dateRangeFilter).views || 0));
      }
      if (visibleColumns.percentViewed) {
        row.push(getPercentageViewedForDateRange(video, dateRangeFilter).toFixed(1) + '%');
      }
      if (visibleColumns.impressions) {
        const impressions = getImpressionsForDateRange(video, dateRangeFilter);
        row.push(impressions ? String(impressions) : 'N/A');
      }
      if (visibleColumns.ctr) {
        const ctr = getCTRForDateRange(video, dateRangeFilter);
        row.push(ctr ? ctr.toFixed(2) + '%' : 'N/A');
      }
      if (visibleColumns.likes) {
        row.push(String(getMetricsForDateRange(video, dateRangeFilter).likes || 0));
      }
      if (visibleColumns.comments) {
        row.push(String(getMetricsForDateRange(video, dateRangeFilter).comments || 0));
      }
      if (visibleColumns.duration) {
        row.push(video.duration ? formatDuration(video.duration) : 'N/A');
      }
      if (visibleColumns.watchTime) {
        // Get latest snapshot with watch time data for the current date range filter
        const snapshots = video.analyticsHistory?.filter(s => {
          const snapshotDateRange = s.dateRange || 'lifetime';
          const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
          return snapshotDateRange === currentFilter && s.estimatedMinutesWatched !== undefined;
        }) || [];
        const latestSnapshot = snapshots.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        const watchTimeMinutes = latestSnapshot?.estimatedMinutesWatched;
        if (watchTimeMinutes === undefined || watchTimeMinutes === null) {
          row.push('N/A');
        } else {
          const watchTimeHours = watchTimeMinutes / 60;
          row.push(watchTimeHours.toFixed(1));
        }
      }
      if (visibleColumns.avgViewDuration) {
        const duration = getAvgViewDurationForDateRange(video, dateRangeFilter);
        row.push(duration ? String(duration) : 'N/A');
      }
      if (visibleColumns.topTrafficSource) {
        const source = getTopTrafficSourceForDateRange(video, dateRangeFilter);
        row.push(source || 'N/A');
      }
      
      return row;
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `video-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('List view exported to CSV!');
  };

  // Custom tooltip for engagement metrics chart
  const EngagementTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}{entry.dataKey === "ctr" ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    console.log("🎬 Video Database loaded");
    console.log("📍 Current URL:", window.location.href);
    console.log("🔐 OAuth Redirect URI:", `${window.location.origin}/oauth-callback.html`);
    console.log("⚠️  Make sure this redirect URI is added to Google Cloud Console!");
    
    fetchDatabaseVideos();
    checkAnalyticsConnection();
    fetchChannelInfo();
    fetchYouTubeChannelId();
    
    // One-time migration: Auto-retag shorts if not already done
    const shortsRetagged = sessionStorage.getItem('shorts_retagged_v1');
    if (!shortsRetagged) {
      setTimeout(() => {
        console.log('🔖 Running one-time shorts retagging migration...');
        retagShorts();
        sessionStorage.setItem('shorts_retagged_v1', 'true');
      }, 3000); // Wait 3 seconds to let videos load first
    }
    
    // Handle OAuth callback (only once)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    // Check if Google returned an error
    if (error) {
      console.error("❌ OAuth ERROR from Google:", error);
      const errorDescription = urlParams.get('error_description');
      console.error("Error description:", errorDescription);
      
      // Show detailed error dialog
      setOAuthErrorDetails({
        error: error,
        description: errorDescription || undefined
      });
      setShowOAuthErrorDialog(true);
      
      // Also show a toast
      toast.error(`OAuth failed: ${errorDescription || error}`, { duration: 10000 });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (code && !sessionStorage.getItem('oauth_processing')) {
      console.log("🔑 OAuth code detected in URL, processing callback...");
      console.log("Code length:", code.length);
      console.log("Code preview:", code.substring(0, 20) + "...");
      sessionStorage.setItem('oauth_processing', 'true');
      handleOAuthCallback(code).finally(() => {
        sessionStorage.removeItem('oauth_processing');
      });
    } else if (code) {
      console.log("⚠️ OAuth code detected but already being processed (sessionStorage flag set)");
    } else {
      console.log("ℹ️ No OAuth code in URL - normal page load");
    }
  }, []);
  
  // Fetch top videos when the Top Content filter is selected
  useEffect(() => {
    if (selectedPresetFilter === "topContent" && analyticsConnected) {
      console.log('🌟 Top Content filter selected, fetching top videos...');
      fetchTopVideos();
      // Automatically switch to ranking sort when Top Content is selected
      setSortBy("ranking");
    }
  }, [selectedPresetFilter, analyticsConnected, dateRangeFilter]);
  
  // Update publish dates after videos are loaded
  useEffect(() => {
    if (videos.length > 0) {
      const alreadyUpdated = sessionStorage.getItem('publish_dates_updated_oct2024');
      if (!alreadyUpdated) {
        console.log('Videos loaded, updating publish dates...');
        // Update publish dates for specific videos
        setTimeout(() => {
          updatePublishDate('57rMRfe4rmg', '2024-07-25T12:00:00Z'); // July 25, 2024
          updatePublishDate('-GZS0gwb4wA', '2024-09-20T12:00:00Z'); // Sept 20, 2024
        }, 1000);
        
        sessionStorage.setItem('publish_dates_updated_oct2024', 'true');
      }
      
      // Run auto-snapshots automation after videos are loaded
      // Check if we've already run auto-snapshots this session
      const autoSnapshotsRan = sessionStorage.getItem('auto_snapshots_ran');
      if (!autoSnapshotsRan) {
        console.log('🤖 Triggering auto-snapshot automation...');
        setTimeout(() => {
          runAutoSnapshots(true); // Silent mode on page load
        }, 2000); // Wait 2 seconds to let other initializations complete
        sessionStorage.setItem('auto_snapshots_ran', 'true');
      }
    }
  }, [videos]);
  
  // Check for newly achieved goals
  useEffect(() => {
    const newNotifications: Array<{id: string, videoId: string, videoTitle: string, goalType: string, timestamp: string}> = [];
    
    videos.forEach(video => {
      if (video.performanceGoals && video.performanceGoals.length > 0) {
        video.performanceGoals.forEach(goal => {
          const isAchieved = checkGoalAchievement(goal, video);
          const notificationId = `${video.videoId}-${goal.id}`;
          
          // Check if this goal was just achieved (not already in notifications and not dismissed)
          if (isAchieved && !notifications.some(n => n.id === notificationId) && !dismissedNotifications.has(notificationId)) {
            const getMetricLabel = (metricType: string) => {
              switch (metricType) {
                case 'views': return 'Views';
                case 'likes': return 'Likes';
                case 'reach': return 'Reach';
                case 'growth': return 'Growth';
                case 'percentViewed': return '%Viewed';
                case 'comments': return 'Comments';
                case 'engagement': return 'Engagement Rate';
                default: return metricType;
              }
            };
            
            newNotifications.push({
              id: notificationId,
              videoId: video.videoId,
              videoTitle: video.title,
              goalType: getMetricLabel(goal.metricType),
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    });
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
      toast.success(`🎉 ${newNotifications.length} goal${newNotifications.length > 1 ? 's' : ''} achieved!`, { duration: 5000 });
    }
  }, [videos]);
  
  // Re-fetch channel info when analytics connection status changes
  useEffect(() => {
    if (analyticsConnected) {
      console.log('📊 Analytics connected - fetching channel watch time...');
      fetchChannelInfo();
      // Also fetch video rankings so they show by default
      console.log('📊 Analytics connected - fetching video rankings...');
      fetchTopVideos();
    }
  }, [analyticsConnected]);
  
  // Filter and sort videos based on all active filters
  useEffect(() => {
    console.log('🔄 MAIN FILTER useEffect running. Shorts hidden by default unless "Short" tag selected');
    console.log('🔄 Running filter useEffect. showGoalsOnly:', showGoalsOnly);
    let filtered = [...videos];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(video => {
        const query = searchQuery.toLowerCase();
        const matchesBasic = video.title?.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query) ||
          video.notes?.toLowerCase().includes(query);
        
        // Check tags
        const matchesTags = video.tags?.some(tag => tag.toLowerCase().includes(query));
        
        // Check nextSteps (handle both array and string formats)
        let matchesNextSteps = false;
        if (Array.isArray(video.nextSteps)) {
          matchesNextSteps = video.nextSteps.some(item => item.text?.toLowerCase().includes(query));
        } else if (typeof video.nextSteps === 'string') {
          matchesNextSteps = video.nextSteps.toLowerCase().includes(query);
        }
        
        return matchesBasic || matchesTags || matchesNextSteps;
      });
    }
    
    // Filter by selected tags - videos must have ALL selected tags (AND logic)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(video =>
        selectedTags.every(tag => video.tags?.includes(tag))
      );
    }

    // Hide shorts by default unless "Short" tag is selected
    if (!selectedTags.includes('Short')) {
      filtered = filtered.filter(video => !video.tags?.includes('Short'));
    }
    
    // Filter by next steps - only show videos with uncompleted next steps
    if (showNextStepsOnly) {
      filtered = filtered.filter(video => {
        if (Array.isArray(video.nextSteps)) {
          return video.nextSteps.some(step => !step.completed);
        } else if (typeof video.nextSteps === 'string') {
          return video.nextSteps.trim().length > 0;
        }
        return false;
      });
    }
    
    // Filter by goals
    if (showGoalsOnly) {
      console.log('🎯 Goals filter is ON. Checking all videos for goals...');
      console.log(`   Total videos before goals filter: ${filtered.length}`);
      
      // Log which videos have goals
      const videosWithGoals = videos.filter(v => v.performanceGoals && v.performanceGoals.length > 0);
      console.log(`   Videos with goals in database: ${videosWithGoals.length}`);
      videosWithGoals.forEach(v => {
        console.log(`   ✓ "${v.title}" has ${v.performanceGoals?.length} goal(s)`);
      });
      
      filtered = filtered.filter(video => {
        const hasGoals = video.performanceGoals && video.performanceGoals.length > 0;
        if (!hasGoals && video.performanceGoals) {
          console.log(`   ✗ "${video.title}" - performanceGoals exists but is empty`);
        }
        return hasGoals;
      });
      
      console.log(`   Videos after goals filter: ${filtered.length}`);
    }
    
    // Apply preset analytics filter
    if (selectedPresetFilter !== "none") {
      const presetFilter = PRESET_FILTERS.find(f => f.id === selectedPresetFilter);
      if (presetFilter) {
        if (selectedPresetFilter === "topContent") {
          // For Top Content filter, show only top 10 ranked videos
          if (Object.keys(videoRankings).length > 0) {
            filtered = filtered.filter(video => {
              const rank = videoRankings[video.videoId];
              return rank && rank <= 10;
            });
          }
        } else {
          filtered = filtered.filter(video => presetFilter.evaluate(video));
        }
      }
    }
    
    // Publish date range filter
    if (publishDateFilter !== "all") {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      filtered = filtered.filter(video => {
        if (!video.publishedAt) return false;
        const publishDate = new Date(video.publishedAt);
        
        switch (publishDateFilter) {
          case "30days":
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return publishDate >= thirtyDaysAgo;
          case "60days":
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            return publishDate >= sixtyDaysAgo;
          case "90days":
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            return publishDate >= ninetyDaysAgo;
          case "thisYear":
            return publishDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    }
    
    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case "views":
          return (getMetricsForDateRange(b, dateRangeFilter).views || 0) - (getMetricsForDateRange(a, dateRangeFilter).views || 0);
        case "likes":
          return (getMetricsForDateRange(b, dateRangeFilter).likes || 0) - (getMetricsForDateRange(a, dateRangeFilter).likes || 0);
        case "ctr":
          const ctrA = getCTRForDateRange(a, dateRangeFilter) || 0;
          const ctrB = getCTRForDateRange(b, dateRangeFilter) || 0;
          return ctrB - ctrA;
        case "growth":
          return getGrowthRateForDateRange(b, dateRangeFilter) - getGrowthRateForDateRange(a, dateRangeFilter);
        case "percentViewed":
          return getPercentageViewedForDateRange(b, dateRangeFilter) - getPercentageViewedForDateRange(a, dateRangeFilter);
        case "ranking":
          // Sort by ranking using videoRankings map
          const rankA = videoRankings[a.videoId];
          const rankB = videoRankings[b.videoId];
          // Videos without rankings go to the end
          if (!rankA && !rankB) return 0;
          if (!rankA) return 1;
          if (!rankB) return -1;
          return rankA - rankB; // Lower rank number comes first
        default:
          return 0;
      }
    });
    
    setFilteredVideos(filtered);
  }, [videos, searchQuery, selectedTags, showNextStepsOnly, showGoalsOnly, selectedPresetFilter, sortBy, dateRangeFilter, videoRankings, publishDateFilter]);
  
  // Handle OAuth callback
  const handleOAuthCallback = async (code: string) => {
    console.log("=== 🔄 Starting OAuth Callback Handler ===");
    try {
      const redirectUri = `${window.location.origin}/oauth-callback.html`;
      
      console.log("📋 OAuth Callback Details:");
      console.log("  - Redirect URI:", redirectUri);
      console.log("  - Current origin:", window.location.origin);
      console.log("  - Auth code (preview):", code.substring(0, 20) + "...");
      console.log("  - Auth code length:", code.length);
      console.log("  - Server endpoint:", `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/callback`);
      
      toast.info("Exchanging authorization code for access tokens...", { duration: 2000 });
      
      // Get fresh Supabase session token before making the request
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("❌ No valid Supabase session found");
        toast.error("Session expired. Please refresh the page and try again.");
        return;
      }
      
      console.log("🔐 Using fresh Supabase access token for OAuth callback");
      console.log("🔐 Token preview:", session.access_token.substring(0, 50) + "...");
      console.log("🔐 Token length:", session.access_token.length);
      console.log("🔐 User ID from session:", session.user?.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code, redirectUri }),
        }
      );
      
      console.log("📡 Server response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ OAuth callback successful!");
        console.log("Response data:", data);
        
        setAnalyticsConnected(true);
        toast.success("🎉 Successfully connected to YouTube Analytics! You can now fetch advanced metrics.", { duration: 5000 });
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const errorData = await response.json();
        console.error("❌ === OAUTH CALLBACK FAILED ===");
        console.error("Status:", response.status);
        console.error("Status text:", response.statusText);
        console.error("Error response:", errorData);
        console.error("Redirect URI sent:", redirectUri);
        console.error("===============================");
        
        // Show user-friendly error with actionable information
        const errorMsg = errorData.details || errorData.error || "Unknown error";
        let helpText = "";
        
        if (errorMsg.includes("redirect_uri_mismatch") || errorMsg.includes("Redirect URI mismatch")) {
          helpText = `\n\nThe redirect URI doesn't match what's configured in Google Cloud Console. Expected: ${redirectUri}`;
        } else if (errorMsg.includes("invalid_client")) {
          helpText = "\n\nThe Client ID or Client Secret is incorrect. Please verify in Google Cloud Console.";
        } else if (errorMsg.includes("invalid_grant") || errorMsg.includes("expired")) {
          helpText = "\n\nThe authorization code has expired or was already used. Please try connecting again.";
        }
        
        toast.error(`OAuth failed: ${errorMsg}${helpText}`, { duration: 15000 });
      }
    } catch (error) {
      console.error("❌ Exception in OAuth callback handler:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      toast.error(`Failed to complete authentication: ${error instanceof Error ? error.message : 'Unknown error'}`, { duration: 10000 });
    }
    console.log("=== 🏁 OAuth Callback Handler Finished ===");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 md:p-6 lg:p-8">
        {/* Header - Above Purple Box */}
        <div className="mb-2">
          {/* Icons Row - Above Logo on Mobile only */}
          <div className="flex justify-end gap-2 mb-4 md:hidden">
            {/* Notifications Bell - Mobile Trigger Only */}
            <Button
              variant="ghost"
              className="relative h-auto p-3"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
            
            {/* Settings Button - Mobile */}
            <Button
              variant="ghost"
              className="h-auto p-3"
              onClick={() => setShowSettings(true)}
            >
              <Settings style={{ width: '20px', height: '20px' }} />
            </Button>
            
            {/* Feedback Button - Mobile */}
            <Button
              variant="ghost"
              className="h-auto p-3"
              onClick={() => setShowFeedbackDialog(true)}
              title="Send Feedback"
            >
              <MessageSquare style={{ width: '20px', height: '20px' }} />
            </Button>
            
            {/* Logout Button - Mobile */}
            <Button
              variant="ghost"
              className="h-auto p-3"
              onClick={onLogout}
              title="Log Out"
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
            </Button>
          </div>
          
          {/* Logo Row - Centered on Mobile, 3-column on Desktop */}
          <div className="flex justify-center md:justify-between items-start mb-6 md:pt-0">
            {/* Desktop spacer - left side */}
            <div className="flex-1 hidden md:block" />
            
            {/* Logo - centered, with link to homepage */}
            <div className="flex justify-center flex-1 md:min-w-0 px-4 md:px-0">
              <a href="/" className="block w-full max-w-[350px] md:max-w-[385px]">
                <TubeLabLogo 
                  isDarkMode={isDarkMode}
                  className="w-full h-auto"
                />
              </a>
            </div>
            
            {/* Settings and Notifications - right side - Desktop only */}
            <div className="flex-1 hidden md:flex justify-end gap-2 pt-2">
              {/* Notifications Bell - Desktop Trigger Only */}
              <Button
                variant="ghost"
                className="relative h-auto p-3"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell style={{ width: '20px', height: '20px' }} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
              {/* Settings Button - Desktop */}
              <Button
                variant="ghost"
                className="h-auto p-3"
                onClick={() => setShowSettings(true)}
              >
                <Settings style={{ width: '20px', height: '20px' }} />
              </Button>
              
              {/* Feedback Button - Desktop */}
              <Button
                variant="ghost"
                className="h-auto p-3"
                onClick={() => setShowFeedbackDialog(true)}
                title="Send Feedback"
              >
                <MessageSquare style={{ width: '20px', height: '20px' }} />
              </Button>
              
              {/* Logout Button - Desktop */}
              <Button
                variant="ghost"
                className="h-auto p-3"
                onClick={onLogout}
                title="Log Out"
              >
                <LogOut style={{ width: '20px', height: '20px' }} />
              </Button>
            </div>
          </div>
        </div>

        {/* Shared Notifications Popover */}
        {showNotifications && (
          <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
            <div 
              className="absolute right-2 md:right-4 top-20 md:top-24 w-[calc(100vw-1rem)] max-w-[320px] md:w-80 bg-popover text-popover-foreground rounded-md border shadow-md flex flex-col max-h-[500px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 md:p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm md:text-base">Notifications</h3>
                  <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {/* Goals Filter Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notification-goals-filter"
                        checked={showGoalsOnly}
                        onCheckedChange={setShowGoalsOnly}
                        className="scale-75"
                      />
                      <Label 
                        htmlFor="notification-goals-filter" 
                        className="cursor-pointer whitespace-nowrap text-xs text-muted-foreground"
                      >
                        Goals
                      </Label>
                    </div>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Add all current notification IDs to dismissed set
                          setDismissedNotifications(prev => {
                            const newSet = new Set(prev);
                            notifications.forEach(n => newSet.add(n.id));
                            return newSet;
                          });
                          setNotifications([]);
                        }}
                        className="text-xs h-auto py-1"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="divide-y">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="p-4 hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => {
                          const video = videos.find(v => v.videoId === notification.videoId);
                          if (video) {
                            openVideoDetails(video);
                            setActiveTab('goals');
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Goal Achieved! 🎉</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">{notification.goalType}</span> goal reached for{' '}
                              <span className="font-medium">{notification.videoTitle}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-2">
          <div className="text-center px-4 mb-5">
            <p className="text-foreground/90 md:text-foreground/70 text-base font-semibold md:font-normal">
              Manage your YouTube videos, add notes, track analytics, and set performance goals.
            </p>
          </div>
        </div>

        {/* Trial Status Banner */}
        <TrialStatusBanner userId={userId} accessToken={accessToken} />

        {/* Purple Box with Channel Info and Actions */}
        <div className="mb-8 rounded-[5px] p-6 md:p-8" style={{ 
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%), ${themeColor}` 
        }}>
          {/* Channel Information */}
          {channelInfo ? (
            <div className="mb-6 flex flex-col items-center justify-center gap-4 text-white/90">
              {/* Profile Picture + Name/Handle */}
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
                {channelInfo.thumbnailUrl && (
                  <a 
                    href={`https://youtube.com/${channelInfo.customUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={channelInfo.thumbnailUrl} 
                      alt={channelInfo.title}
                      className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-full object-cover border-2 border-white/20"
                    />
                  </a>
                )}
                <div className="flex flex-col items-center md:items-start gap-1">
                  <div className="text-white text-center md:text-left" style={{ fontSize: '28px', lineHeight: '1.1' }}>
                    {channelInfo.title}
                  </div>
                  {channelInfo.customUrl && (
                    <a 
                      href={`https://youtube.com/${channelInfo.customUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/90 hover:text-white transition-colors text-sm"
                    >
                      {channelInfo.customUrl} ↗
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-2 md:gap-6 text-base w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="font-bold md:font-semibold">Subscribers:</span>
                  <span className="font-semibold md:font-normal">{formatNumber(parseInt(channelInfo.subscriberCount))}</span>
                </div>
                {channelInfo.watchTimeMinutes && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold md:font-semibold">Watch Hours:</span>
                    <span className="font-semibold md:font-normal">{formatWatchTime(channelInfo.watchTimeMinutes)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-bold md:font-semibold">Analytics (OAuth):</span>
                  {analyticsConnected ? (
                    <span className="flex items-center gap-1.5 font-semibold md:font-normal">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={connectYouTubeAnalytics}
                      className="underline hover:text-white transition-colors cursor-pointer font-semibold md:font-normal"
                    >
                      Disconnected
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-col items-center justify-center gap-2 text-white/90">
              <div className="text-white text-center" style={{ fontSize: '28px', lineHeight: '1.1' }}>
                Connect Your Channel
              </div>
              <p className="text-white/70 text-sm">Click "YouTube Sync" below to get started</p>
            </div>
          )}



          {/* Actions Bar */}
          <TooltipProvider>
          <div className="flex flex-col gap-3 justify-center w-full">
          {/* Mobile: YouTube Sync - Full Width */}
          <div className="md:hidden">
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  onClick={() => setShowMainSyncDialog(true)}
                  disabled={syncing || checkingUpdates || fetchingAnalytics || importingEngagementCSV}
                  className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 w-full rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
                >
                  {syncing || checkingUpdates || fetchingAnalytics ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      {syncing ? "Syncing..." : "Refreshing..."}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      YouTube Sync
                    </>
                  )}
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent>
                {analyticsConnected ? (
                  <p>Fetch basic stats + advanced analytics (watch time, traffic, etc.) for all videos</p>
                ) : (
                  <p>Fetch basic stats (views, likes, comments) for all videos. Connect OAuth for advanced metrics.</p>
                )}
              </TooltipContent>
            </TooltipPrimitive.Root>
          </div>

          {/* Desktop: All buttons on one line */}
          <div className="hidden md:flex md:flex-row md:gap-3 md:justify-center">
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  onClick={() => setShowMainSyncDialog(true)}
                  disabled={syncing || checkingUpdates || fetchingAnalytics || importingEngagementCSV}
                  className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
                >
                  {syncing || checkingUpdates || fetchingAnalytics ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      {syncing ? "Syncing..." : "Refreshing..."}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      YouTube Sync
                    </>
                  )}
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent>
                {analyticsConnected ? (
                  <p>Fetch basic stats + advanced analytics (watch time, traffic, etc.) for all videos</p>
                ) : (
                  <p>Fetch basic stats (views, likes, comments) for all videos. Connect OAuth for advanced metrics.</p>
                )}
              </TooltipContent>
            </TooltipPrimitive.Root>

            <input
              type="file"
              accept=".csv"
              onChange={handleEngagementFileSelected}
              style={{ display: 'none' }}
              id="engagement-csv-import-input"
              disabled={importingEngagementCSV || syncing || checkingUpdates || fetchingAnalytics}
            />
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  onClick={() => setShowImportReachDialog(true)}
                  disabled={importingEngagementCSV || videos.length === 0 || syncing || checkingUpdates || fetchingAnalytics}
                  className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
                >
                  {importingEngagementCSV ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-1.5" />
                      Import Reach
                    </>
                  )}
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent>
                <p>Import impressions/CTR from YouTube Studio CSV</p>
              </TooltipContent>
            </TooltipPrimitive.Root>

            <Button
              onClick={() => exportToCSV(true)}
              disabled={filteredVideos.length === 0}
              className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
          </div>

          {/* Mobile: Import Reach & Export CSV - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleEngagementFileSelected}
              style={{ display: 'none' }}
              id="engagement-csv-import-input-mobile"
              disabled={importingEngagementCSV}
            />
            <TooltipPrimitive.Root>
              <TooltipPrimitive.Trigger asChild>
                <Button
                  onClick={() => setShowImportReachDialog(true)}
                  disabled={importingEngagementCSV || videos.length === 0}
                  className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 w-full rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
                >
                  {importingEngagementCSV ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-1.5" />
                      Import Reach
                    </>
                  )}
                </Button>
              </TooltipPrimitive.Trigger>
              <TooltipContent>
                <p>Import impressions/CTR from YouTube Studio CSV</p>
              </TooltipContent>
            </TooltipPrimitive.Root>
          </div>

          <Button
            onClick={() => exportToCSV(true)}
            disabled={filteredVideos.length === 0}
            className="bg-[#7c44ff] hover:bg-white text-white hover:text-[#7c44ff] transition-colors disabled:opacity-50 w-full rounded-full text-[14px] [&:hover_svg]:text-[#7c44ff]"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          </div>

          </div>
          </TooltipProvider>
        </div>

        {/* OAuth Configuration Help */}
        {showOAuthErrorDialog && (
          <>
            <Alert className="mb-4 border-2 border-blue-500 bg-blue-50">
              <AlertTitle className="flex items-center gap-2 text-blue-900">
                <BarChart3 className="w-5 h-5" />
                🚀 First Time Setup Required
              </AlertTitle>
              <AlertDescription className="text-blue-800 space-y-2 mt-2">
                <p className="font-semibold">Before clicking "Connect Analytics", open your browser console (F12) to see:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  <li>Your exact redirect URI (it will be displayed in the console)</li>
                  <li>Copy it and add it to Google Cloud Console (see instructions below)</li>
                </ul>
                <p className="text-sm mt-2">
                  📝 <strong>Expected redirect URI format:</strong>{" "}
                  <code className="bg-white px-2 py-1 rounded border border-blue-300">
                    {window.location.origin}/oauth-callback.html
                  </code>
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="mb-6">
              <OAuthDiagnostics />
            </div>
          </>
        )}
        
        {/* Analytics API Error Alert */}
        {analyticsError && (
          <Alert className="mb-4 border-2 border-orange-500 bg-orange-50">
            <AlertTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              YouTube Analytics API Temporarily Unavailable
            </AlertTitle>
            <AlertDescription className="text-orange-800 space-y-2 mt-2">
              <p>{analyticsError}</p>
              <div className="text-sm mt-3 space-y-1">
                <p className="font-semibold">Workarounds while waiting:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Use "Take Analytics Snapshot" for basic metrics (views, likes, comments)</li>
                  <li>Use "Add Advanced Data" button to manually enter watch time, CTR, etc.</li>
                  <li>Import CSV files from YouTube Studio Analytics</li>
                </ul>
              </div>
              <Button 
                onClick={() => setAnalyticsError(null)} 
                variant="outline" 
                size="sm"
                className="mt-3 bg-white border-orange-300 hover:bg-orange-100"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Controls */}
        {videos.length > 0 && (
          <Card className="p-4 mb-6 rounded-[5px]">
            <div className="flex flex-col gap-3 md:gap-4">
              {/* Mobile: Search */}
              <div className="relative w-full md:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-semibold md:font-normal placeholder:text-foreground/60 md:placeholder:text-muted-foreground placeholder:font-medium"
                />
              </div>

              {/* Desktop: Search and all filters on one line */}
              <div className="hidden md:flex md:flex-col md:gap-2">
                {/* Labels Row */}
                <div className="flex flex-row items-center gap-4">
                  <div className="flex-1 text-[12.25px] text-muted-foreground pl-1">Search</div>
                  <div className="w-[160px] text-[12.25px] text-muted-foreground pl-1">Insights</div>
                  <div className="w-[120px] text-[12.25px] text-muted-foreground pl-1">Tags</div>
                  <div className="w-[140px] text-[12.25px] text-muted-foreground pl-1">List Order</div>
                  <div className="w-[140px] text-[12.25px] text-muted-foreground pl-1">Analytics Period</div>
                  <div className="w-[160px] text-[12.25px] text-muted-foreground pl-1">Published</div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-row items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Preset Analytics Filters */}
                  <Select value={selectedPresetFilter} onValueChange={(value) => {
                    setSelectedPresetFilter(value);
                    // Reset sort to date when selecting Repackage or Boost filters
                    if (value === "repackage" || value === "boost") {
                      setSortBy("date");
                    }
                  }}>
                    <SelectTrigger className="font-medium w-[160px] flex items-center">
                      {selectedPresetFilter === "none" && <Zap className="w-4 h-4 mr-2" />}
                      <span>
                        {selectedPresetFilter === "none" 
                          ? "All Videos" 
                          : PRESET_FILTERS.find(f => f.id === selectedPresetFilter)?.name || "Analytics Filter"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div>All Videos</div>
                      </SelectItem>
                      {PRESET_FILTERS.map(filter => (
                        <SelectItem key={filter.id} value={filter.id}>
                          <div>
                            <div>{filter.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{filter.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tag Filter - Multi-Select */}
                  <Button variant="outline" className="justify-center w-[120px]" onClick={() => setTagFilterOpen(true)}>
                    <Tag className="w-4 h-4 mr-2" />
                    {selectedTags.length === 0 
                      ? "All Tags" 
                      : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
                    }
                  </Button>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="font-medium w-[140px] flex items-center">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="ctr">Reach</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="percentViewed">% Viewed</SelectItem>
                      <SelectItem value="ranking">Ranking</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Data Date Range Filter */}
                  <Select value={dateRangeFilter} onValueChange={(value: any) => {
                    console.log(`📅 Date range filter changed from "${dateRangeFilter}" to "${value}"`);
                    setDateRangeFilter(value);
                  }}>
                    <SelectTrigger className="w-[140px] font-medium flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Data range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last28">28 Days</SelectItem>
                      <SelectItem value="sincePublished">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Publish Date Filter */}
                  <Select value={publishDateFilter} onValueChange={setPublishDateFilter}>
                    <SelectTrigger className="w-[160px] font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Published" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="60days">60 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile: Filter Buttons Grid - 2 columns */}
              <div className="flex flex-col gap-2 md:hidden">
                {/* Labels Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-xs text-muted-foreground pl-1 font-medium">Insights</div>
                  <div className="text-xs text-muted-foreground pl-1 font-medium">Tags</div>
                </div>

                {/* First Row: Insights & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Preset Analytics Filters */}
                  <Select value={selectedPresetFilter} onValueChange={(value) => {
                    setSelectedPresetFilter(value);
                    // Reset sort to date when selecting Repackage or Boost filters
                    if (value === "repackage" || value === "boost") {
                      setSortBy("date");
                    }
                  }}>
                    <SelectTrigger className="font-semibold md:font-medium w-full flex items-center text-foreground/90 md:text-foreground">
                      {selectedPresetFilter === "none" && <Zap className="w-4 h-4 mr-2" />}
                      <span>
                        {selectedPresetFilter === "none" 
                          ? "All Videos" 
                          : PRESET_FILTERS.find(f => f.id === selectedPresetFilter)?.name || "Analytics Filter"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div>All Videos</div>
                      </SelectItem>
                      {PRESET_FILTERS.map(filter => (
                        <SelectItem key={filter.id} value={filter.id}>
                          <div>
                            <div>{filter.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{filter.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tag Filter - Multi-Select */}
                  <Button variant="outline" className="justify-center w-full font-semibold md:font-normal text-foreground/90 md:text-foreground" onClick={() => setTagFilterOpen(true)}>
                    <Tag className="w-4 h-4 mr-2" />
                    {selectedTags.length === 0 
                      ? "All Tags" 
                      : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
                    }
                  </Button>
                </div>

                {/* Second Row Labels */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="text-xs text-muted-foreground pl-1 font-medium">List Order</div>
                  <div className="text-xs text-muted-foreground pl-1 font-medium">Analytics Period</div>
                </div>

                {/* Second Row: Sort & Analytics Period */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="font-semibold md:font-medium w-full flex items-center text-foreground/90 md:text-foreground">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="ctr">Reach</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="percentViewed">% Viewed</SelectItem>
                      <SelectItem value="ranking">Ranking</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Data Date Range Filter */}
                  <Select value={dateRangeFilter} onValueChange={(value: any) => {
                    console.log(`📅 Date range filter changed from "${dateRangeFilter}" to "${value}"`);
                    setDateRangeFilter(value);
                  }}>
                    <SelectTrigger className="w-full font-semibold md:font-medium flex items-center text-foreground/90 md:text-foreground">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Data range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last28">28 Days</SelectItem>
                      <SelectItem value="sincePublished">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Third Row Labels */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="text-xs text-muted-foreground pl-1 font-medium">Published</div>
                  <div className="text-xs text-muted-foreground pl-1 font-medium">Display</div>
                </div>

                {/* Third Row: Published & Display Switches */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Publish Date Filter */}
                  <Select value={publishDateFilter} onValueChange={setPublishDateFilter}>
                    <SelectTrigger className="w-full font-semibold md:font-medium flex items-center text-foreground/90 md:text-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Published" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="60days">60 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Display Switches - Horizontal layout in right column */}
                  <div className="flex items-center gap-2 border rounded-lg p-2 justify-center">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="mobile-next-steps-toggle" className="text-xs cursor-pointer">Task</Label>
                      <Switch
                        id="mobile-next-steps-toggle"
                        checked={showNextStepsOnly}
                        onCheckedChange={setShowNextStepsOnly}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Label htmlFor="mobile-goals-toggle" className="text-xs cursor-pointer">Goal</Label>
                      <Switch
                        id="mobile-goals-toggle"
                        checked={showGoalsOnly}
                        onCheckedChange={setShowGoalsOnly}
                        className="scale-75"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Filter Dialog */}
              <Dialog open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
                <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
                  <DialogHeader className="flex-shrink-0 pb-3">
                    <DialogTitle className="flex items-center justify-between pr-8">
                      <span>Filter by Tags</span>
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTags([])}
                          className="h-auto p-1 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      Select one or more tags to filter your videos
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="overflow-y-auto pr-4">
                    <div className="space-y-4">
                      {/* Tag Categories */}
                      {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => (
                        <div key={categoryKey}>
                          <Label className="text-sm mb-2 block">{category.label}</Label>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {allTags[categoryKey as 'tool' | 'format' | 'status'].map((tag) => {
                              const isSelected = selectedTags.includes(tag);
                              return (
                                <TagBadge
                                  key={tag}
                                  tag={tag}
                                  isAdded={isSelected}
                                  color={category.color}
                                  colorDark={category.colorDark}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Desktop: Task and Goal on second line, right aligned */}
              <div className="hidden md:flex md:justify-end md:gap-4">
                {/* Task Filter */}
                <div className="flex items-center space-x-1">
                  <Switch
                    id="nextsteps-filter"
                    checked={showNextStepsOnly}
                    onCheckedChange={setShowNextStepsOnly}
                  />
                  <Label htmlFor="nextsteps-filter" className="cursor-pointer whitespace-nowrap text-[12.25px] text-muted-foreground">
                    Task
                  </Label>
                </div>

                {/* Goal Filter */}
                <div className="flex items-center space-x-1">
                  <Switch
                    id="goals-filter"
                    checked={showGoalsOnly}
                    onCheckedChange={setShowGoalsOnly}
                  />
                  <Label htmlFor="goals-filter" className="cursor-pointer whitespace-nowrap text-[12.25px] text-muted-foreground">
                    Goal
                  </Label>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* View Toggle and Column Selector - Desktop Only */}
        {!loading && filteredVideos.length > 0 && (
          <div className="hidden md:flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'text-white [&_svg]:text-white' : 'text-muted-foreground'}
                  style={viewMode === 'grid' ? { backgroundColor: themeColor } : undefined}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'text-white [&_svg]:text-white' : 'text-muted-foreground'}
                  style={viewMode === 'list' ? { backgroundColor: themeColor } : undefined}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>

              {/* Column Selector for List View */}
              {viewMode === 'list' && (
                <>
                  <Popover open={showColumnSelector} onOpenChange={setShowColumnSelector}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Columns
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="start">
                      <div className="space-y-3">
                        <div className="font-medium text-sm">Select Columns</div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-publishDate"
                              checked={visibleColumns.publishDate}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, publishDate: checked as boolean })
                              }
                            />
                            <label htmlFor="col-publishDate" className="text-sm cursor-pointer">
                              Publish Date
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-views"
                              checked={visibleColumns.views}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, views: checked as boolean })
                              }
                            />
                            <label htmlFor="col-views" className="text-sm cursor-pointer">
                              Views
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-percentViewed"
                              checked={visibleColumns.percentViewed}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, percentViewed: checked as boolean })
                              }
                            />
                            <label htmlFor="col-percentViewed" className="text-sm cursor-pointer">
                              % Viewed
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-impressions"
                              checked={visibleColumns.impressions}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, impressions: checked as boolean })
                              }
                            />
                            <label htmlFor="col-impressions" className="text-sm cursor-pointer">
                              Impressions
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-ctr"
                              checked={visibleColumns.ctr}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, ctr: checked as boolean })
                              }
                            />
                            <label htmlFor="col-ctr" className="text-sm cursor-pointer">
                              CTR
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-likes"
                              checked={visibleColumns.likes}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, likes: checked as boolean })
                              }
                            />
                            <label htmlFor="col-likes" className="text-sm cursor-pointer">
                              Likes
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-comments"
                              checked={visibleColumns.comments}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, comments: checked as boolean })
                              }
                            />
                            <label htmlFor="col-comments" className="text-sm cursor-pointer">
                              Comments
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-duration"
                              checked={visibleColumns.duration}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, duration: checked as boolean })
                              }
                            />
                            <label htmlFor="col-duration" className="text-sm cursor-pointer">
                              Duration
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-watchTime"
                              checked={visibleColumns.watchTime}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, watchTime: checked as boolean })
                              }
                            />
                            <label htmlFor="col-watchTime" className="text-sm cursor-pointer">
                              Watch Time
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-avgViewDuration"
                              checked={visibleColumns.avgViewDuration}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, avgViewDuration: checked as boolean })
                              }
                            />
                            <label htmlFor="col-avgViewDuration" className="text-sm cursor-pointer">
                              Avg View Duration
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="col-topTrafficSource"
                              checked={visibleColumns.topTrafficSource}
                              onCheckedChange={(checked) =>
                                setVisibleColumns({ ...visibleColumns, topTrafficSource: checked as boolean })
                              }
                            />
                            <label htmlFor="col-topTrafficSource" className="text-sm cursor-pointer">
                              Top Traffic Source
                            </label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Export List View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportListViewToCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </>
              )}
            </div>

            <span className="text-base text-muted-foreground font-bold">
              {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Video Count Mobile Only */}
        {!loading && filteredVideos.length > 0 && (
          <div className="md:hidden flex justify-end mb-4">
            <span className="text-base text-muted-foreground font-bold">
              {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: themeColor }} />
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        )}

        {/* Main content - show when not loading */}
        {!loading && (
          <>

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <Card className="p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No videos in database</h3>
            <p className="text-muted-foreground mb-6">
              Click "Sync from YouTube" to import your videos and start tracking analytics.
            </p>
            <Button
              onClick={syncVideos}
              disabled={syncing}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </Card>
        )}

        {/* Videos Grid View */}
        {!loading && filteredVideos.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredVideos.map((video) => (
              <Card
                key={video.videoId}
                className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => openVideoDetails(video)}
              >
                <div className="aspect-video relative bg-black">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover block"
                  />

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <div 
                      className={`w-7 h-7 md:w-6 md:h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                        selectedVideoIds.includes(video.videoId)
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-white/90 border-white hover:bg-white'
                      }`}
                      onClick={(e) => toggleVideoSelection(video.videoId, e)}
                    >
                      {selectedVideoIds.includes(video.videoId) && (
                        <Check className="w-5 h-5 md:w-4 md:h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {(() => {
                      // Show ranking badge for all videos that have a ranking
                      const ranking = videoRankings[video.videoId];
                      
                      if (ranking) {
                        // Top 10: pink (#D400FF), 11+: theme color
                        const badgeColor = ranking <= 10 ? "#D400FF" : themeColor;
                        
                        return (
                          <Badge style={{ backgroundColor: badgeColor, color: "white" }}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {ranking}
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                    {(() => {
                      // Show next steps badge for both array and string formats
                      let hasSteps = false;
                      let completedCount = 0;
                      let totalCount = 0;
                      
                      if (Array.isArray(video.nextSteps) && video.nextSteps.length > 0) {
                        hasSteps = true;
                        totalCount = video.nextSteps.length;
                        completedCount = video.nextSteps.filter(s => s.completed).length;
                      } else if (typeof video.nextSteps === 'string' && video.nextSteps.trim()) {
                        hasSteps = true;
                      }
                      
                      return hasSteps && (
                        <Badge variant="outline" className="bg-white/90">
                          <ListChecks className="w-3 h-3 mr-1" />
                          {Array.isArray(video.nextSteps) ? `Tasks ${completedCount}/${totalCount}` : 'Tasks'}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="line-clamp-2 mb-3 font-bold">{video.title}</h3>
                  
                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map(tag => (
                        <div
                          key={tag}
                          className="h-[19.5px] px-[7px] py-[1.75px] rounded-[6.75px] flex items-center justify-center"
                          style={{ backgroundColor: getTagColor(tag) }}
                        >
                          <p className="text-[12.25px] leading-[14px] text-white font-medium whitespace-nowrap">
                            {tag}
                          </p>
                        </div>
                      ))}
                      {video.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3 font-semibold">
                    {(() => {
                      const metrics = getMetricsForDateRange(video, dateRangeFilter);
                      return (
                        <>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(metrics.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {formatNumber(metrics.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {formatNumber(metrics.comments)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatVideoDuration(video.duration)}
                          </div>
                          {(() => {
                            const hasGoals = video.performanceGoals && video.performanceGoals.length > 0;
                            if (!hasGoals) return null;
                            
                            const achievedCount = video.performanceGoals.filter(g => checkGoalAchievement(g, video)).length;
                            const totalGoals = video.performanceGoals.length;
                            
                            return (
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                <span className={achievedCount === totalGoals ? "text-green-600 font-semibold" : ""}>
                                  {achievedCount}/{totalGoals}
                                </span>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>{calculateViewsPerDay(video)} views/day</span>
                    <span>
                      {(() => {
                        const ctr = getCTRForDateRange(video, dateRangeFilter);
                        if (ctr !== null) {
                          return `${ctr.toFixed(2)}% CTR`;
                        }
                        return `${calculateEngagementRate(video).toFixed(2)}% eng`;
                      })()}
                    </span>
                  </div>

                  {video.notes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 font-semibold">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">Has notes</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Videos List View - Desktop Only */}
        {!loading && filteredVideos.length > 0 && viewMode === 'list' && (
          <div className="hidden md:block">
            <Card className="max-h-[calc(100vh-300px)] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[500px] sticky top-0 bg-background z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleListSort('title')}
                        className="hover:bg-transparent p-0"
                      >
                        Title
                        {listSortBy === 'title' && (
                          listSortDirection === 'asc' ? 
                            <ChevronUp className="ml-2 h-4 w-4" /> : 
                            <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    {visibleColumns.publishDate && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('publishDate')}
                          className="hover:bg-transparent p-0"
                        >
                          Publish Date
                          {listSortBy === 'publishDate' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.views && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('views')}
                          className="hover:bg-transparent p-0"
                        >
                          Views
                          {listSortBy === 'views' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.percentViewed && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('percentViewed')}
                          className="hover:bg-transparent p-0"
                        >
                          % Viewed
                          {listSortBy === 'percentViewed' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.impressions && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('impressions')}
                          className="hover:bg-transparent p-0"
                        >
                          Impressions
                          {listSortBy === 'impressions' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.ctr && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('ctr')}
                          className="hover:bg-transparent p-0"
                        >
                          CTR
                          {listSortBy === 'ctr' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.likes && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('likes')}
                          className="hover:bg-transparent p-0"
                        >
                          Likes
                          {listSortBy === 'likes' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.comments && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('comments')}
                          className="hover:bg-transparent p-0"
                        >
                          Comments
                          {listSortBy === 'comments' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.duration && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        Duration
                      </TableHead>
                    )}
                    {visibleColumns.watchTime && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('watchTime')}
                          className="hover:bg-transparent p-0"
                        >
                          <div className="flex flex-col items-center leading-tight">
                            <span>Watch Time</span>
                            <span>(hrs)</span>
                          </div>
                          {listSortBy === 'watchTime' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.avgViewDuration && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('avgViewDuration')}
                          className="hover:bg-transparent p-0"
                        >
                          Avg Duration (s)
                          {listSortBy === 'avgViewDuration' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.topTrafficSource && (
                      <TableHead className="text-center sticky top-0 bg-background z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleListSort('topTrafficSource')}
                          className="hover:bg-transparent p-0"
                        >
                          Top Traffic
                          {listSortBy === 'topTrafficSource' && (
                            listSortDirection === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4" /> : 
                              <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedListVideos().map((video) => {
                    const metrics = getMetricsForDateRange(video, dateRangeFilter);
                    const percentViewed = getPercentageViewedForDateRange(video, dateRangeFilter);
                    const impressions = getImpressionsForDateRange(video, dateRangeFilter);
                    const ctr = getCTRForDateRange(video, dateRangeFilter);
                    const avgDuration = getAvgViewDurationForDateRange(video, dateRangeFilter);
                    const topTraffic = getTopTrafficSourceForDateRange(video, dateRangeFilter);
                    
                    return (
                      <TableRow 
                        key={video.videoId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openVideoDetails(video)}
                      >
                        <TableCell className="w-[500px]">
                          <div className="flex items-start gap-3 py-2">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-20 h-11 object-cover rounded flex-shrink-0"
                            />
                            <div className="h-[35px] overflow-hidden relative w-[380px]">
                              <p className="text-sm leading-[17.5px] w-[380px] whitespace-normal break-words">{video.title}</p>
                            </div>
                          </div>
                        </TableCell>
                        {visibleColumns.publishDate && (
                          <TableCell className="text-center">
                            {new Date(video.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                        )}
                        {visibleColumns.views && (
                          <TableCell className="text-center">
                            {formatNumber(metrics.views || 0)}
                          </TableCell>
                        )}
                        {visibleColumns.percentViewed && (
                          <TableCell className="text-center">
                            {percentViewed.toFixed(1)}%
                          </TableCell>
                        )}
                        {visibleColumns.impressions && (
                          <TableCell className="text-center">
                            {impressions ? formatNumber(impressions) : <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                        )}
                        {visibleColumns.ctr && (
                          <TableCell className="text-center">
                            {ctr !== null ? `${ctr.toFixed(2)}%` : <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                        )}
                        {visibleColumns.likes && (
                          <TableCell className="text-center">
                            {formatNumber(metrics.likes || 0)}
                          </TableCell>
                        )}
                        {visibleColumns.comments && (
                          <TableCell className="text-center">
                            {formatNumber(metrics.comments || 0)}
                          </TableCell>
                        )}
                        {visibleColumns.duration && (
                          <TableCell className="text-center">
                            {video.duration ? formatDuration(video.duration) : <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                        )}
                        {visibleColumns.watchTime && (
                          <TableCell className="text-center">
                            {(() => {
                              // Get latest snapshot with watch time data for the current date range filter
                              const snapshots = video.analyticsHistory?.filter(s => {
                                const snapshotDateRange = s.dateRange || 'lifetime';
                                const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
                                return snapshotDateRange === currentFilter && s.estimatedMinutesWatched !== undefined;
                              }) || [];
                              const latestSnapshot = snapshots.sort((a, b) => 
                                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                              )[0];
                              const watchTimeMinutes = latestSnapshot?.estimatedMinutesWatched;
                              if (watchTimeMinutes === undefined || watchTimeMinutes === null) {
                                return <span className="text-muted-foreground">N/A</span>;
                              }
                              const watchTimeHours = watchTimeMinutes / 60;
                              return watchTimeHours.toFixed(1);
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.avgViewDuration && (
                          <TableCell className="text-center">
                            {avgDuration ? avgDuration.toFixed(0) : <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                        )}
                        {visibleColumns.topTrafficSource && (
                          <TableCell className="text-center">
                            {topTraffic || <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedVideoIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-auto">
            <Card className="shadow-2xl border-2" style={{ backgroundColor: themeColor }}>
              <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 text-white">
                <span className="font-semibold text-sm md:text-base">
                  {selectedVideoIds.length} video{selectedVideoIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2 w-full md:w-auto">
                  {selectedVideoIds.length < filteredVideos.length ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllVideos}
                      className="bg-transparent border-white text-white hover:bg-white flex-1 md:flex-none text-sm"
                      style={{ ['--hover-text-color' as any]: themeColor }}
                      onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <span className="md:hidden">All ({filteredVideos.length})</span>
                      <span className="hidden md:inline">Select All ({filteredVideos.length})</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deselectAllVideos}
                      className="bg-transparent border-white text-white hover:bg-white flex-1 md:flex-none text-sm"
                      onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <span className="md:hidden">Deselect</span>
                      <span className="hidden md:inline">Deselect All</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkTag}
                    className="bg-transparent border-white text-white hover:!bg-white flex-1 md:flex-none text-sm"
                    onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    <span className="md:hidden">Tag</span>
                    <span className="hidden md:inline">Bulk Tag</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deselectAllVideos}
                    className="text-white hover:bg-white/20 flex-none"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bulk Tag Dialog */}
        <Dialog open={showBulkTagDialog} onOpenChange={setShowBulkTagDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Bulk Tag {selectedVideoIds.length} Videos</DialogTitle>
              <DialogDescription>
                Check or uncheck tags to apply to all selected videos
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                {/* Tag Categories */}
                {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey}>
                    <Label className="text-sm mb-2 block">{category.label}</Label>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {allTags[categoryKey as 'tool' | 'format' | 'status'].map((tag) => {
                        const anyVideoHasTag = selectedVideoIds.some(videoId => {
                          const video = videos.find(v => v.videoId === videoId);
                          return video?.tags?.includes(tag);
                        });
                        const isChecked = bulkTagsToAdd.includes(tag) || (anyVideoHasTag && !bulkTagsToRemove.includes(tag));
                        
                        return (
                          <TagBadge
                            key={tag}
                            tag={tag}
                            isAdded={isChecked}
                            color={category.color}
                            colorDark={category.colorDark}
                            onClick={() => {
                              if (isChecked) {
                                if (anyVideoHasTag) {
                                  setBulkTagsToRemove(prev => prev.includes(tag) ? prev : [...prev, tag]);
                                }
                                setBulkTagsToAdd(prev => prev.filter(t => t !== tag));
                              } else {
                                setBulkTagsToAdd(prev => prev.includes(tag) ? prev : [...prev, tag]);
                                setBulkTagsToRemove(prev => prev.filter(t => t !== tag));
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkTagDialog(false);
                  setBulkTagsToAdd([]);
                  setBulkTagsToRemove([]);
                }}
                disabled={applyingBulkTags}
              >
                Cancel
              </Button>
              <Button
                onClick={applyBulkTags}
                disabled={applyingBulkTags || (bulkTagsToAdd.length === 0 && bulkTagsToRemove.length === 0)}
                style={{ backgroundColor: themeColor }}
                className="text-white hover:opacity-90"
              >
                {applyingBulkTags ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Apply to {selectedVideoIds.length} Videos
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* No Results */}
        {!loading && videos.length > 0 && filteredVideos.length === 0 && (
          <Card className="p-12 text-center">
            <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No videos match your filters</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedTags([]);
                setShowNextStepsOnly(false);
                setShowGoalsOnly(false);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </Card>
        )}

          </>
        )}

      {/* Video Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-3">
            <DialogTitle className="pr-8">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-4 flex-wrap">
              <span>Published on {formatDate(selectedVideo?.publishedAt)}</span>
              <Badge variant="secondary" className="text-xs">
                {dateRangeFilter === 'last28' ? '📊 Showing: Last 28 Days' : '📊 Showing: Lifetime'}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedVideo && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-5 flex-shrink-0 mb-4 !p-1">
                <TabsTrigger value="details" className="font-bold px-2">Details</TabsTrigger>
                <TabsTrigger value="notes" className="font-bold px-2">Notes</TabsTrigger>
                <TabsTrigger value="analytics" className="font-bold px-2">Analytics</TabsTrigger>
                <TabsTrigger value="goals" className="font-bold px-2">Goals</TabsTrigger>
                <TabsTrigger value="settings" className="font-bold px-2">Tags</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Details Tab */}
                <TabsContent value="details" className="h-full m-0">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      <a 
                        href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video rounded-[5px] overflow-hidden relative group cursor-pointer"
                      >
                        <img
                          src={selectedVideo.thumbnailUrl}
                          alt={selectedVideo.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Darkened overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white font-semibold flex items-center gap-2">
                            View on YouTube
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        </div>
                      </a>

                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-bold">
                            {dateRangeFilter === 'last28' ? '28 Days Statistics' : 'Lifetime Statistics'}
                          </h4>
                          <div className="grid grid-cols-3 gap-2 max-w-full">
                            {(() => {
                              const metrics = getMetricsForDateRange(selectedVideo, dateRangeFilter);
                              return (
                                <>
                                  <Card className="p-3 text-center min-w-0">
                                    <div className="flex flex-col items-center gap-5">
                                      <Eye className="w-6 h-6 text-muted-foreground" />
                                      <div className="text-sm text-muted-foreground leading-none">Views</div>
                                      <div className="font-bold text-lg truncate leading-none">{formatNumber(metrics.views)}</div>
                                    </div>
                                  </Card>
                                  <Card className="p-3 text-center min-w-0">
                                    <div className="flex flex-col items-center gap-5">
                                      <ThumbsUp className="w-6 h-6 text-muted-foreground" />
                                      <div className="text-sm text-muted-foreground leading-none">Likes</div>
                                      <div className="font-bold text-lg truncate leading-none">{formatNumber(metrics.likes)}</div>
                                    </div>
                                  </Card>
                                  <Card className="p-3 text-center min-w-0">
                                    <div className="flex flex-col items-center gap-5">
                                      <MessageCircle className="w-6 h-6 text-muted-foreground" />
                                      <div className="text-sm text-muted-foreground leading-none">Comments</div>
                                      <div className="font-bold text-lg truncate leading-none">{formatNumber(metrics.comments)}</div>
                                    </div>
                                  </Card>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-2 font-bold">Performance Metrics</h4>
                      <div className="h-[200px] w-full pr-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getPerformanceMetrics(selectedVideo, dateRangeFilter)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="metric" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill={themeColor} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-bold">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedVideo.description || "No description available"}
                      </p>
                    </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="h-full m-0">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-bold">Video Notes</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add personal notes, ideas, or observations about this video.
                        </p>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter your notes here..."
                          className="min-h-[200px]"
                        />
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-2 font-bold">Tasks</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Track action items or next steps for this video.
                        </p>
                        
                        {/* Tasks Checklist */}
                        <div className="space-y-2 mb-4">
                          {nextSteps.map((item) => (
                            <div 
                              key={item.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                item.completed ? 'bg-muted/50 border-muted' : 'bg-background border-border'
                              }`}
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleNextStep(item.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${
                                  item.completed ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {item.text}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNextStep(item.id)}
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          {nextSteps.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No next steps yet. Add one below.</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Add New Next Step */}
                        <div className="flex gap-2">
                          <Input
                            value={newNextStep}
                            onChange={(e) => setNewNextStep(e.target.value)}
                            placeholder="Add a next step..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNextStep();
                              }
                            }}
                          />
                          <Button
                            onClick={addNextStep}
                            disabled={!newNextStep.trim()}
                            style={{ backgroundColor: themeColor }}
                            className="text-white hover:opacity-90 shrink-0"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={saveNotes}
                        disabled={savingNotes}
                        style={{ backgroundColor: themeColor }}
                        className="text-white hover:opacity-90"
                      >
                    {savingNotes ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                          Save Notes & Tasks
                        </>
                      )}
                    </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="h-full m-0">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      {selectedVideo.analyticsHistory && selectedVideo.analyticsHistory.length > 0 ? (
                        <>
                      {/* Analytics View Selector */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <Select value={selectedAnalyticsView} onValueChange={(value: any) => setSelectedAnalyticsView(value)}>
                          <SelectTrigger className="w-[240px] font-bold">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select view" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overview">Overview</SelectItem>
                            <SelectItem value="engagement">Reach</SelectItem>
                            <SelectItem value="traffic">Traffic</SelectItem>
                            <SelectItem value="retention">Retention</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <TooltipPrimitive.Root>
                              <TooltipPrimitive.Trigger asChild>
                                <Button
                                  onClick={() => {
                                    openSnapshotNoteDialog(selectedVideo.videoId);
                                  }}
                                  disabled={takingSnapshot}
                                  style={{ backgroundColor: themeColor }}
                                  className="text-white hover:opacity-90"
                                >
                                  {takingSnapshot ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Syncing...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      <span className="md:hidden">Sync</span>
                                      <span className="hidden md:inline">YouTube Sync</span>
                                    </>
                                  )}
                                </Button>
                              </TooltipPrimitive.Trigger>
                              <TooltipContent>
                                {analyticsConnected ? (
                                  <p>Fetch basic stats + advanced analytics (watch time, traffic, etc.) for this video</p>
                                ) : (
                                  <p>Fetch basic stats (views, likes, comments) for this video. Connect OAuth for advanced metrics.</p>
                                )}
                              </TooltipContent>
                            </TooltipPrimitive.Root>
                          </TooltipProvider>
                          <Button
                            onClick={() => setShowAdvancedAnalyticsDialog(true)}
                            variant="outline"
                            className="md:px-4"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="md:hidden">Data</span>
                            <span className="hidden md:inline">Add Data</span>
                          </Button>
                        </div>
                      </div>

                      {/* Overview View */}
                      {selectedAnalyticsView === 'overview' && (
                        <>
                          <div>
                            <h4 className="mb-2 font-bold">Analytics Trend</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              {getChartData(selectedVideo).length} snapshot{getChartData(selectedVideo).length !== 1 ? "s" : ""} recorded
                            </p>
                            
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getChartData(selectedVideo)} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(value) => value.split('\n')[0]}
                                    minTickGap={30}
                                  />
                                  <YAxis />
                                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                  <Legend />
                                  <Line type="monotone" dataKey="views" stroke={themeColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="likes" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="comments" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div>
                            <div className="mb-4">
                              <h4 className="font-bold">YouTube Sync History</h4>
                            </div>
                            <div className="space-y-2">
                              {(() => {
                                return [...selectedVideo.analyticsHistory]
                                  .filter(snapshot => {
                                    // Only show snapshots that match the current date range filter
                                    const snapshotDateRange = snapshot.dateRange || 'lifetime';
                                    const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
                                    
                                    // Show only snapshots that match the current filter
                                    return snapshotDateRange === currentFilter;
                                  })
                                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                  .map((snapshot) => {
                                  const snapshotDateRange = snapshot.dateRange || 'lifetime';
                                  const dateRangeLabel = snapshotDateRange === 'lifetime' ? 'Lifetime' : '28 day';
                                  
                                  return (
                                <Card key={snapshot.timestamp} className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(snapshot.timestamp)}
                                      <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                        {dateRangeLabel}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditSnapshotNote(snapshot.timestamp);
                                        }}
                                        className="h-7 w-7 p-0 hover:bg-muted"
                                        aria-label="Edit snapshot note"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteSnapshot(snapshot.timestamp);
                                        }}
                                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        aria-label="Delete snapshot"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Views:</span>{" "}
                                      <span className="font-medium">{formatNumber(snapshot.views)}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Likes:</span>{" "}
                                      <span className="font-medium">{formatNumber(snapshot.likes)}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Comments:</span>{" "}
                                      <span className="font-medium">{formatNumber(snapshot.comments)}</span>
                                    </div>
                                    {snapshot.estimatedMinutesWatched !== undefined && (
                                      <div>
                                        <span className="text-muted-foreground">Watch Time:</span>{" "}
                                        <span className="font-medium">{formatWatchTime(snapshot.estimatedMinutesWatched)}</span>
                                      </div>
                                    )}
                                    {snapshot.averageViewDuration !== undefined && (
                                      <div>
                                        <span className="text-muted-foreground">Avg View Duration:</span>{" "}
                                        <span className="font-medium">{snapshot.averageViewDuration}s</span>
                                      </div>
                                    )}
                                    {snapshot.averageViewPercentage !== undefined && (
                                      <div>
                                        <span className="text-muted-foreground">% Viewed:</span>{" "}
                                        <span className="font-medium">{snapshot.averageViewPercentage.toFixed(1)}%</span>
                                      </div>
                                    )}
                                  </div>
                                  {snapshot.note && (
                                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                                      <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                        <span className="text-muted-foreground">{snapshot.note}</span>
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              );
                              });
                              })()}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Engagement Metrics View */}
                      {selectedAnalyticsView === 'engagement' && (
                        <div className="space-y-4">
                          {selectedVideo.analyticsHistory.some(s => s.impressions !== undefined || s.ctr !== undefined) ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                  // Get the latest snapshot with impressions data
                                  const latestWithImpressions = [...selectedVideo.analyticsHistory]
                                    .reverse()
                                    .find(s => s.impressions !== undefined);
                                  
                                  return latestWithImpressions && (
                                    <Card className="p-6">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-muted-foreground">Impressions</span>
                                        <Eye className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                      <div className="text-3xl font-bold">
                                        {formatNumber(latestWithImpressions.impressions || 0)}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        How many times thumbnail was shown
                                      </p>
                                    </Card>
                                  );
                                })()}
                                
                                {(() => {
                                  // Get the latest snapshot with CTR data
                                  const latestWithCTR = [...selectedVideo.analyticsHistory]
                                    .reverse()
                                    .find(s => s.ctr !== undefined);
                                  
                                  return latestWithCTR && (
                                    <Card className="p-6">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-muted-foreground">Click-Through Rate</span>
                                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                      <div className="text-3xl font-bold">
                                        {(latestWithCTR.ctr || 0).toFixed(1)}%
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Percentage of impressions clicked
                                      </p>
                                    </Card>
                                  );
                                })()}
                              </div>

                              {/* Engagement History Chart */}
                              {selectedVideo.analyticsHistory.filter(s => s.impressions !== undefined || s.ctr !== undefined).length > 0 && (
                                <div className="h-[250px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={makeChartDataUnique([...selectedVideo.analyticsHistory].filter(s => s.impressions !== undefined || s.ctr !== undefined).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())).map(s => ({
                                      date: s.date,
                                      timestamp: s.timestamp,
                                      impressions: s.impressions || 0,
                                      ctr: s.ctr || 0,
                                      key: s.key,
                                    }))} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(value) => value.split('\n')[0]}
                                        minTickGap={30}
                                      />
                                      <YAxis yAxisId="left" />
                                      <YAxis yAxisId="right" orientation="right" />
                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                      <Legend />
                                      <Line yAxisId="left" type="monotone" dataKey="impressions" stroke={themeColor} strokeWidth={2} name="Impressions" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                      <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#10b981" strokeWidth={2} name="CTR %" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                              
                              {/* History Data List */}
                              {selectedVideo.analyticsHistory.filter(s => s.impressions !== undefined || s.ctr !== undefined).length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-bold">History</h4>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {[...selectedVideo.analyticsHistory]
                                      .filter(s => {
                                        const hasReachData = s.impressions !== undefined || s.ctr !== undefined;
                                        const matchesDateRange = s.dateRange === (dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28');
                                        return hasReachData && matchesDateRange;
                                      })
                                      .reverse()
                                      .map((snapshot, index) => (
                                        <div 
                                          key={snapshot.timestamp} 
                                          className="bg-[rgba(236,236,240,0.3)] rounded-lg px-3 py-3.5"
                                        >
                                          <div className="flex items-start gap-5">
                                            {/* Date */}
                                            <div className="text-sm text-muted-foreground min-w-[74px]">
                                              {new Date(snapshot.timestamp).toLocaleDateString("en-US", { 
                                                month: "short", 
                                                day: "numeric",
                                                year: "numeric"
                                              })}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex flex-col gap-1 flex-1">
                                              {/* Metrics */}
                                              <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-center">
                                                {snapshot.impressions !== undefined && snapshot.impressions !== null && (
                                                  <>
                                                    <span className="text-sm text-muted-foreground">Impressions:</span>
                                                    <span className="text-sm font-bold">{formatNumber(snapshot.impressions)}</span>
                                                  </>
                                                )}
                                                {snapshot.impressions !== undefined && snapshot.impressions !== null && snapshot.ctr !== undefined && snapshot.ctr !== null && (
                                                  <span className="text-sm text-muted-foreground mx-1">•</span>
                                                )}
                                                {snapshot.ctr !== undefined && snapshot.ctr !== null && (
                                                  <>
                                                    <span className="text-sm text-muted-foreground">CTR:</span>
                                                    <span className="text-sm font-bold">{snapshot.ctr.toFixed(2)}%</span>
                                                  </>
                                                )}
                                              </div>
                                              
                                              {/* Note */}
                                              {snapshot.note && (
                                                <div className="text-[12.25px] leading-[14px] text-muted-foreground">
                                                  {snapshot.note}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <Card className="p-8 text-center">
                              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <h4 className="mb-1 font-bold">No Engagement Data Yet</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Take analytics snapshots to track impressions and CTR over time
                              </p>
                              {(() => {
                                const now = new Date();
                                const publishDate = new Date(selectedVideo.publishedAt);
                                const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
                                
                                return daysOld <= 3 ? (
                                  <Alert className={isDarkMode ? "bg-slate-800 border-slate-700 mb-4 text-left" : "bg-blue-50 border-blue-200 mb-4 text-left"}>
                                    <Info className={isDarkMode ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                                    <AlertDescription className={isDarkMode ? "text-sm text-slate-200" : "text-sm text-blue-900"}>
                                      <strong>YouTube Analytics Delay:</strong> Detailed reach data (impressions & CTR) isn't available from YouTube for the first 3 days after publishing. You can manually enter this data until then.
                                    </AlertDescription>
                                  </Alert>
                                ) : null;
                              })()}
                              <Button
                                onClick={() => setShowAdvancedAnalyticsDialog(true)}
                                style={{ backgroundColor: themeColor }}
                                className="text-white hover:opacity-90"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Data
                              </Button>
                            </Card>
                          )}
                        </div>
                      )}

                      {/* Traffic View */}
                      {selectedAnalyticsView === 'traffic' && (
                        <div className="space-y-4">
                          {(() => {
                            // Find the latest snapshot with traffic data matching the current date range filter
                            const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
                            const latestWithTraffic = [...selectedVideo.analyticsHistory]
                              .filter(s => {
                                const snapshotDateRange = s.dateRange || 'lifetime';
                                return snapshotDateRange === currentFilter && (s.allTrafficSources || s.topTrafficSource);
                              })
                              .reverse()
                              .find(s => s.allTrafficSources || s.topTrafficSource);
                            
                            if (!latestWithTraffic) {
                              const now = new Date();
                              const publishDate = new Date(selectedVideo.publishedAt);
                              const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return (
                                <Card className="p-8 text-center">
                                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <h4 className="mb-1 font-bold">No Traffic Data Yet</h4>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Add advanced analytics data to track traffic sources
                                  </p>
                                  {daysOld <= 3 && (
                                    <Alert className={isDarkMode ? "bg-slate-800 border-slate-700 mb-4 text-left" : "bg-blue-50 border-blue-200 mb-4 text-left"}>
                                      <Info className={isDarkMode ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                                      <AlertDescription className={isDarkMode ? "text-sm text-slate-200" : "text-sm text-blue-900"}>
                                        <strong>YouTube Analytics Delay:</strong> Detailed traffic source data isn't available from YouTube for the first 3 days after publishing. You can manually enter this data until then.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  <Button
                                    onClick={() => setShowAdvancedAnalyticsDialog(true)}
                                    style={{ backgroundColor: themeColor }}
                                    className="text-white hover:opacity-90"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Data
                                  </Button>
                                </Card>
                              );
                            }

                            // Use allTrafficSources if available, otherwise fall back to top source
                            const trafficSources = latestWithTraffic.allTrafficSources || 
                              (latestWithTraffic.topTrafficSource ? [{
                                source: latestWithTraffic.topTrafficSource,
                                views: 0,
                                percentage: latestWithTraffic.topTrafficSourcePercentage || 0
                              }] : []);

                            if (trafficSources.length === 0) {
                              const now = new Date();
                              const publishDate = new Date(selectedVideo.publishedAt);
                              const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return (
                                <Card className="p-8 text-center">
                                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <h4 className="mb-1 font-bold">No Traffic Data Yet</h4>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Add advanced analytics data to track traffic sources
                                  </p>
                                  {daysOld <= 3 && (
                                    <Alert className={isDarkMode ? "bg-slate-800 border-slate-700 mb-4 text-left" : "bg-blue-50 border-blue-200 mb-4 text-left"}>
                                      <Info className={isDarkMode ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                                      <AlertDescription className={isDarkMode ? "text-sm text-slate-200" : "text-sm text-blue-900"}>
                                        <strong>YouTube Analytics Delay:</strong> Detailed traffic source data isn't available from YouTube for the first 3 days after publishing. You can manually enter this data until then.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  <Button
                                    onClick={() => setShowAdvancedAnalyticsDialog(true)}
                                    style={{ backgroundColor: themeColor }}
                                    className="text-white hover:opacity-90"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Data
                                  </Button>
                                </Card>
                              );
                            }

                            // Color palette for traffic sources (purple shades)
                            const colors = [
                              themeColor, // Primary theme color
                              '#8B5CF6', // Lighter purple
                              '#A78BFA', // Light purple
                              '#C4B5FD', // Very light purple
                              '#DDD6FE', // Pale purple
                              themeColor, // Theme color
                              '#7C3AED', // Medium purple
                              '#9333EA', // Bright purple
                            ];

                            // Calculate total for donut chart
                            const total = trafficSources.reduce((sum, s) => sum + s.views, 0);
                            
                            // Prepare data for donut chart (calculate angles)
                            let currentAngle = 0;
                            const donutData = trafficSources.map((source, index) => {
                              const percentage = source.percentage;
                              const angle = (percentage / 100) * 360;
                              const startAngle = currentAngle;
                              currentAngle += angle;
                              
                              return {
                                ...source,
                                color: colors[index % colors.length],
                                startAngle,
                                endAngle: currentAngle,
                                percentage
                              };
                            });

                            return (
                              <>
                                <Card className="p-6">
                                  <h4 className="mb-6 font-bold">Traffic Sources</h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Donut Chart */}
                                    <div className="flex flex-col items-center justify-center">
                                      <div className="w-full max-w-[240px] aspect-square relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                            <Pie
                                              data={donutData}
                                              cx="50%"
                                              cy="50%"
                                              innerRadius="60%"
                                              outerRadius="85%"
                                              paddingAngle={2}
                                              dataKey="percentage"
                                            >
                                              {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                              ))}
                                            </Pie>
                                            <Tooltip 
                                              formatter={(value: any, name: any, props: any) => [
                                                `${value.toFixed(1)}%`,
                                                formatTrafficSource(props.payload.source)
                                              ]}
                                            />
                                          </PieChart>
                                        </ResponsiveContainer>
                                        
                                        {/* Center label */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                          <div className="text-xs text-muted-foreground">Total</div>
                                          <div className="text-2xl font-bold">{trafficSources.length}</div>
                                          <div className="text-xs text-muted-foreground">Source{trafficSources.length !== 1 ? 's' : ''}</div>
                                        </div>
                                      </div>
                                      
                                      {/* Legend */}
                                      <div className="mt-4 w-full space-y-2">
                                        {donutData.map((item, index) => (
                                          <div key={index} className="flex items-center gap-2 text-xs">
                                            <div
                                              className="w-3 h-3 rounded-sm flex-shrink-0"
                                              style={{ backgroundColor: item.color }}
                                            />
                                            <span className="truncate flex-1">
                                              {formatTrafficSource(item.source)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Horizontal Bars */}
                                    <div className="space-y-3">
                                      {donutData.map((item, index) => (
                                        <div key={index} className="space-y-1">
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium truncate">
                                              {formatTrafficSource(item.source)}
                                            </span>
                                            <span className="font-bold ml-2" style={{ color: item.color }}>
                                              {item.percentage.toFixed(1)}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                              className="h-full rounded-full transition-all duration-500"
                                              style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color
                                              }}
                                            />
                                          </div>
                                          {item.views > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                              {item.views.toLocaleString()} views
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </Card>

                                {/* Traffic Source History */}
                                {selectedVideo.analyticsHistory.some(s => {
                                  const snapshotDateRange = s.dateRange || 'lifetime';
                                  const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
                                  return snapshotDateRange === currentFilter && (s.allTrafficSources || s.topTrafficSource);
                                }) && (
                                  <div>
                                    <h4 className="mb-3 font-bold">Traffic Source History</h4>
                                    <div className="space-y-2">
                                      {[...selectedVideo.analyticsHistory].reverse().filter(s => {
                                        const snapshotDateRange = s.dateRange || 'lifetime';
                                        const currentFilter = dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28';
                                        return snapshotDateRange === currentFilter && (s.allTrafficSources || s.topTrafficSource);
                                      }).map((snapshot, index) => {
                                        const sources = snapshot.allTrafficSources || 
                                          (snapshot.topTrafficSource ? [{
                                            source: snapshot.topTrafficSource,
                                            views: 0,
                                            percentage: snapshot.topTrafficSourcePercentage || 0
                                          }] : []);
                                        
                                        if (sources.length === 0) return null;
                                        
                                        return (
                                          <Card key={index} className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="text-sm text-muted-foreground">
                                                {formatDate(snapshot.timestamp)}
                                              </div>
                                              <Badge variant="secondary">
                                                {sources.length} source{sources.length !== 1 ? 's' : ''}
                                              </Badge>
                                            </div>
                                            <div className="space-y-2">
                                              {sources.slice(0, 3).map((source, sourceIndex) => (
                                                <div key={sourceIndex} className="flex items-center justify-between text-sm">
                                                  <span className="truncate">
                                                    {formatTrafficSource(source.source)}
                                                  </span>
                                                  <span className="font-medium ml-2">
                                                    {source.percentage.toFixed(1)}%
                                                  </span>
                                                </div>
                                              ))}
                                              {sources.length > 3 && (
                                                <div className="text-xs text-muted-foreground text-center pt-1">
                                                  +{sources.length - 3} more source{sources.length - 3 !== 1 ? 's' : ''}
                                                </div>
                                              )}
                                            </div>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Viewer Retention View */}
                      {selectedAnalyticsView === 'retention' && (
                        <div className="space-y-4">
                          {selectedVideo.analyticsHistory.some(s => s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined) ? (
                            <>
                              {/* Metric Boxes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-6">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">% Viewed</span>
                                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <div className="text-3xl font-bold">
                                    {(() => {
                                      const percentViewed = getPercentageViewedForDateRange(selectedVideo, dateRangeFilter);
                                      return percentViewed > 0 ? `${percentViewed.toFixed(1)}%` : 'N/A';
                                    })()}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Of total video length
                                  </p>
                                </Card>

                                <Card className="p-6">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                  <div className="text-3xl font-bold">
                                    {(() => {
                                      const avgDuration = getAvgViewDurationForDateRange(selectedVideo, dateRangeFilter);
                                      return avgDuration !== null && avgDuration !== undefined
                                        ? formatDuration(avgDuration)
                                        : 'N/A';
                                    })()}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Average time watched
                                  </p>
                                </Card>
                              </div>

                              {/* Retention History Chart */}
                              {selectedVideo.analyticsHistory.some(s => s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined) && (
                                <div className="h-[250px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={makeChartDataUnique([...selectedVideo.analyticsHistory]
                                      .filter(s => s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined)
                                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())).map(s => ({
                                        date: s.date,
                                        timestamp: s.timestamp,
                                        percentage: s.averageViewPercentage || 0,
                                        duration: s.averageViewDuration || 0,
                                        key: s.key,
                                      }))} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(value) => value.split('\n')[0]}
                                        minTickGap={30}
                                      />
                                      <YAxis yAxisId="left" />
                                      <YAxis yAxisId="right" orientation="right" />
                                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                      <Legend />
                                      <Line yAxisId="left" type="monotone" dataKey="percentage" stroke={themeColor} strokeWidth={2} name="% Viewed" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                      <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#f59e0b" strokeWidth={2} name="Duration (s)" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                              
                              {/* Retention History List */}
                              {selectedVideo.analyticsHistory.filter(s => s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined).length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-bold">Retention History</h4>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {[...selectedVideo.analyticsHistory]
                                      .filter(s => {
                                        const hasRetentionData = s.averageViewPercentage !== undefined || s.averageViewDuration !== undefined;
                                        const matchesDateRange = s.dateRange === (dateRangeFilter === 'sincePublished' ? 'lifetime' : 'last28');
                                        return hasRetentionData && matchesDateRange;
                                      })
                                      .reverse()
                                      .map((snapshot, index) => (
                                        <div 
                                          key={snapshot.timestamp} 
                                          className="bg-[rgba(236,236,240,0.3)] rounded-lg px-3 py-3.5"
                                        >
                                          <div className="flex items-start gap-5">
                                            {/* Date */}
                                            <div className="text-sm text-muted-foreground min-w-[74px]">
                                              {new Date(snapshot.timestamp).toLocaleDateString("en-US", { 
                                                month: "short", 
                                                day: "numeric",
                                                year: "numeric"
                                              })}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex flex-col gap-1 flex-1">
                                              {/* Metrics */}
                                              <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-center">
                                                {snapshot.averageViewPercentage !== undefined && snapshot.averageViewPercentage !== null && (
                                                  <>
                                                    <span className="text-sm text-muted-foreground">% Viewed:</span>
                                                    <span className="text-sm font-bold">{snapshot.averageViewPercentage.toFixed(1)}%</span>
                                                  </>
                                                )}
                                                {snapshot.averageViewPercentage !== undefined && snapshot.averageViewPercentage !== null && snapshot.averageViewDuration !== undefined && snapshot.averageViewDuration !== null && (
                                                  <span className="text-sm text-muted-foreground mx-1">•</span>
                                                )}
                                                {snapshot.averageViewDuration !== undefined && snapshot.averageViewDuration !== null && (
                                                  <>
                                                    <span className="text-sm text-muted-foreground">Avg Duration:</span>
                                                    <span className="text-sm font-bold">{formatDuration(snapshot.averageViewDuration)}</span>
                                                  </>
                                                )}
                                              </div>
                                              
                                              {/* Note */}
                                              {snapshot.note && (
                                                <div className="text-[12.25px] leading-[14px] text-muted-foreground">
                                                  {snapshot.note}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <Card className="p-8 text-center">
                              <Clock className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <h4 className="mb-1">No Retention Data Yet</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Add advanced analytics data to track viewer retention
                              </p>
                              {(() => {
                                const now = new Date();
                                const publishDate = new Date(selectedVideo.publishedAt);
                                const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
                                
                                return daysOld <= 3 ? (
                                  <Alert className={isDarkMode ? "bg-slate-800 border-slate-700 mb-4 text-left" : "bg-blue-50 border-blue-200 mb-4 text-left"}>
                                    <Info className={isDarkMode ? "h-4 w-4 text-blue-400" : "h-4 w-4 text-blue-600"} />
                                    <AlertDescription className={isDarkMode ? "text-sm text-slate-200" : "text-sm text-blue-900"}>
                                      <strong>YouTube Analytics Delay:</strong> Detailed retention data isn't available from YouTube for the first 3 days after publishing. You can manually enter this data until then.
                                    </AlertDescription>
                                  </Alert>
                                ) : null;
                              })()}
                              <Button
                                onClick={() => setShowAdvancedAnalyticsDialog(true)}
                                style={{ backgroundColor: themeColor }}
                                className="text-white hover:opacity-90"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Data
                              </Button>
                            </Card>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted/30 mb-6">
                        <TrendingUp className="w-12 h-12 text-muted-foreground/60" />
                      </div>
                      <h4 className="mb-2 text-xl">No Analytics Data Yet</h4>
                      <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
                        Sync from YouTube or manually add your first analytics data point to start tracking this video's performance over time.
                      </p>
                      <div className="flex items-center gap-3">
                        <TooltipProvider>
                          <TooltipPrimitive.Root>
                            <TooltipPrimitive.Trigger asChild>
                              <Button
                                onClick={() => {
                                  openSnapshotNoteDialog(selectedVideo.videoId);
                                }}
                                disabled={takingSnapshot}
                                size="lg"
                                style={{ backgroundColor: themeColor }}
                                className="text-white hover:opacity-90"
                              >
                                {takingSnapshot ? (
                                  <>
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Syncing...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    YouTube Sync
                                  </>
                                )}
                              </Button>
                            </TooltipPrimitive.Trigger>
                            <TooltipContent>
                              {analyticsConnected ? (
                                <p>Fetch basic stats + advanced analytics (watch time, traffic, etc.) for this video</p>
                              ) : (
                                <p>Fetch basic stats (views, likes, comments) for this video. Connect OAuth for advanced metrics.</p>
                              )}
                            </TooltipContent>
                          </TooltipPrimitive.Root>
                        </TooltipProvider>
                        <Button
                          onClick={() => setShowAdvancedAnalyticsDialog(true)}
                          size="lg"
                          variant="outline"
                          className="border-2"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Data
                        </Button>
                      </div>
                    </div>
                  )}
                    </div>
                  </div>
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals" className="h-full m-0">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4>Performance Goals</h4>
                            <p className="text-sm text-muted-foreground">
                              Set and track performance targets
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowGoalDialog(true)}
                            style={{ backgroundColor: themeColor }}
                            className="text-white hover:opacity-90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </div>

                    {selectedVideo.performanceGoals && selectedVideo.performanceGoals.length > 0 ? (
                      <div className="space-y-3">
                        {selectedVideo.performanceGoals.map((goal) => {
                          const isAchieved = checkGoalAchievement(goal, selectedVideo);
                          const getMetricLabel = (metricType: string) => {
                            switch (metricType) {
                              case 'views': return 'Views';
                              case 'likes': return 'Likes';
                              case 'reach': return 'Reach';
                              case 'growth': return 'Growth';
                              case 'percentViewed': return '%Viewed';
                              case 'comments': return 'Comments';
                              case 'engagement': return 'Engagement Rate %';
                              default: return metricType.charAt(0).toUpperCase() + metricType.slice(1);
                            }
                          };
                          return (
                            <Card key={goal.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <Badge
                                    variant={isAchieved ? "default" : "secondary"}
                                    style={isAchieved ? { backgroundColor: "#10b981" } : {}}
                                  >
                                    {isAchieved ? (
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ) : (
                                      <Target className="w-3 h-3 mr-1" />
                                    )}
                                    {getMetricLabel(goal.metricType)}
                                  </Badge>
                                  <div className="text-sm flex items-baseline gap-1.5">
                                    <span className="text-muted-foreground">Target:</span>
                                    <span className="font-bold">{formatNumber(goal.targetValue)}</span>
                                    {(goal.metricType === 'engagement' || goal.metricType === 'percentViewed') && <span className="font-bold">%</span>}
                                  </div>
                                  {goal.deadline && (
                                    <span className="text-sm text-muted-foreground">
                                      Due: {formatDate(goal.deadline)}
                                    </span>
                                  )}
                                  {isAchieved && (
                                    <div className="text-sm text-green-600">
                                      ✓ Goal achieved!
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePerformanceGoal(goal.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No performance goals set yet. Click "Add Goal" to create one.
                        </p>
                      </Card>
                    )}
                  </div>
                  </div>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="h-full m-0">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-4 font-semibold">Tags & Categories</h4>
                    <div className="space-y-4">
                      {/* Tag Categories */}
                      {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => (
                        <div key={categoryKey}>
                          <Label className="text-sm mb-2 block">{category.label}</Label>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {allTags[categoryKey as 'tool' | 'format' | 'status'].map((tag) => {
                              const isAdded = videoTags.includes(tag);
                              return (
                                <TagBadge
                                  key={tag}
                                  tag={tag}
                                  isAdded={isAdded}
                                  color={category.color}
                                  colorDark={category.colorDark}
                                  onClick={async () => {
                                    if (selectedVideo) {
                                      const updatedTags = isAdded 
                                        ? selectedVideo.tags?.filter(t => t !== tag) || []
                                        : [...(selectedVideo.tags || []), tag];
                                      try {
                                        const token = await getSessionToken();
                                        if (!token) {
                                          console.error("No session token available");
                                          toast.error("Please sign in to add tags");
                                          return;
                                        }

                                        const response = await fetch(
                                          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${selectedVideo.videoId}/tags`,
                                          {
                                            method: "PUT",
                                            headers: {
                                              "Content-Type": "application/json",
                                              Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ tags: updatedTags }),
                                          }
                                        );
                                        const data = await response.json();
                                        if (data.success) {
                                          toast.success(`Added "${tag}" tag`);
                                          setVideos(videos.map(v => 
                                            v.videoId === selectedVideo.videoId ? data.video : v
                                          ));
                                          setSelectedVideo(data.video);
                                          setVideoTags(data.video.tags || []);
                                        }
                                      } catch (error) {
                                        console.error("Error adding tag:", error);
                                        toast.error("Failed to add tag");
                                      }
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Custom Tags */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Custom Tags</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setShowSettings(true);
                              setSettingsTab('tags');
                            }}
                            className="h-7 text-xs"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Edit Tags
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter custom tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addTag();
                              }
                            }}
                          />
                          <Button onClick={addTag} disabled={!newTag.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Performance Goal</DialogTitle>
            <DialogDescription className="mb-4">
              Set a target for this video to track progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-metric">Metric</Label>
              <Select value={goalMetric} onValueChange={(value: any) => setGoalMetric(value)}>
                <SelectTrigger id="goal-metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="percentViewed">%Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal-target">Target Value</Label>
              <Input
                id="goal-target"
                type="number"
                placeholder="Enter target value"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addPerformanceGoal}
                disabled={!goalTarget}
                style={{ backgroundColor: themeColor }}
                className="text-white hover:opacity-90 flex-1"
              >
                Add Goal
              </Button>
              <Button
                onClick={() => setShowGoalDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Selection Dialog for Custom Tags */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Tag Category</DialogTitle>
            <DialogDescription>
              Choose which category to add "{pendingCustomTag}" to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              onClick={() => addCustomTagWithCategory('tool')}
              className="w-full justify-start"
              variant="outline"
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
              Topic Tags
            </Button>
            <Button
              onClick={() => addCustomTagWithCategory('format')}
              className="w-full justify-start"
              variant="outline"
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
              Format Tags
            </Button>
            <Button
              onClick={() => addCustomTagWithCategory('status')}
              className="w-full justify-start"
              variant="outline"
            >
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-3" />
              Status Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-4 md:p-6 overflow-hidden">
          <DialogHeader className="mb-4">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your TubeLab application settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden">
            {/* Mobile: Dropdown Navigation */}
            <div className="md:hidden">
              <Select value={settingsTab} onValueChange={(value: 'analytics' | 'tags' | 'appearance' | 'account') => setSettingsTab(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                  <SelectItem value="appearance">Appearance</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Desktop: Left Sidebar Navigation */}
            <div className="hidden md:block w-40 flex-shrink-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setSettingsTab('analytics')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    settingsTab === 'analytics' 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setSettingsTab('tags')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    settingsTab === 'tags' 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  Tags
                </button>
                <button
                  onClick={() => setSettingsTab('appearance')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    settingsTab === 'appearance' 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  Appearance
                </button>
                <button
                  onClick={() => setSettingsTab('account')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    settingsTab === 'account' 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  Account
                </button>
              </nav>
            </div>
            
            {/* Content area */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)] overflow-x-hidden">
              {settingsTab === 'analytics' && (
                <div className="space-y-6 pb-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">YouTube Analytics Connection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect to YouTube Analytics API to automatically sync advanced metrics like watch time, average view duration, likes, comments, shares, and traffic sources.
                    </p>
                    
                    {analyticsConnected ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md w-full sm:w-auto">
                          <CheckCircle2 className="w-[18px] h-[18px] text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-700 dark:text-green-300 whitespace-nowrap">Connected to YouTube Analytics</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={disconnectYouTubeAnalytics}
                          className="h-[31px] w-full sm:w-auto"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Disconnect Analytics
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md w-full sm:w-auto">
                          <XCircle className="w-[18px] h-[18px] text-red-600 dark:text-red-400" />
                          <span className="text-xs text-red-700 dark:text-red-300 whitespace-nowrap">Not Connected to YouTube Analytics</span>
                        </div>
                        <Button
                          onClick={connectYouTubeAnalytics}
                          disabled={connectingAnalytics}
                          className="h-[31px] hover:bg-primary/90 transition-colors w-full sm:w-auto"
                        >
                          {connectingAnalytics ? "Connecting..." : "Connect Analytics"}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Import Reach Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      YouTube's API doesn't provide CTR and Impressions data - import via CSV instead.
                    </p>
                    <Button
                      onClick={() => {
                        setShowSettings(false);
                        setShowImportReachDialog(true);
                      }}
                      className="w-full sm:w-auto bg-[#5928CB] hover:bg-[#6c3ae0] dark:bg-[#7042d6] dark:hover:bg-[#8052e6] text-white transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Reach Data
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Automated Analytics Tracking</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically capture analytics data at key milestones and regular intervals.
                    </p>
                    <div className="space-y-4">
                      {/* Milestone Auto-Sync */}
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={milestoneAutoSyncEnabled}
                          onCheckedChange={setMilestoneAutoSyncEnabled}
                        />
                        <div className="flex-1">
                          <Label>Milestone Auto-Sync</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Captures data at 4, 7, and 28 days after publish
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Daily/Weekly Auto-Sync */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={autoSnapshotEnabled}
                            onCheckedChange={setAutoSnapshotEnabled}
                          />
                          <div className="flex-1">
                            <Label>Daily/Weekly Auto-Sync</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tracks ongoing performance for all videos
                            </p>
                          </div>
                        </div>
                        {autoSnapshotEnabled && (
                          <div className="ml-11">
                            <Label>Frequency</Label>
                            <Select value={snapshotFrequency} onValueChange={(value: 'daily' | 'weekly') => setSnapshotFrequency(value)}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">YouTube Channel ID</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set your YouTube Channel ID for a direct link to your YouTube Studio analytics.
                    </p>
                    <div className="space-y-3">
                      {youtubeChannelId && (
                        <div className="p-3 bg-muted border border-border rounded-md">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Current Channel ID:</span>{' '}
                            <span className="font-mono">{youtubeChannelId}</span>
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., UC1234567890abcdefghijk"
                          value={manualChannelIdInput}
                          onChange={(e) => setManualChannelIdInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !savingChannelId) {
                              saveChannelIdManually();
                            }
                          }}
                          className="text-sm"
                        />
                        <Button
                          onClick={saveChannelIdManually}
                          disabled={savingChannelId || !manualChannelIdInput.trim()}
                          className="bg-[#5928CB] hover:bg-[#6c3ae0] dark:bg-[#7042d6] dark:hover:bg-[#8052e6] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingChannelId ? (youtubeChannelId ? "Updating..." : "Saving...") : (youtubeChannelId ? "Update" : "Save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {settingsTab === 'tags' && (
                <div className="space-y-6 pb-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Create New Tag</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add custom tags to organize your videos. Choose a category and enter a tag name.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={newSettingsTagCategory} onValueChange={(value: 'tool' | 'format' | 'status') => setNewSettingsTagCategory(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tool">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                                Topic Tags
                              </div>
                            </SelectItem>
                            <SelectItem value="format">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7b29cc' }} />
                                Format Tags
                              </div>
                            </SelectItem>
                            <SelectItem value="status">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6C52FF' }} />
                                Status Tags
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Tag Name</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter tag name..."
                            value={newSettingsTag}
                            onChange={(e) => setNewSettingsTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addCustomTagFromSettings();
                              }
                            }}
                          />
                          <Button 
                            onClick={addCustomTagFromSettings}
                            style={{ backgroundColor: themeColor }}
                            className="hover:opacity-90 text-white"
                          >
                            Add Tag
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Edit Existing Tags</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select any tag to rename it. This will update the tag everywhere it's used.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Select Tag to Edit</Label>
                        <Select value={selectedTagToEdit} onValueChange={(value) => {
                          setSelectedTagToEdit(value);
                          setNewTagName('');
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a tag..." />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Topic Tags */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                              Topic Tags
                            </div>
                            {allTags.tool.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                            
                            {/* Format Tags */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7b29cc' }} />
                              Format Tags
                            </div>
                            {allTags.format.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                            
                            {/* Status Tags */}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6C52FF' }} />
                              Status Tags
                            </div>
                            {allTags.status.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedTagToEdit && (
                        <div>
                          <Label>New Tag Name</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new tag name..."
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  renameCustomTag();
                                }
                              }}
                            />
                            <Button 
                              onClick={renameCustomTag}
                              style={{ backgroundColor: themeColor }}
                              className="hover:opacity-90 text-white"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {settingsTab === 'appearance' && (
                <div className="space-y-6 pb-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Theme</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your preferred color theme for the application.
                    </p>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {isDarkMode ? (
                          <Moon className="w-5 h-5" />
                        ) : (
                          <Sun className="w-5 h-5" />
                        )}
                        <div>
                          <p className="font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                          <p className="text-sm text-muted-foreground">
                            {isDarkMode ? 'Dark theme is active' : 'Light theme is active'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleDarkMode}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Primary Color</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize the primary accent color throughout the application.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label htmlFor="theme-color">Color</Label>
                          <div className="flex gap-2 mt-2">
                            <input
                              id="theme-color"
                              type="color"
                              value={themeColor}
                              onChange={(e) => setThemeColor(e.target.value)}
                              className="w-12 h-12 rounded cursor-pointer border"
                            />
                            <Input
                              value={themeColor}
                              onChange={(e) => setThemeColor(e.target.value)}
                              placeholder="#5928CB"
                              className="w-32"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Preset Colors</Label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { name: 'Purple', color: '#5928CB' },
                            { name: 'Blue', color: '#3B82F6' },
                            { name: 'Green', color: '#10B981' },
                            { name: 'Red', color: '#EF4444' },
                            { name: 'Orange', color: '#F97316' },
                            { name: 'Pink', color: '#EC4899' },
                          ].map(preset => (
                            <button
                              key={preset.name}
                              onClick={() => setThemeColor(preset.color)}
                              className="w-12 h-12 rounded border-2 hover:scale-110 transition-transform"
                              style={{ 
                                backgroundColor: preset.color,
                                borderColor: themeColor === preset.color ? '#000' : 'transparent'
                              }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {settingsTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your account and session.
                    </p>
                    
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="p-4 border rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm text-muted-foreground">Email</Label>
                            <p className="text-sm">{userEmail}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">User ID</Label>
                            <p className="text-xs text-muted-foreground font-mono">{userId}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Logout Button */}
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setShowSettings(false);
                            onLogout();
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Analytics Dialog */}
      <Dialog open={showAdvancedAnalyticsDialog} onOpenChange={setShowAdvancedAnalyticsDialog}>
        <DialogContent className="w-[90vw] max-h-[90vh] flex flex-col" style={{ maxWidth: "calc(48rem + 100px)" }}>
          <DialogHeader>
            <DialogTitle>Add Data</DialogTitle>
            <DialogDescription>
              Manually enter metrics from YouTube Studio Analytics
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avg-duration">Avg. View Duration (minutes)</Label>
                  <Input
                    id="avg-duration"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3.08"
                    value={advancedAvgDuration}
                    onChange={(e) => setAdvancedAvgDuration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Average time viewers watched (in minutes)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="avg-percentage">Avg. Percentage Viewed (%)</Label>
                  <Input
                    id="avg-percentage"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 45.8"
                    value={advancedAvgPercentage}
                    onChange={(e) => setAdvancedAvgPercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    % of video watched on average
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="traffic-source">Top Traffic Source</Label>
                  <Select value={advancedTrafficSource} onValueChange={setAdvancedTrafficSource}>
                    <SelectTrigger id="traffic-source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YouTube Search">YouTube Search</SelectItem>
                      <SelectItem value="Suggested Videos">Suggested Videos</SelectItem>
                      <SelectItem value="Browse Features">Browse Features</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Channel Pages">Channel Pages</SelectItem>
                      <SelectItem value="Direct or Unknown">Direct or Unknown</SelectItem>
                      <SelectItem value="Playlists">Playlists</SelectItem>
                      <SelectItem value="Notifications">Notifications</SelectItem>
                      <SelectItem value="Other YouTube Features">Other YouTube Features</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Where most viewers found this video
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="traffic-percentage">Traffic Source %</Label>
                  <Input
                    id="traffic-percentage"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 42.5"
                    value={advancedTrafficPercentage}
                    onChange={(e) => setAdvancedTrafficPercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage from this source
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctr">CTR (%)</Label>
                  <Input
                    id="ctr"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.2"
                    value={advancedCTR}
                    onChange={(e) => setAdvancedCTR(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Click-through rate percentage
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="impressions">Impressions</Label>
                  <Input
                    id="impressions"
                    type="number"
                    placeholder="e.g., 12500"
                    value={advancedImpressions}
                    onChange={(e) => setAdvancedImpressions(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of times thumbnail was shown
                  </p>
                </div>
              </div>
            </div>
            </ScrollArea>
          </div>
          <div className="flex gap-2 pt-4 flex-shrink-0">
            <Button
              onClick={addAdvancedAnalytics}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90 flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Analytics Data
            </Button>
            <Button
              onClick={() => setShowAdvancedAnalyticsDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Video Dialog */}
      <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Video Manually</DialogTitle>
            <DialogDescription>
              Enter a YouTube video ID to add it to your database. Get the video ID from the URL (e.g., "dQw4w9WgXcQ" from youtube.com/watch?v=dQw4w9WgXcQ)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-id">Video ID</Label>
              <Input
                id="video-id"
                placeholder="e.g., zN07nHnO4rk"
                value={addVideoId}
                onChange={(e) => setAddVideoId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !addingVideo) {
                    addVideoManually();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: You can find the video ID in your YouTube Studio or from the video URL
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addVideoManually}
                disabled={addingVideo || !addVideoId.trim()}
                style={{ backgroundColor: themeColor }}
                className="text-white hover:opacity-90 flex-1"
              >
                {addingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adding Video...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowAddVideoDialog(false);
                  setAddVideoId("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Reach Dialog */}
      <Dialog open={showImportReachDialog} onOpenChange={setShowImportReachDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Reach Data (CTR & Impressions)</DialogTitle>
            <DialogDescription>
              Follow these steps to import your CTR and Impressions data from YouTube Studio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Step 1: Download from YouTube Studio */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-0.5">
                  <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Step 1: Download from YouTube Studio</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export your channel analytics data including impressions and CTR.
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 mb-3 ml-4 list-decimal">
                    <li>Open YouTube Studio, Analytics section</li>
                    <li>Click "Advanced Mode" on the top right.</li>
                    <li>Click Export Current View → Choose CSV</li>
                    <li>Save the "Table data.csv" file to your computer</li>
                  </ol>
                  
                  <Button
                    onClick={() => {
                      // If we have channel ID, go directly to that channel's analytics
                      // Otherwise, let YouTube redirect to the user's channel
                      const studioUrl = youtubeChannelId 
                        ? `https://studio.youtube.com/channel/${youtubeChannelId}/analytics`
                        : 'https://studio.youtube.com';
                      console.log('Opening YouTube Studio with URL:', studioUrl);
                      console.log('Channel ID:', youtubeChannelId);
                      window.open(studioUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full bg-[#5928CB] hover:bg-[#6c3ae0] dark:bg-[#7042d6] dark:hover:bg-[#8052e6] text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open YouTube Studio
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Step 2: Upload CSV */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 mt-0.5">
                  <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Step 2: Upload CSV File</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload the "Table data.csv" file you just downloaded.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      handleEngagementFileSelected(e);
                      setShowImportReachDialog(false);
                    }}
                    style={{ display: 'none' }}
                    id="reach-dialog-csv-input"
                  />
                  <Button
                    onClick={() => document.getElementById('reach-dialog-csv-input')?.click()}
                    className="w-full bg-[#5928CB] hover:bg-[#6c3ae0] dark:bg-[#7042d6] dark:hover:bg-[#8052e6] text-white transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowImportReachDialog(false)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Snapshot Note Dialog */}
      <Dialog open={showSnapshotNoteDialog} onOpenChange={setShowSnapshotNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add YouTube Sync Note</DialogTitle>
            <DialogDescription>
              Add an optional note to this YouTube sync (e.g., "Posted on Reddit", "Changed thumbnail", etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="snapshot-note">Note (Optional)</Label>
              <Textarea
                id="snapshot-note"
                placeholder="Enter a note about this sync..."
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                This note will be saved with the sync and displayed in the YouTube Sync History.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (pendingSnapshotVideoId) {
                    setShowSnapshotNoteDialog(false);
                    await takeSnapshot(pendingSnapshotVideoId, false, snapshotNote.trim() || undefined);
                    setPendingSnapshotVideoId(null);
                    setSnapshotNote("");
                  }
                }}
                disabled={takingSnapshot}
                style={{ backgroundColor: themeColor }}
                className="text-white hover:opacity-90 flex-1"
              >
                {takingSnapshot ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Capture Data
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowSnapshotNoteDialog(false);
                  setPendingSnapshotVideoId(null);
                  setSnapshotNote("");
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Importer */}
      <VideoBulkUpdateImporter
        videos={videos}
        onUpdate={handleBulkUpdate}
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
      />

      {/* CSV Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-3">
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Export to CSV</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const allFields = Object.keys(exportFields).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {} as any);
                    setExportFields(allFields);
                  }}
                  className="h-auto p-1 text-xs"
                >
                  Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const noFields = Object.keys(exportFields).reduce((acc, key) => {
                      acc[key] = false;
                      return acc;
                    }, {} as any);
                    setExportFields(noFields);
                  }}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Select the fields you want to include in your CSV export
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 overflow-y-auto pr-4">
            {/* Basic Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Basic Information</span>
              </div>
              <div className="space-y-3 ml-5">
                {[
                  { key: 'publishedAt', label: 'Published Date' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'description', label: 'Description' },
                  { key: 'thumbnailUrl', label: 'Thumbnail URL' },
                ].map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${field.key}`}
                      checked={exportFields[field.key as keyof typeof exportFields]}
                      onCheckedChange={(checked) => {
                        setExportFields({
                          ...exportFields,
                          [field.key]: checked
                        });
                      }}
                    />
                    <label
                      htmlFor={`export-${field.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Performance Metrics</span>
              </div>
              <div className="space-y-3 ml-5">
                {[
                  { key: 'views', label: 'Views' },
                  { key: 'likes', label: 'Likes' },
                  { key: 'comments', label: 'Comments' },
                  { key: 'subscribers', label: 'Subscribers' },
                ].map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${field.key}`}
                      checked={exportFields[field.key as keyof typeof exportFields]}
                      onCheckedChange={(checked) => {
                        setExportFields({
                          ...exportFields,
                          [field.key]: checked
                        });
                      }}
                    />
                    <label
                      htmlFor={`export-${field.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Analytics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Advanced Analytics</span>
              </div>
              <div className="space-y-3 ml-5">
                {[
                  { key: 'impressions', label: 'Impressions' },
                  { key: 'ctr', label: 'CTR %' },
                  { key: 'percentageViewed', label: 'Percentage Viewed %' },
                  { key: 'watchTime', label: 'Watch Time (min)' },
                  { key: 'avgViewDuration', label: 'Avg View Duration (sec)' },
                  { key: 'trafficSource', label: 'Top Traffic Source' },
                ].map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${field.key}`}
                      checked={exportFields[field.key as keyof typeof exportFields]}
                      onCheckedChange={(checked) => {
                        setExportFields({
                          ...exportFields,
                          [field.key]: checked
                        });
                      }}
                    />
                    <label
                      htmlFor={`export-${field.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Data */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm font-medium">Custom Data</span>
              </div>
              <div className="space-y-3 ml-5">
                {[
                  { key: 'tags', label: 'Tags' },
                  { key: 'notes', label: 'Notes' },
                  { key: 'nextSteps', label: 'Tasks' },
                ].map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${field.key}`}
                      checked={exportFields[field.key as keyof typeof exportFields]}
                      onCheckedChange={(checked) => {
                        setExportFields({
                          ...exportFields,
                          [field.key]: checked
                        });
                      }}
                    />
                    <label
                      htmlFor={`export-${field.key}`}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4 pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => exportToCSV(false)}
              disabled={!Object.values(exportFields).some(v => v)}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Snapshot Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteConfirmOpen(false);
            setPendingDeleteTimestamp(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete YouTube Sync</DialogTitle>
            <DialogDescription>
              {pendingDeleteTimestamp && (
                <>
                  Are you sure you want to delete the YouTube sync from {formatDate(pendingDeleteTimestamp)}? 
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPendingDeleteTimestamp(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteSnapshot();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Snapshot Note Dialog */}
      <Dialog open={showEditSnapshotNoteDialog} onOpenChange={setShowEditSnapshotNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit YouTube Sync Note</DialogTitle>
            <DialogDescription>
              Add or edit a note for this YouTube sync
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="snapshot-note">Note</Label>
              <Textarea
                id="snapshot-note"
                placeholder="Add a note about this snapshot..."
                value={editingSnapshotNote}
                onChange={(e) => setEditingSnapshotNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditSnapshotNoteDialog(false);
                setEditingSnapshotTimestamp(null);
                setEditingSnapshotNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={updateSnapshotNote}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean Analytics Data Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💣 Nuclear Analytics Cleanup</DialogTitle>
            <DialogDescription>
              This will PERMANENTLY delete ALL analytics history for ALL videos. Everything goes. Complete fresh start.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="font-semibold mb-2">💣 NUCLEAR OPTION - This will DELETE:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                  <li>ALL snapshots (every single one)</li>
                  <li>ALL views, likes, comments data</li>
                  <li>ALL impressions and CTR data (even manually imported)</li>
                  <li>ALL retention, traffic, and watch time data</li>
                  <li>Basically everything except video title, tags, and notes</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Alert className="border-blue-500 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <p className="font-semibold mb-2">✅ After cleanup, rebuild in this order:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                  <li><strong>YouTube Sync (Lifetime)</strong> - Gets current lifetime basic + advanced metrics</li>
                  <li><strong>YouTube Sync (Last 28 Days)</strong> - Gets correct 28-day basic + advanced metrics</li>
                  <li><strong>Backfill 4/7/28</strong> - Creates milestone snapshots with historical retention & traffic data</li>
                  <li><strong>Import Reach CSV</strong> - Upload impressions/CTR with specific capture dates</li>
                </ol>
                <p className="text-xs mt-2">💡 Tip: When importing reach data, use the date picker to specify when the data was captured for accurate historical tracking.</p>
              </AlertDescription>
            </Alert>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                <strong>Videos processed:</strong> {videos.length}<br />
                <strong>Snapshots to review:</strong> {videos.reduce((sum, v) => sum + (v.analyticsHistory?.length || 0), 0)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCleanupDialog(false)}
              disabled={cleaningData}
            >
              Cancel
            </Button>
            <Button
              onClick={cleanupBasicAnalytics}
              disabled={cleaningData}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {cleaningData ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Nuking...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  💣 Delete All Analytics
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* YouTube Sync Date Range Dialog */}
      <Dialog open={showSyncDateRangeDialog} onOpenChange={setShowSyncDateRangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>YouTube Sync - Choose Date Range</DialogTitle>
            <DialogDescription>
              Select which metrics you want to sync from YouTube Analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Data Range</Label>
              <div className="space-y-2">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    syncDateRangeChoice === 'sincePublished' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSyncDateRangeChoice('sincePublished')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Lifetime</div>
                      <div className="text-sm text-muted-foreground">All metrics since video was published</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      syncDateRangeChoice === 'sincePublished' ? 'border-purple-500' : 'border-gray-300'
                    }`}>
                      {syncDateRangeChoice === 'sincePublished' && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    syncDateRangeChoice === 'last28' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSyncDateRangeChoice('last28')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Last 28 Days</div>
                      <div className="text-sm text-muted-foreground">Recent performance metrics</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      syncDateRangeChoice === 'last28' ? 'border-purple-500' : 'border-gray-300'
                    }`}>
                      {syncDateRangeChoice === 'last28' && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: Impressions and CTR must be imported separately via CSV
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSyncDateRangeDialog(false);
                setPendingSnapshotVideoId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSyncWithDateRange}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reach Import Date Range Dialog */}
      <Dialog open={showEngagementImportDialog} onOpenChange={setShowEngagementImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Reach Metrics</DialogTitle>
            <DialogDescription>
              Configure the date and range for the imported reach data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data Range</Label>
              <Select value={engagementDateRange} onValueChange={(value: 'lifetime' | 'last28') => setEngagementDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                  <SelectItem value="last28">Last 28 Days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This determines how the imported CTR and Impressions will be tagged and filtered in your analytics.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Date Captured (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={engagementCaptureDate ? engagementCaptureDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setEngagementCaptureDate(new Date(e.target.value));
                    } else {
                      setEngagementCaptureDate(undefined);
                    }
                  }}
                  className="flex-1"
                />
                {engagementCaptureDate && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEngagementCaptureDate(undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Specify when this data was captured. Leave blank to use today's date.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Note:</strong> For videos 28 days old or younger, the system automatically creates snapshots for both date ranges since they're identical.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowEngagementImportDialog(false);
                setPendingEngagementFile(null);
                setEngagementCaptureDate(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEngagementImport}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main YouTube Sync Date Range Dialog */}
      <Dialog open={showMainSyncDialog} onOpenChange={setShowMainSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>YouTube Sync</DialogTitle>
            <DialogDescription>
              Choose which videos and date range to sync from YouTube.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={mainSyncDateRange} onValueChange={(value: 'last28' | 'sincePublished') => setMainSyncDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sincePublished">Lifetime</SelectItem>
                  <SelectItem value="last28">Last 28 Days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The time period for analytics data.
              </p>
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="syncAllVideos" 
                checked={syncAllVideos}
                onCheckedChange={(checked) => setSyncAllVideos(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="syncAllVideos"
                  className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sync All Videos
                </label>
                <p className="text-sm text-muted-foreground">
                  {syncAllVideos 
                    ? 'Will sync all videos from your channel.'
                    : `Will sync only the ${filteredVideos.length} video${filteredVideos.length !== 1 ? 's' : ''} currently shown (respecting active filters).`
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowMainSyncDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmMainSync}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Sync Reach Import Prompt */}
      <Dialog open={showPostSyncReachPrompt} onOpenChange={setShowPostSyncReachPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Sync Complete!</DialogTitle>
            <DialogDescription>
              Your videos have been synced from YouTube. Would you like to import reach metrics (impressions, CTR, traffic sources) now?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Import Reach Metrics</h4>
              <p className="text-sm text-purple-700 mb-3">
                To get impressions, CTR, and traffic source data:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-purple-700 ml-2">
                <li>Go to YouTube Studio → Analytics → Reach tab</li>
                <li>Click "Advanced mode" on the top right → "Export current view" → Choose CSV</li>
                <li>Click "Import Reach CSV" below to upload the file</li>
              </ol>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>You can also import reach data later from Settings</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPostSyncReachPrompt(false)}
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => {
                setShowPostSyncReachPrompt(false);
                // Show the reach import date range dialog
                setShowEngagementImportDialog(true);
              }}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Reach CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Analytics Confirmation Dialog */}
      <AlertDialog open={showClearAnalyticsDialog} onOpenChange={setShowClearAnalyticsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Reach Data?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div className="text-sm text-muted-foreground">
                  This will remove all reach and analytics data (views, likes, comments, impressions, CTR, snapshots, etc.) from all videos while preserving:
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Video information (title, description, thumbnail)</li>
                  <li>Your notes and next steps</li>
                  <li>Tags and categories</li>
                  <li>Performance goals</li>
                </ul>
                <div className="mt-3 font-semibold text-destructive text-sm">
                  This action cannot be undone.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingAnalytics}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAllAnalytics}
              disabled={clearingAnalytics}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingAnalytics ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Reach
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Video Dialog */}
      <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
            <DialogDescription>
              Enter a YouTube video ID to add it to your database
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="video-id">Video ID</Label>
              <Input
                id="video-id"
                placeholder="e.g. dQw4w9WgXcQ"
                value={addVideoId}
                onChange={(e) => setAddVideoId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && addVideoId.trim()) {
                    addVideoManually();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The video ID is the part after "v=" in the YouTube URL
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={addVideoManually}
              disabled={!addVideoId.trim() || addingVideo}
              className="flex-1 text-white"
              style={{ backgroundColor: themeColor }}
            >
              {addingVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  YouTube Sync
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                // TODO: Open manual data entry dialog
                toast.info("Manual data entry coming soon!");
              }}
              disabled={!addVideoId.trim() || addingVideo}
              variant="outline"
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Add Data Manually
            </Button>
          </div>

          <div className="flex gap-2 justify-end border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddVideoDialog(false);
                setAddVideoId("");
              }}
              disabled={addingVideo}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        open={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        accessToken={accessToken}
      />
      
      {/* Beta OAuth Notice Dialog */}
      <Dialog open={showBetaOAuthNotice} onOpenChange={setShowBetaOAuthNotice}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Beta Testing Notice
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              TubeLab is currently in beta testing. When you connect to YouTube Analytics, you'll see a warning from Google:
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                "Google hasn't verified this app"
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This is normal for apps in testing mode. To continue, click <strong>"Advanced"</strong> then <strong>"Go to TubeLab (unsafe)"</strong>
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your data is secure. TubeLab will be fully verified by Google before public launch. This warning only appears during our beta testing period.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBetaOAuthNotice(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBetaNoticeAcknowledged}
            >
              I Understand, Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reach Data Error Correction Dialog */}
      {showErrorCorrectionDialog && importErrors.length > 0 && (
        <ReachDataErrorCorrection
          errors={importErrors}
          dateRange={engagementDateRange}
          onClose={() => {
            setShowErrorCorrectionDialog(false);
            setImportErrors([]);
          }}
          onComplete={async () => {
            await fetchDatabaseVideos();
          }}
        />
      )}
      
      {/* Hidden file input for engagement CSV import */}
      <input
        id="engagement-csv-import-input"
        type="file"
        accept=".csv"
        onChange={handleEngagementFileSelected}
        className="hidden"
      />
    </div>
  </div>
  );
}
