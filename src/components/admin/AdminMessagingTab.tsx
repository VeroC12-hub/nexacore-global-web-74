import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Search, Filter, User, Clock, Reply } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProjectMessage {
  id: string;
  message: string;
  message_type: string;
  is_internal: boolean;
  created_at: string;
  sender_id: string;
  project_id: string;
  read_by: any;
  projects?: {
    title: string;
    client_id: string;
  };
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface AdminMessagingTabProps {
  onStatsUpdate: () => void;
}

export function AdminMessagingTab({ onStatsUpdate }: AdminMessagingTabProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ProjectMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  useEffect(() => {
    loadMessages();
    loadProjects();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          projects (title, client_id),
          profiles:sender_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const { error } = await supabase
        .from('project_messages')
        .insert([{
          message: replyText,
          project_id: selectedMessage.project_id,
          message_type: 'response',
          is_internal: false,
          sender_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast.success('Reply sent successfully');
      setReplyText('');
      setIsReplyModalOpen(false);
      setSelectedMessage(null);
      loadMessages();
      onStatsUpdate();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send reply');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('project_messages')
        .update({
          read_by: {
            [user.user?.id || '']: new Date().toISOString()
          }
        })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.projects?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || message.message_type === typeFilter;
    const matchesProject = projectFilter === 'all' || message.project_id === projectFilter;
    
    return matchesSearch && matchesType && matchesProject;
  });

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-500 text-white';
      case 'support': return 'bg-red-500 text-white';
      case 'update': return 'bg-green-500 text-white';
      case 'response': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isUnread = (message: ProjectMessage) => {
    const { data: user } = supabase.auth.getUser();
    return !message.read_by || !message.read_by[user.user?.id || ''];
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl font-bold">Messaging & CRM</CardTitle>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, projects, or senders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="response">Response</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.map((message) => (
              <TableRow 
                key={message.id}
                className={isUnread(message) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {isUnread(message) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {message.is_internal && (
                      <Badge variant="outline">Internal</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{message.projects?.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{message.profiles?.full_name || message.profiles?.email || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getMessageTypeColor(message.message_type)}>
                    {message.message_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate">{message.message}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMessage(message);
                        setIsReplyModalOpen(true);
                        if (isUnread(message)) {
                          markAsRead(message.id);
                        }
                      }}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredMessages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your filters to see more messages'
                : 'Messages will appear here when clients start conversations'
              }
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {messages.filter(m => isUnread(m)).length}
              </div>
              <p className="text-xs text-muted-foreground">Unread Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {new Set(messages.map(m => m.project_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">Active Conversations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {messages.filter(m => m.message_type === 'support').length}
              </div>
              <p className="text-xs text-muted-foreground">Support Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Reply Modal */}
        <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Message</DialogTitle>
              <DialogDescription>
                Project: {selectedMessage?.projects?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Original message from {selectedMessage.profiles?.full_name || 'Unknown'}:
                  </p>
                  <p>{selectedMessage.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply">Your Reply</Label>
                  <Textarea
                    id="reply"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}