import type { Match } from '../types';
import { MatchupScreen } from './MatchupScreen';
import { RoundCompleteScreen } from './RoundCompleteScreen';

export function BracketView({
  round,
  roundNumber,
  currentMatchIndex,
  roundComplete,
  onVote,
  onAdvance,
  onNextRound,
}: {
  round: Match[];
  roundNumber: number;
  currentMatchIndex: number;
  roundComplete: boolean;
  onVote: (matchIndex: number, filmId: string) => void;
  onAdvance: () => void;
  onNextRound: () => void;
}) {
  if (roundComplete) {
    const survivors = round.map((m) => (m.winnerId === m.a.id ? m.a : m.b!));
    return <RoundCompleteScreen roundNumber={roundNumber} survivors={survivors} onContinue={onNextRound} />;
  }

  const match = round[currentMatchIndex];
  return (
    <MatchupScreen
      match={match}
      roundNumber={roundNumber}
      matchIndex={currentMatchIndex}
      totalMatches={round.length}
      onVote={(filmId) => onVote(currentMatchIndex, filmId)}
      onContinue={onAdvance}
    />
  );
}
