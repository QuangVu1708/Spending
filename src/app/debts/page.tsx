import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DebtsClient from './DebtsClient';

export default async function DebtsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false);

  return <DebtsClient initialDebts={debts || []} wallets={wallets || []} userId={user.id} />;
}
