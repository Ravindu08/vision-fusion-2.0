import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import {
  adminService,
  type AdminStats,
  type AdminUserItem,
  type AdminUserUpdate,
} from '../services/adminService';
import {
  Shield,
  Users,
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
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<AdminUserItem | null>(null);
  const [editForm, setEditForm] = useState<AdminUserUpdate>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingStudent, setDeletingStudent] = useState<AdminUserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
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
          limit: 100,
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

  const openEditModal = (student: AdminUserItem) => {
    setEditingStudent(student);
    setEditForm({
      full_name: student.full_name,
      student_id: student.student_id || '',
      university: student.university || '',
      total_xp: student.total_xp,
      is_active: student.is_active,
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    setSavingEdit(true);
    setEditError(null);

    try {
      const updated = await adminService.updateUser(editingStudent.id, editForm);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingStudent(null);
      showToast('success', `Student '${updated.full_name}' updated successfully.`);
      // Refresh stats in background
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
      showToast('success', `Student '${deletingStudent.full_name}' has been deleted.`);
      setDeletingStudent(null);
      // Refresh stats
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
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl border font-mono text-xs shadow-xl flex items-center gap-2 animate-bounce ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/90 border-red-500/50 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            {toast.message}
          </div>
        )}

        {/* Top Hero Banner */}
        <div className="cyber-card p-6 md:p-8 relative overflow-hidden border-purple-500/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Administrator Command Center
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Event Oversight & <span className="text-purple-400">Student Control</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                Oversee participant engagement across IEEE Tech Career Week. Manage student profiles, inspect attendance claims, and generate certified registry exports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-glow-purple disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Export Student Registry (CSV)
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Overview Analytics Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card p-5 border-cyan-500/30 bg-cyan-500/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Students</div>
              <div className="text-2xl font-black font-mono text-cyan-300">{stats ? stats.total_students : '--'}</div>
            </div>
          </div>

          <div className="cyber-card p-5 border-emerald-500/30 bg-emerald-500/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Attendance Claims</div>
              <div className="text-2xl font-black font-mono text-emerald-300">{stats ? stats.total_attendance_records : '--'}</div>
            </div>
          </div>

          <div className="cyber-card p-5 border-amber-500/30 bg-amber-500/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Quizzes Completed</div>
              <div className="text-2xl font-black font-mono text-amber-300">{stats ? stats.total_quiz_attempts : '--'}</div>
            </div>
          </div>

          <div className="cyber-card p-5 border-purple-500/30 bg-purple-500/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Certificates Unlocked</div>
              <div className="text-2xl font-black font-mono text-purple-300">
                {stats ? `${stats.total_certificates_claimed} / ${stats.total_certificates_eligible}` : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Controls */}
        <div className="cyber-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID, email, or university..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Stage Filter:</span>
            {['all', 'The Recruit', 'The Builder', 'The Pathfinder', 'The Intelligence Operative', 'The Vanguard'].map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  stageFilter === st
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('The ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Title and Total Count */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Registered Operatives ({totalStudents})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Showing {students.length} of {totalStudents} students
          </span>
        </div>

        {/* Student Registry Table */}
        <div className="cyber-card overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-xs font-mono">Loading registered students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="p-14 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No students found matching your criteria</p>
              <p className="text-xs text-slate-500">Try clearing your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyber-border bg-slate-900/60 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">University & ID</th>
                    <th className="py-3.5 px-4">Progression (XP)</th>
                    <th className="py-3.5 px-4">Engagement</th>
                    <th className="py-3.5 px-4">Certificate</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          {student.full_name}
                          {!student.is_active && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-mono">
                              Suspended
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">{student.email}</div>
                      </td>

                      {/* University & ID */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{student.university || 'N/A'}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          ID: {student.student_id || 'NOT_ASSIGNED'}
                        </div>
                      </td>

                      {/* XP & Stage */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-400">{student.total_xp} XP</div>
                        <div className="text-[11px] text-purple-300 font-mono">{student.character_stage}</div>
                      </td>

                      {/* Engagement */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 font-mono text-slate-400">
                          <span title="Sessions Attended" className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {student.sessions_attended}
                          </span>
                          <span title="Quizzes Completed" className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> {student.quizzes_completed}
                          </span>
                        </div>
                      </td>

                      {/* Certificate Status */}
                      <td className="py-3.5 px-4">
                        {student.certificate_claimed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                            <Award className="w-3 h-3 text-emerald-400" /> Issued
                          </span>
                        ) : student.certificate_eligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                            <Sparkles className="w-3 h-3 text-cyan-400" /> Eligible
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">Locked (&lt;350 XP)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-lg border-purple-500/50 relative shadow-2xl">
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
                <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                  {editError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

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
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Total XP</label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={editForm.total_xp ?? 0}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, total_xp: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">University / Faculty</label>
                  <input
                    type="text"
                    value={editForm.university || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editForm.is_active ?? true}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-mono text-slate-300 cursor-pointer">
                    Active Account Status (Uncheck to suspend student)
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

        {/* Delete Confirmation Modal */}
        {deletingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="cyber-card p-6 w-full max-w-md border-red-500/50 relative shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Delete Student Account</h3>
                  <p className="text-xs text-slate-400">This action is irreversible.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-mono">
                Are you sure you want to remove <span className="text-red-400 font-bold">{deletingStudent.full_name}</span> ({deletingStudent.email})? All associated attendance and quiz records will be permanently deleted.
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
                  Yes, Delete Student
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
