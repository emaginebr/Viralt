import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return <div className="text-center text-muted">Campaign has ended</div>;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="d-flex justify-content-center gap-3 text-center">
      <div>
        <div className="fs-3 fw-bold">{timeLeft.days}</div>
        <small className="text-muted">Days</small>
      </div>
      <div className="fs-3 fw-bold">:</div>
      <div>
        <div className="fs-3 fw-bold">{pad(timeLeft.hours)}</div>
        <small className="text-muted">Hours</small>
      </div>
      <div className="fs-3 fw-bold">:</div>
      <div>
        <div className="fs-3 fw-bold">{pad(timeLeft.minutes)}</div>
        <small className="text-muted">Minutes</small>
      </div>
      <div className="fs-3 fw-bold">:</div>
      <div>
        <div className="fs-3 fw-bold">{pad(timeLeft.seconds)}</div>
        <small className="text-muted">Seconds</small>
      </div>
    </div>
  );
}
