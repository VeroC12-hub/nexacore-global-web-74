import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Users, 
  AlertCircle,
  Mail,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Array<{ id: string; title: string; client_id: string }>;
  clients?: Array<{ id: string; full_name: string; email: string }>;
}

export function ComposeMessageModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projects, 
  clients = [] 
}: ComposeMessageModalProps) {
  const [messageTarget, setMessageTarget] = useState<'project' | 'client'>('project');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedClientData = clients.find(c => c.id === selectedClient);

  const handleSend = async () => {
    // Validation based on message target
    if (messageTarget === 'project' && !selectedProject) {
      toast.error('Please select a project');
      return;
    }
    
    if (messageTarget === 'client' && !selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!subject.trim() && messageType !== 'general') {
      toast.error('Please enter a subject for this message type');
      return;
    }

    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send messages');
      }

      // Insert the message
      const messageData = {
        message: message.trim(),
        project_id: messageTarget === 'project' ? selectedProject : null,
        sender_id: user.id,
        message_type: messageType,
        is_internal: isInternal,
        priority: priority,
        subject: subject.trim() || null,
        recipient_id: messageTarget === 'client' ? selectedClient : null,
        metadata: {
          sent_by_admin: true,
          email_notification_sent: sendEmailNotification,
          created_via: 'admin_dashboard',
          message_target: messageTarget,
          target_client_name: messageTarget === 'client' ? selectedClientData?.full_name : null,
          target_project_name: messageTarget === 'project' ? selectedProjectData?.title : null
        }
      };

      const { error: messageError } = await supabase
        .from('project_messages')
        .insert([messageData]);

      if (messageError) throw messageError;

      // Handle email notifications and notifications based on target type
      const targetClientId = messageTarget === 'client' ? selectedClient : selectedProjectData?.client_id;
      const targetClientEmail = messageTarget === 'client' ? selectedClientData?.email : null;

      // If email notification is enabled and message is not internal
      if (sendEmailNotification && !isInternal && targetClientId) {
        // In a real implementation, you might call an edge function or API route
        // to send the email notification to the client
        console.log(`Email notification would be sent to client: ${targetClientEmail || 'project client'}`);
      }

      // Create a notification record for the target client (if not internal)
      if (!isInternal && targetClientId) {
        try {
          const notificationTitle = messageTarget === 'client' 
            ? (subject || `Direct message from ${user.email}`)
            : (subject || `New message about ${selectedProjectData?.title}`);
          
          await supabase
            .from('notifications')
            .insert([{
              user_id: targetClientId,
              title: notificationTitle,
              message: message.length > 100 ? message.substring(0, 100) + '...' : message,
              type: 'message',
              related_id: messageTarget === 'project' ? selectedProject : selectedClient,
              priority: priority
            }]);
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // Don't fail the main operation for notification errors
        }
      }

      toast.success('Message sent successfully!');
      onSuccess();
      handleClose();
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setMessageTarget('project');
    setSelectedProject('');
    setSelectedClient('');
    setMessageType('general');
    setSubject('');
    setMessage('');
    setIsInternal(false);
    setPriority('normal');
    setSendEmailNotification(true);
    onClose();
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-500 text-white';
      case 'support': return 'bg-red-500 text-white';
      case 'update': return 'bg-green-500 text-white';
      case 'announcement': return 'bg-purple-500 text-white';
      case 'feedback': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'urgent': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getMessageTypeDescription = (type: string) => {
    switch (type) {
      case 'general': return 'General communication or updates';
      case 'support': return 'Support request or technical assistance';
      case 'update': return 'Project status update or milestone notification';
      case 'announcement': return 'Important announcement or company news';
      case 'feedback': return 'Request feedback or review from client';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Compose Message
          </DialogTitle>
          <DialogDescription>
            Send a message to a project client or create an internal note for your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Target Selection */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Message Recipient
            </h4>
            
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="project-target"
                  name="messageTarget"
                  value="project"
                  checked={messageTarget === 'project'}
                  onChange={(e) => setMessageTarget(e.target.value as 'project' | 'client')}
                  className="text-primary"
                />
                <Label htmlFor="project-target">Send to Project Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="client-target"
                  name="messageTarget"
                  value="client"
                  checked={messageTarget === 'client'}
                  onChange={(e) => setMessageTarget(e.target.value as 'project' | 'client')}
                  className="text-primary"
                />
                <Label htmlFor="client-target">Send Direct Message to Client</Label>
              </div>
            </div>
          </div>

          {/* Project Selection - shown when project target is selected */}
          {messageTarget === 'project' && (
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project to send message about" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProjectData && (
                <p className="text-sm text-muted-foreground">
                  Message will be sent to the client of "{selectedProjectData.title}"
                </p>
              )}
            </div>
          )}

          {/* Client Selection - shown when direct client target is selected */}
          {messageTarget === 'client' && (
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client to send direct message to" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClientData && (
                <p className="text-sm text-muted-foreground">
                  Direct message to {selectedClientData.full_name} ({selectedClientData.email})
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Message Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Message Type *</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="update">Project Update</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="feedback">Feedback Request</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getMessageTypeDescription(messageType)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message Visibility and Notifications */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Message Settings
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isInternal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <Label htmlFor="internal">Internal Message</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isInternal 
                    ? 'Only visible to team members and admins' 
                    : 'Visible to client and project team'
                  }
                </p>
              </div>
              <Switch
                id="internal"
                checked={isInternal}
                onCheckedChange={setIsInternal}
              />
            </div>

            {!isInternal && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <Label htmlFor="email-notification">Send Email Notification</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send an email to the client about this message
                  </p>
                </div>
                <Switch
                  id="email-notification"
                  checked={sendEmailNotification}
                  onCheckedChange={setSendEmailNotification}
                />
              </div>
            )}
          </div>

          {/* Subject Line */}
          {messageType !== 'general' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{message.length} characters</span>
              {message.length > 500 && (
                <span className="text-orange-500">Long message - consider breaking it up</span>
              )}
            </div>
          </div>

          {/* Preview */}
          {((messageTarget === 'project' && selectedProject) || (messageTarget === 'client' && selectedClient)) && message.trim() && (
            <div className="space-y-2">
              <Label>Message Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getMessageTypeColor(messageType)}>
                      {messageType}
                    </Badge>
                    <Badge className={getPriorityColor(priority)}>
                      {priority} priority
                    </Badge>
                    {isInternal && (
                      <Badge variant="outline">Internal</Badge>
                    )}
                    <Badge variant="secondary">
                      {messageTarget === 'project' ? 'Project Message' : 'Direct Message'}
                    </Badge>
                  </div>
                </div>
                
                {subject && (
                  <h4 className="font-medium mb-2">{subject}</h4>
                )}
                
                <p className="text-sm whitespace-pre-wrap">{message}</p>
                
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  {messageTarget === 'project' && selectedProjectData && (
                    <>Project: {selectedProjectData.title}</>
                  )}
                  {messageTarget === 'client' && selectedClientData && (
                    <>To: {selectedClientData.full_name} ({selectedClientData.email})</>
                  )}
                  {' • '}
                  {isInternal ? 'Team only' : 'Client visible'}
                  {' • '}
                  {sendEmailNotification && !isInternal ? 'Email notification enabled' : 'No email notification'}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!selectedProject || !message.trim() || sending}
          >
            {sending ? (
              <>
                <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}