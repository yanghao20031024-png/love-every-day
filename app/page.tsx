import { createClient } from "@/lib/supabase/server";
import { getServerData } from "@/lib/server-data";
import ClientHomeContent from "@/components/ClientHomeContent";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // middleware 应保证 user 存在，但以防万一
  if (!user) {
    return <ClientHomeContent initialData={null} />;
  }

  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return <ClientHomeContent initialData={null} />;
  }

  const data = await getServerData(member.couple_id);
  return <ClientHomeContent initialData={data} />;
}
