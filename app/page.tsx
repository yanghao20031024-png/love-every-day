import { getServerData } from "@/lib/server-data";
import ClientHomeContent from "@/components/ClientHomeContent";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getServerData();

  return <ClientHomeContent initialData={data} />;
}
