import CharitySettings from '../../components/CharitySettings';

export default function UserCharity() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Charity Management</h1>
      <p className="text-slate-400 mb-8">
        Manage how much of your subscription goes to your selected charity, or choose a new one.
      </p>
      
      <CharitySettings />
    </div>
  );
}
