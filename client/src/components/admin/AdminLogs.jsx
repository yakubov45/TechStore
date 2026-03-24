import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Activity, Search, RefreshCw, User as UserIcon } from 'lucide-react';

export default function AdminLogs() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('all');

    const fetchLogs = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 20 };
            if (actionFilter && actionFilter !== 'all') {
                params.action = actionFilter;
            }

            const res = await api.get('/activities', { params });
            if (res.data.success) {
                setLogs(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
                setPage(res.data.pagination.page);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
            toast.error(t('admin.logs.fetchError', 'Failed to load activity logs'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, [actionFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="text-primary" />
                    {t('admin.logs.title', 'Activity Logs')}
                </h2>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-dark-card text-sm px-3 py-2 rounded border border-gray-700 focus:border-primary transition"
                    >
                        <option value="all">{t('admin.logs.allActions', 'All Actions')}</option>
                        <option value="CREATE">{t('admin.logs.create', 'CREATE')}</option>
                        <option value="UPDATE">{t('admin.logs.update', 'UPDATE')}</option>
                        <option value="DELETE">{t('admin.logs.delete', 'DELETE')}</option>
                        <option value="LOGIN">{t('admin.logs.login', 'LOGIN')}</option>
                        <option value="REGISTER">{t('admin.logs.register', 'REGISTER')}</option>
                        <option value="OTHER">{t('admin.logs.other', 'OTHER')}</option>
                    </select>

                    <button
                        onClick={() => fetchLogs()}
                        className="btn-secondary p-2 flex items-center justify-center rounded"
                        title={t('admin.refresh', 'Refresh')}
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="card overflow-x-auto border-t-4 border-primary">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-text-secondary">
                        <Activity size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('admin.logs.noLogs', 'No activity logs found')}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-text-secondary border-b border-gray-800 uppercase text-xs tracking-wider bg-dark-secondary/50">
                                <th className="p-4">{t('admin.logs.date', 'Date')}</th>
                                <th className="p-4">{t('admin.logs.user', 'User')}</th>
                                <th className="p-4">{t('admin.logs.action', 'Action')}</th>
                                <th className="p-4">{t('admin.logs.target', 'Target')}</th>
                                <th className="p-4 w-1/3">{t('admin.logs.details', 'Details')}</th>
                                <th className="p-4">{t('admin.logs.ip', 'IP Address')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-dark-secondary/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-text-secondary">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {log.user?.avatar ? (
                                                <img src={log.user.avatar} alt={log.user.name} className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                                    <UserIcon size={12} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-text-primary leading-tight">{log.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-text-secondary">{log.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold tracking-wider
                                            ${log.action === 'CREATE' ? 'bg-green-500/20 text-green-500' :
                                                log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-500' :
                                                    log.action === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                                                        log.action === 'LOGIN' ? 'bg-purple-500/20 text-purple-500' :
                                                            'bg-gray-500/20 text-gray-400'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {log.targetModel && (
                                            <span className="font-mono text-xs bg-dark-secondary px-2 py-1 rounded">
                                                {log.targetModel}
                                            </span>
                                        )}
                                        {log.targetId && (
                                            <p className="text-[10px] text-text-secondary mt-1 font-mono truncate max-w-[120px]" title={log.targetId}>
                                                {log.targetId}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs font-mono text-text-secondary break-all">
                                        {log.details ? JSON.stringify(log.details) : '-'}
                                    </td>
                                    <td className="p-4 text-xs text-text-secondary">
                                        {log.ipAddress || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-dark-secondary/20">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchLogs(page - 1)}
                            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                        >
                            {t('common.prev', 'Previous')}
                        </button>
                        <span className="text-sm text-text-secondary">
                            {page} / {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchLogs(page + 1)}
                            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                        >
                            {t('common.next', 'Next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
