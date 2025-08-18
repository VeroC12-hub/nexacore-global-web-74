import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  recipientId?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const MessageModal = ({ isOpen, onClose, projectId, recipientId }: MessageModalProps) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(recipientId || '');
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedRecipient) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userData.user.id,
          recipient_id: selectedRecipient,
          project_id: projectId,
          subject: subject || 'New Message',
          content: content.trim(),
          message_type: projectId ? 'project' : 'general'
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      
      // Reset form
      setSubject('');
      setContent('');
      setSelectedRecipient(recipientId || '');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={sendMessage} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient *</Label>
            <Select 
              value={selectedRecipient} 
              onValueChange={setSelectedRecipient}
              disabled={!!recipientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.email}) - {profile.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
            />
          </div>

          <div>
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px]"
              required
            />
          </div>

          {projectId && (
            <div className="text-sm text-muted-foreground">
              This message will be associated with the current project.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;