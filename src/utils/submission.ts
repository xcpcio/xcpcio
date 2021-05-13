import { RunStatus } from '@/interface/submission';

export function isAccepted(status: RunStatus): boolean {
  if (status === 'Accepted' || status === 'Correct' || status === 'correct') {
    return true;
  }
  return false;
}

export function isWrongAnswer(status: RunStatus): boolean {
  if (
    status === 'WrongAnswer' ||
    status === 'Reject' ||
    status === 'InCorrect' ||
    status === 'incorrect'
  ) {
    return true;
  }
  return false;
}

export function isPending(status: RunStatus): boolean {
  if (status === 'Pending' || status === 'pending' || status === 'Frozen') {
    return true;
  }
  return false;
}
