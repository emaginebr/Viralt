import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWinner } from '../../hooks/useWinner';
import type { DrawRequest } from '../../types/winner';

const SELECTION_METHODS: { value: number; label: string }[] = [
  { value: 0, label: 'Random' },
  { value: 1, label: 'Leaderboard' },
  { value: 2, label: 'Manual' },
];

const WinnerSelectionPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { winners, loading, error, loadWinners, drawWinners, notifyWinner, notifyAllWinners, clearError } = useWinner();

  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [selectionMethod, setSelectionMethod] = useState<number>(0);

  const campaignIdNum = Number(campaignId);

  useEffect(() => {
    if (campaignIdNum) {
      loadWinners(campaignIdNum).catch(() => { /* error handled by context */ });
    }
  }, [campaignIdNum, loadWinners]);

  const handleDraw = useCallback(async () => {
    if (!campaignIdNum) return;
    const request: DrawRequest = { winnerCount, selectionMethod };
    try {
      await drawWinners(campaignIdNum, request);
    } catch {
      /* error handled by context */
    }
  }, [campaignIdNum, winnerCount, selectionMethod, drawWinners]);

  const handleNotify = useCallback(async (winnerId: number) => {
    try {
      await notifyWinner(winnerId);
    } catch {
      /* error handled by context */
    }
  }, [notifyWinner]);

  const handleNotifyAll = useCallback(async () => {
    if (!campaignIdNum) return;
    try {
      await notifyAllWinners(campaignIdNum);
    } catch {
      /* error handled by context */
    }
  }, [campaignIdNum, notifyAllWinners]);

  const getMethodLabel = (method: number): string => {
    return SELECTION_METHODS.find((m) => m.value === method)?.label || 'Unknown';
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Winner Selection</h2>
      <p className="text-muted">Campaign ID: {campaignId}</p>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={clearError} aria-label="Close" />
        </div>
      )}

      {/* Draw Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Draw Winners</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="winnerCount" className="form-label">Number of Winners</label>
              <input
                type="number"
                id="winnerCount"
                className="form-control"
                min={1}
                value={winnerCount}
                onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="selectionMethod" className="form-label">Selection Method</label>
              <select
                id="selectionMethod"
                className="form-select"
                value={selectionMethod}
                onChange={(e) => setSelectionMethod(Number(e.target.value))}
              >
                {SELECTION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-primary"
                onClick={handleDraw}
                disabled={loading}
              >
                {loading ? 'Drawing...' : 'Draw Winners'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Winners List */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Selected Winners ({winners.length})</h5>
            {winners.length > 0 && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleNotifyAll}
                disabled={loading}
              >
                Notify All
              </button>
            )}
          </div>

          {winners.length === 0 && !loading && (
            <p className="text-muted">No winners selected yet. Use the form above to draw winners.</p>
          )}

          {loading && winners.length === 0 && (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {winners.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Winner ID</th>
                    <th>Client ID</th>
                    <th>Prize ID</th>
                    <th>Method</th>
                    <th>Selected At</th>
                    <th>Notified</th>
                    <th>Claimed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w) => (
                    <tr key={w.winnerId}>
                      <td>{w.winnerId}</td>
                      <td>{w.clientId}</td>
                      <td>{w.prizeId ?? '-'}</td>
                      <td>{getMethodLabel(w.selectionMethod)}</td>
                      <td>{new Date(w.selectedAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${w.notified ? 'bg-success' : 'bg-secondary'}`}>
                          {w.notified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${w.claimed ? 'bg-success' : 'bg-secondary'}`}>
                          {w.claimed ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        {!w.notified && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleNotify(w.winnerId)}
                            disabled={loading}
                          >
                            Notify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionPage;
