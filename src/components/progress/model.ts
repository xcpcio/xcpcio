import { getNowTimeStamp, getTimeDiff } from '@/utils';

// 定时器执行间隔
export const timerInterval = 500;

export const progress_status = [
    'am-progress-bar-primary',
    'am-progress-bar-success',
    'am-progress-bar-danger',
    'am-progress-bar-secondary',
];

export const progress_active = ['am-active', 'am-active', 'am-active', ''];

export const status_type = ['PENDING', 'RUNNING', 'FROZEND', 'FINISHED'];

export function getStatus(
    start_time: number,
    end_time: number,
    frozen_time: number,
) {
    const now = getNowTimeStamp();
    if (now < start_time) return 0;
    if (now >= end_time) return 3;
    if (now >= end_time - frozen_time) return 2;
    return 1;
}

export function getWidth(start_time: number, end_time: number) {
    const now = getNowTimeStamp();
    if (now < start_time || now >= end_time) return 100;
    return Math.round(((now - start_time) / (end_time - start_time)) * 100);
}

export function getTimeElapsed(start_time: number, end_time: number) {
    return getTimeDiff(
        Math.max(0, Math.min(getNowTimeStamp(), end_time) - start_time),
    );
}

export function getTimeRemaining(start_time: number, end_time: number) {
    return getTimeDiff(
        Math.max(0, end_time - Math.max(start_time, getNowTimeStamp())),
    );
}

export function getTimePending(start_time: number) {
    return getTimeDiff(Math.max(0, start_time - getNowTimeStamp()));
}
