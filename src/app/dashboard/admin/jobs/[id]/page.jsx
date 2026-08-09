// src/app/admin/jobs/[id]/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { serverFetch } from "@/lib/core/server";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Calendar, Briefcase, MapPin, Building2 } from "lucide-react";

export default function AdminJobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Reject Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await serverFetch(`/api/jobs/admin/jobs/${id}`);
                if (res.success) setJob(res.data);
                else toast.error("Failed to load job");
            } catch (error) {
                toast.error("Error fetching job details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchJob();
    }, [id]);

    const handleApproval = async () => {
        setUpdating(true);
        try {
            const res = await serverFetch(`/api/jobs/admin/jobs/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ action: 'approve' })
            });
            if (res.success) {
                toast.success("Job Approved & Published!");
                setJob(prev => ({ ...prev, status: 'approved' }));
            }
        } catch (error) {
            toast.error("Failed to approve job");
        } finally {
            setUpdating(false);
        }
    };

    const handleRejection = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a rejection reason.");
            return;
        }
        setUpdating(true);
        try {
            const res = await serverFetch(`/api/jobs/admin/jobs/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ action: 'reject', reason: rejectReason })
            });
            if (res.success) {
                toast.success("Job Rejected");
                setJob(prev => ({ ...prev, status: 'rejected' }));
                setShowRejectModal(false);
                setRejectReason("");
            }
        } catch (error) {
            toast.error("Failed to reject job");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-zinc-400">Loading Job Details...</div>;

    return (
        <div className="min-h-screen bg-[#090a0f] text-white p-6 md:p-12">
            <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Review Job Application
                </h1>
                <div className="flex gap-3">
                    {job.status === 'pending' && (
                        <>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={updating}
                                className="px-6 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4 inline mr-2" />
                                Reject
                            </button>
                            <button
                                onClick={handleApproval}
                                disabled={updating}
                                className="px-6 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-xl transition-all font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Approve & Publish
                            </button>
                        </>
                    )}
                    {job.status === 'approved' && <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 text-sm font-medium">✅ Published</span>}
                    {job.status === 'rejected' && <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-sm font-medium">❌ Rejected</span>}
                </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-[#111214] border border-white/5 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">{job.title}</h2>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Building2 className="w-4 h-4" />
                            <span>{job.companyName || 'Company Name'}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-zinc-400">
                            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.jobType || 'Full-time'}</div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Recruiter</p>
                        <p className="font-medium">{job.recruiterEmail || 'N/A'}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                    <div className="prose prose-invert max-w-none text-zinc-300 whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                        {job.description || "No description provided."}
                    </div>
                </div>

                {job.requirements && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <div className="text-zinc-300 whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                            {job.requirements}
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#111214] border border-red-500/20 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <XCircle className="w-6 h-6" />
                                <h3 className="text-lg font-semibold text-white">Reject Job Post</h3>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">Provide a reason why this job is being rejected. This will be sent to the recruiter.</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-all mb-4 resize-none"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 text-sm font-medium">Cancel</button>
                                <button onClick={handleRejection} disabled={updating} className="flex-1 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:opacity-90 text-sm font-medium flex justify-center items-center gap-2 disabled:opacity-50">
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}