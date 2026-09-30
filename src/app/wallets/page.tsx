import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import WalletsClient from './WalletsClient';

export default async function WalletsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', user.id).eq('is_deleted', false).order('id');

  return <WalletsClient initialWallets={wallets || []} userId={user.id} />;
}
