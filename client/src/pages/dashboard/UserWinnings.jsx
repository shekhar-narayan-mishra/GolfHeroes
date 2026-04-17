import MyWinnings from '../../components/MyWinnings';

export default function UserWinnings() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Winnings</h1>
      <p className="text-slate-400 mb-8">
        Upload scorecard proofs and track your payout progress.
      </p>
      
      <MyWinnings />
    </div>
  );
}
