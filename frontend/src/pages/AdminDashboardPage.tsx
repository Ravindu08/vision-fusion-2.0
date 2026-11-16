import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import {
  adminService,
  type AdminStats,
  type AdminUserItem,
  type AdminUserCreate,
  type AdminUserUpdate,
} from '../services/adminService';
import {
  Shield,
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Award,
  Download,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Loader2,
  Sparkles,
  Eye,
  Key,
  GraduationCap,
  Mail,
  Hash,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'The Recruit': { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
  'The Builder': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'The Pathfinder': { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'The Intelligence Operative': { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  'The Vanguard': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
};

function getStageFromXp(xp: number): string {
  if (xp >= 450) return 'The Vanguard';
  if (xp >= 350) return 'The Intelligence Operative';
  if (xp >= 200) return 'The Pathfinder';
  if (xp >= 100) return 'The Builder';
  return 'The Recruit';
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [certFilter, setCertFilter] = useState<'all' | 'issued' | 'eligible' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'xp-desc' | 'xp-asc' | 'name-asc' | 'date-desc'>('xp-desc');
  const [exporting, setExporting] = useState(false);

  // Enrolled List Modal State
  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [enrolledSearchTerm, setEnrolledSearchTerm] = useState('');

  // Ref for scrolling directly to database table
  const tableRef = useRef<HTMLDivElement>(null);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<AdminUserCreate>({
    full_name: '',
    email: '',
    password: '',
    university: 'Uva Wellassa University',
    student_id: '',
    total_xp: 0,
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<AdminUserItem | null>(null);
  const [editForm, setEditForm] = useState<AdminUserUpdate & { reset_password?: string }>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // View Details Modal State
  const [viewingStudent, setViewingStudent] = useState<AdminUserItem | null>(null);

  // Delete Modal State
  const [deletingStudent, setDeletingStudent] = useState<AdminUserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({
          search: searchTerm.trim() || undefined,
          stage: stageFilter !== 'all' ? stageFilter : undefined,
          limit: 200,
        }),
      ]);
      setStats(statsRes);
      setStudents(usersRes.users);
      setTotalStudents(usersRes.total);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
      showToast('error', 'Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, stageFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Client-side filtering & sorting for smooth UX
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Status Filter
    if (statusFilter === 'active') {
      result = result.filter((s) => s.is_active);
    } else if (statusFilter === 'suspended') {
      result = result.filter((s) => !s.is_active);
    }

    // Certificate Filter
    if (certFilter === 'issued') {
      result = result.filter((s) => s.certificate_claimed);
    } else if (certFilter === 'eligible') {
      result = result.filter((s) => s.certificate_eligible && !s.certificate_claimed);
    } else if (certFilter === 'locked') {
      result = result.filter((s) => !s.certificate_eligible && !s.certificate_claimed);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'xp-desc') return b.total_xp - a.total_xp;
      if (sortBy === 'xp-asc') return a.total_xp - b.total_xp;
      if (sortBy === 'name-asc') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'date-desc') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [students, statusFilter, certFilter, sortBy]);

  // Modal filtered students
  const modalFilteredStudents = useMemo(() => {
    if (!enrolledSearchTerm.trim()) return students;
    const q = enrolledSearchTerm.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.student_id && s.student_id.toLowerCase().includes(q)) ||
        (s.university && s.university.toLowerCase().includes(q))
    );
  }, [students, enrolledSearchTerm]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await adminService.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VisionFusion2_Students_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Student registry exported successfully as CSV.');
    } catch (err) {
      console.error('CSV export failed', err);
      showToast('error', 'Failed to export CSV file.');
    } finally {
      setExporting(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddForm((prev) => ({ ...prev, password: pwd }));
    setShowAddPassword(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.full_name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      setAddError('Please fill in Full Name, Email, and Password.');
      return;
    }

    setAddingStudent(true);
    setAddError(null);

    try {
      const created = await adminService.createUser({
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password.trim(),
        university: addForm.university?.trim() || 'Uva Wellassa University',
        student_id: addForm.student_id?.trim() || undefined,
        total_xp: Number(addForm.total_xp) || 0,
      });

      setStudents((prev) => [created, ...prev]);
      setTotalStudents((prev) => prev + 1);
      setIsAddModalOpen(false);
      setAddForm({
        full_name: '',
        email: '',
        password: '',
        university: 'Uva Wellassa University',
        student_id: '',
        total_xp: 0,
      });
      showToast('success', `Student '${created.full_name}' successfully enrolled!`);
      adminService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      console.error('Create student error:', err);
      setAddError(err.response?.data?.detail || 'Failed to enroll student. Please check input details.');
    } finally {
      setAddingStudent(false);
    }
  };

  const openEditModal = (student: AdminUserItem) => {
    setEditingStudent(student);
    setEditForm({
      full_name: student.full_name,
      email: student.email,
      student_id: student.student_id || '',
      university: student.university || '',
      total_xp: student.total_xp,
      is_active: student.is_active,
      password: '',
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    setSavingEdit(true);
    setEditError(null);

    try {
      const payload: AdminUserUpdate = {
        full_name: editForm.full_name?.trim(),
        email: editForm.email?.trim().toLowerCase(),
        student_id: editForm.student_id?.trim() || undefined,
        university: editForm.university?.trim(),
        total_xp: editForm.total_xp,
        is_active: editForm.is_active,
      };

      if (editForm.password && editForm.password.trim().length >= 6) {
        payload.password = editForm.password.trim();
      }

      const updated = await adminService.updateUser(editingStudent.id, payload);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (viewingStudent?.id === updated.id) {
        setViewingStudent(updated);
      }
      setEditingStudent(null);
      showToast('success', `Student '${updated.full_name}' updated successfully.`);
      adminService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      console.error('Update failed', err);
      setEditError(err.response?.data?.detail || 'Failed to update student details.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    setDeleting(true);

    try {
      await adminService.deleteUser(deletingStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
      setTotalStudents((prev) => Math.max(0, prev - 1));
      if (viewingStudent?.id === deletingStudent.id) {
        setViewingStudent(null);
      }
      showToast('success', `Student '${deletingStudent.full_name}' was removed.`);
      setDeletingStudent(null);
      adminService.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      console.error('Delete failed', err);
      showToast('error', err.response?.data?.detail || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl border font-mono text-xs shadow-2xl flex items-center gap-2.5 animate-bounce ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
                : 'bg-red-950/95 border-red-500/60 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Hero Command Center Banner */}
        <div className="cyber-card p-6 md:p-8 relative overflow-hidden border-purple-500/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-wider mb-2.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Executive Command Console</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
                Operative Registry & <span className="text-purple-400">Student Control</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Comprehensive participant management for IEEE Tech Career Week. Enroll new students, update profiles, search records, manage XP, and inspect digital credentials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Add Student Primary Action */}
              <button
                onClick={() => {
                  setAddError(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-glow-cyan hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll New Student</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 text-slate-200 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Export CSV</span>
              </button>

              {/* Refresh */}
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Refresh Registry"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Overview Analytics Metrics Grid - Interactive Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: TOTAL ENROLLED (Clickable -> Opens Enrolled List Modal) */}
          <button
            type="button"
            onClick={() => {
              setEnrolledSearchTerm('');
              setIsEnrolledModalOpen(true);
            }}
            className="cyber-card p-5 border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between text-left hover:border-cyan-400 hover:shadow-glow-cyan hover:scale-[1.02] transition-all cursor-pointer group w-full relative overflow-hidden"
            title="Click to view full enrolled students list"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>Total Enrolled</span>
                </div>
                <div className="text-2xl font-black font-mono text-cyan-300">
                  {stats ? stats.total_students : '--'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 flex items-center gap-1 transition-all">
                View List <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>

          {/* Card 2: EVENT CHECK-INS (Clickable -> Filters Attendees) */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStageFilter('all');
              setStatusFilter('all');
              setCertFilter('all');
              scrollToTable();
            }}
            className="cyber-card p-5 border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between text-left hover:border-emerald-400 hover:shadow-glow-emerald hover:scale-[1.02] transition-all cursor-pointer group w-full"
            title="Click to jump to table"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Event Check-ins
                </div>
                <div className="text-2xl font-black font-mono text-emerald-300">
                  {stats ? stats.total_attendance_records : '--'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 group-hover:bg-emerald-500/20 flex items-center gap-1 transition-all">
              Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          {/* Card 3: QUIZZES SOLVED (Clickable -> Filters Solvers) */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStageFilter('all');
              setStatusFilter('all');
              setCertFilter('all');
              scrollToTable();
            }}
            className="cyber-card p-5 border-amber-500/30 bg-amber-500/5 flex items-center justify-between text-left hover:border-amber-400 hover:scale-[1.02] transition-all cursor-pointer group w-full"
            title="Click to jump to table"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 group-hover:bg-amber-500/25 transition-all">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Quizzes Solved
                </div>
                <div className="text-2xl font-black font-mono text-amber-300">
                  {stats ? stats.total_quiz_attempts : '--'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 group-hover:bg-amber-500/20 flex items-center gap-1 transition-all">
              Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          {/* Card 4: CERTIFICATES CLAIMED (Clickable -> Filters Cert Claimed) */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStageFilter('all');
              setStatusFilter('all');
              setCertFilter('issued');
              scrollToTable();
            }}
            className="cyber-card p-5 border-purple-500/30 bg-purple-500/5 flex items-center justify-between text-left hover:border-purple-400 hover:shadow-glow-purple hover:scale-[1.02] transition-all cursor-pointer group w-full"
            title="Click to filter issued certificates"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Certificates Claimed
                </div>
                <div className="text-2xl font-black font-mono text-purple-300">
                  {stats ? `${stats.total_certificates_claimed} / ${stats.total_certificates_eligible}` : '--'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 group-hover:bg-purple-500/20 flex items-center gap-1 transition-all">
              Filter <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Filter, Search & Sorting Control Center */}
        <div className="cyber-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, ID, email, or university..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 font-mono transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status and Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">All Status</option>
                  <option value="active" className="bg-slate-900 text-emerald-400">Active</option>
                  <option value="suspended" className="bg-slate-900 text-red-400">Suspended</option>
                </select>
              </div>

              {/* Certificate Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-500">Cert:</span>
                <select
                  value={certFilter}
                  onChange={(e) => setCertFilter(e.target.value as any)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">All</option>
                  <option value="issued" className="bg-slate-900 text-emerald-400">Issued</option>
                  <option value="eligible" className="bg-slate-900 text-cyan-400">Eligible</option>
                  <option value="locked" className="bg-slate-900 text-slate-400">Locked</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="xp-desc" className="bg-slate-900 text-slate-200">XP (Highest First)</option>
                  <option value="xp-asc" className="bg-slate-900 text-slate-200">XP (Lowest First)</option>
                  <option value="name-asc" className="bg-slate-900 text-slate-200">Name (A-Z)</option>
                  <option value="date-desc" className="bg-slate-900 text-slate-200">Newest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Character Stage Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Stage:
            </span>
            {['all', 'The Recruit', 'The Builder', 'The Pathfinder', 'The Intelligence Operative', 'The Vanguard'].map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  stageFilter === st
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-400/60 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st === 'all' ? 'All Stages' : st.replace('The ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Title and Count Header */}
        <div ref={tableRef} className="flex items-center justify-between px-1 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Operatives Database
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              {filteredStudents.length} matching
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Enrolled: {totalStudents}
          </span>
        </div>

        {/* Student Registry Table */}
        <div className="cyber-card overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-xs font-mono">Querying operatives records...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No student operatives found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No records match your active search or filters. Try adjusting your search query or reset the filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('all');
                  setStatusFilter('all');
                  setCertFilter('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyber-border bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Operative</th>
                    <th className="py-3.5 px-4">Institution & ID</th>
                    <th className="py-3.5 px-4">Progression (XP)</th>
                    <th className="py-3.5 px-4">Engagement</th>
                    <th className="py-3.5 px-4">Status & Cert</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredStudents.map((student) => {
                    const stageStyle = STAGE_COLORS[student.character_stage] || STAGE_COLORS['The Recruit'];
                    return (
                      <tr key={student.id} className="hover:bg-slate-900/50 transition-colors group">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
                              {student.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-2">
                                <span>{student.full_name}</span>
                              </div>
                              <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* University & ID */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={student.university || 'N/A'}>
                              {student.university || 'N/A'}
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                            <Hash className="w-3 h-3 text-slate-500" />
                            {student.student_id || 'NOT_ASSIGNED'}
                          </div>
                        </td>

                        {/* XP & Stage */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-300 text-sm">{student.total_xp}</span>
                            <span className="text-[10px] text-slate-500 font-mono">/ 500 XP</span>
                          </div>
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
                              {student.character_stage}
                            </span>
                          </div>
                        </td>

                        {/* Engagement */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 font-mono text-slate-300">
                            <span title="Sessions Attended" className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              <Calendar className="w-3 h-3 text-cyan-400" /> {student.sessions_attended}
                            </span>
                            <span title="Quizzes Completed" className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              <HelpCircle className="w-3 h-3 text-amber-400" /> {student.quizzes_completed}
                            </span>
                          </div>
                        </td>

                        {/* Status & Certificate */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div>
                              {student.is_active ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Suspended
                                </span>
                              )}
                            </div>
                            <div>
                              {student.certificate_claimed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                                  <Award className="w-3 h-3 text-emerald-400" /> Cert Issued
                                </span>
                              ) : student.certificate_eligible ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                                  <Sparkles className="w-3 h-3 text-cyan-400" /> Eligible (&ge;350)
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">Locked (&lt;350 XP)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Profile */}
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="View Operative Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Student */}
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/80 text-slate-300 hover:text-purple-300 border border-transparent hover:border-purple-500/40 transition-colors cursor-pointer"
                              title="Edit Student Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Student */}
                            <button
                              onClick={() => setDeletingStudent(student)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-300 hover:text-red-400 border border-transparent hover:border-red-500/40 transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ENROLLED STUDENTS LIST MODAL (Triggered by Total Enrolled Card)*/}
        {/* ============================================================== */}
        {isEnrolledModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="cyber-card p-6 w-full max-w-4xl border-cyan-500/60 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                      Enrolled Operatives Directory
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
                        {students.length} Total Registered
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Complete active roster of students enrolled in Vision Fusion 2.0 Tech Career Week.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEnrolledModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search Bar */}
              <div className="pt-4 pb-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enrolledSearchTerm}
                    onChange={(e) => setEnrolledSearchTerm(e.target.value)}
                    placeholder="Quick search enrolled students by name, email, ID, or university..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    autoFocus
                  />
                  {enrolledSearchTerm && (
                    <button
                      onClick={() => setEnrolledSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enrolled Students Table / List */}
              <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2">
                {modalFilteredStudents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-mono text-xs">
                    No enrolled students match &quot;{enrolledSearchTerm}&quot;
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {modalFilteredStudents.map((st, idx) => {
                      const stageStyle = STAGE_COLORS[st.character_stage] || STAGE_COLORS['The Recruit'];
                      return (
                        <div
                          key={st.id}
                          className="py-3 px-3 hover:bg-slate-900/60 rounded-xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          {/* Student Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-100 flex items-center gap-2">
                                <span className="truncate">{st.full_name}</span>
                                {st.is_active ? (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-mono">
                                    Suspended
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 font-mono text-[11px] truncate flex items-center gap-2 mt-0.5">
                                <span>{st.email}</span>
                                <span>•</span>
                                <span className="text-slate-300">{st.student_id || 'ID Pending'}</span>
                              </div>
                            </div>
                          </div>

                          {/* University & Stage */}
                          <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                            <div className="text-slate-400 hidden lg:block max-w-[180px] truncate">
                              {st.university || 'UWU'}
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
                              {st.character_stage}
                            </span>

                            <div className="text-cyan-300 font-bold min-w-[70px] text-right">
                              {st.total_xp} XP
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 pl-2">
                              <button
                                onClick={() => {
                                  setIsEnrolledModalOpen(false);
                                  setViewingStudent(st);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                                title="View Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setIsEnrolledModalOpen(false);
                                  openEditModal(st);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/80 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between shrink-0">
                <span className="text-xs font-mono text-slate-500">
                  Showing {modalFilteredStudents.length} of {students.length} operatives
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEnrolledModalOpen(false);
                      setSearchTerm('');
                      setStageFilter('all');
                      setStatusFilter('all');
                      setCertFilter('all');
                      scrollToTable();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Jump to Full Database Table</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsEnrolledModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADD STUDENT MODAL                                              */}
        {/* ============================================================== */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-lg border-cyan-500/50 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-4">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-sm font-bold">
                  <UserPlus className="w-4 h-4 text-cyan-400" /> Enroll New Student Operative
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addError && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Fernando"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Student Email <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@std.uwu.ac.lk"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Password with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono text-slate-400 uppercase">
                      Password <span className="text-cyan-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={addForm.password}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-200"
                    >
                      {showAddPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Student ID & Initial XP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Student Reg ID</label>
                    <input
                      type="text"
                      placeholder="e.g. UWU/CST/22/045"
                      value={addForm.student_id || ''}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, student_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                      Initial XP ({addForm.total_xp || 0})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={addForm.total_xp}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, total_xp: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                {/* Stage Preview */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Starting Character Stage:</span>
                  <span className="text-cyan-300 font-bold">{getStageFromXp(addForm.total_xp || 0)}</span>
                </div>

                {/* University */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">University / Faculty</label>
                  <input
                    type="text"
                    value={addForm.university || ''}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-cyber-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingStudent}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {addingStudent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    Confirm Enrollment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT STUDENT MODAL                                             */}
        {/* ============================================================== */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-lg border-purple-500/50 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-4">
                <div className="flex items-center gap-2 text-purple-300 font-mono text-sm font-bold">
                  <Edit2 className="w-4 h-4 text-purple-400" /> Edit Student Record
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                {/* Student ID & Total XP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Student ID</label>
                    <input
                      type="text"
                      value={editForm.student_id || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, student_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Total XP (0-500)</label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={editForm.total_xp ?? 0}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, total_xp: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                </div>

                {/* Stage Preview on Edit */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Calculated Character Stage:</span>
                  <span className="text-purple-300 font-bold">{getStageFromXp(editForm.total_xp ?? 0)}</span>
                </div>

                {/* University */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">University / Faculty</label>
                  <input
                    type="text"
                    value={editForm.university || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Reset Password (Optional) */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Reset Password <span className="text-slate-500">(Leave blank to keep unchanged)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password (optional)"
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editForm.is_active ?? true}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-mono text-slate-300 cursor-pointer">
                    Active Operative Status (Uncheck to suspend student from logging in)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-cyber-border">
                <button
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW STUDENT DOSSIER MODAL                                     */}
        {/* ============================================================== */}
        {viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-lg border-cyan-500/50 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-4">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-sm font-bold">
                  <Eye className="w-4 h-4 text-cyan-400" /> Operative Dossier
                </div>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Header profile info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-lg">
                    {viewingStudent.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-100 truncate">{viewingStudent.full_name}</h3>
                    <p className="text-xs text-slate-400 font-mono truncate">{viewingStudent.email}</p>
                  </div>
                  <div>
                    {viewingStudent.is_active ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">Student ID</span>
                    <span className="text-slate-200 font-bold">{viewingStudent.student_id || 'Not Assigned'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">University</span>
                    <span className="text-slate-200 font-bold truncate block">{viewingStudent.university || 'N/A'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">Current Stage</span>
                    <span className="text-purple-300 font-bold">{viewingStudent.character_stage}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">Total XP</span>
                    <span className="text-cyan-300 font-bold">{viewingStudent.total_xp} / 500 XP</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">Sessions Attended</span>
                    <span className="text-slate-200 font-bold">{viewingStudent.sessions_attended} sessions</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-[10px]">Quizzes Solved</span>
                    <span className="text-slate-200 font-bold">{viewingStudent.quizzes_completed} quizzes</span>
                  </div>
                </div>

                {/* Certificate Status Box */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" /> Digital Certificate:
                  </span>
                  {viewingStudent.certificate_claimed ? (
                    <span className="text-emerald-400 font-bold">Claimed & Issued</span>
                  ) : viewingStudent.certificate_eligible ? (
                    <span className="text-cyan-400 font-bold">Eligible (&ge;350 XP)</span>
                  ) : (
                    <span className="text-slate-500">Locked (Requires {Math.max(0, 350 - viewingStudent.total_xp)} more XP)</span>
                  )}
                </div>

                {/* User ID */}
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-500 truncate">
                  Record UUID: {viewingStudent.id}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-cyber-border">
                <button
                  onClick={() => {
                    const s = viewingStudent;
                    setViewingStudent(null);
                    openEditModal(s);
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Record
                </button>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DELETE CONFIRMATION MODAL                                      */}
        {/* ============================================================== */}
        {deletingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-md border-red-500/50 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Delete Student Operative</h3>
                  <p className="text-xs text-slate-400">Irreversible administrative action.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-mono">
                Are you sure you want to delete <span className="text-red-400 font-bold">{deletingStudent.full_name}</span> ({deletingStudent.email})? All associated XP transactions, attendance, and quiz attempts will be permanently erased.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeletingStudent(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Yes, Remove Student
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
