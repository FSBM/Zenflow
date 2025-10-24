import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { invites as apiInvites } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/components/LoadingProvider';

export default function Inbox() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    showLoading();
    try {
      const res = await apiInvites.list();
      setInvites((res as any).invites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id: string, action: 'accept' | 'decline') => {
    try {
      showLoading();
      await apiInvites.respond(id, action);
      // remove from list
      setInvites(prev => prev.filter(i => i._id !== id && i.id !== id));
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to respond to invite', variant: 'destructive' });
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Inbox</h1>
        {loading && <div>Loading...</div>}
        {!loading && invites.length === 0 && <div className="text-muted-foreground">No invites</div>}
        <div className="space-y-4">
          {invites.map(inv => (
            <div key={inv._id || inv.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{inv.project?.title || 'Project'}</div>
                  <div className="text-sm text-muted-foreground">From: {inv.from?.email || inv.from?.name}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => respond(inv._id || inv.id, 'accept')}>Accept</Button>
                  <Button variant="ghost" onClick={() => respond(inv._id || inv.id, 'decline')}>Decline</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
