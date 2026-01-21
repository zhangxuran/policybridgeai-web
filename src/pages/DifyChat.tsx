import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Send, Upload, Loader2, MessageSquare, Trash2, ArrowLeft, User, Scale, X, FileText, Download, ExternalLink, Radar, Copy, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { stripMarkdown } from '@/lib/markdownUtils';
import { useTranslation, TFunction } from 'react-i18next';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isThinking?: boolean;
  attachedFile?: {
    name: string;
    type: 'pdf' | 'word' | 'txt';
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  dify_conversation_id?: string;
  session_type?: 'radar' | 'normal';
}

interface DifyChatRequestBody {
  query: string;
  user_id: string;
  conversation_id?: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    upload_file_id: string;
  }>;
}

interface UploadedFile {
  id: string;
  name: string;
}

interface FundingOption {
  id: string;
  label: string;
  checked: boolean;
  amount: string;
}

// API configuration for 金税四期
const RADAR_API_CONFIG = {
  baseUrl: 'https://dify.policybridgeai.com/v1',
  freeApiKey: 'app-eWwd99fqtvRwRyA3OZumjZ2i',
  paidApiKey: 'app-TIXqfUd5q44bkkComdoIRG6B'
};

// Helper function to get file type from filename
const getFileType = (filename: string): 'pdf' | 'word' | 'txt' => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'doc' || extension === 'docx') return 'word';
  return 'txt';
};

// File icon component
const FileIcon = ({ type }: { type: 'pdf' | 'word' | 'txt' }) => {
  const getIconStyle = () => {
    switch (type) {
      case 'pdf':
        return 'text-red-500';
      case 'word':
        return 'text-blue-500';
      case 'txt':
        return 'text-gray-500';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'word':
        return 'Word';
      case 'txt':
        return 'TXT';
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <FileText className={`h-4 w-4 ${getIconStyle()}`} />
      <span className="text-xs font-medium text-white/90">{getLabel()}</span>
    </div>
  );
};

// Helper function to parse text with <strong> tags and render as React elements
const parseBoldText = (text: string, isUserMessage: boolean): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const strongRegex = /<strong>(.*?)<\/strong>/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = strongRegex.exec(text)) !== null) {
    // Add text before the <strong> tag
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the bold text
    parts.push(
      <strong key={`bold-${key++}`} className="font-bold">
        {match[1]}
      </strong>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

// Parse message content and convert links to clickable elements
const parseMessageContent = (content: string, isUserMessage: boolean = false, t: TFunction): React.ReactNode[] => {
  const processedContent = isUserMessage ? content : stripMarkdown(content);
  
  const elements: React.ReactNode[] = [];
  
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const processedRanges: Array<{start: number, end: number}> = [];
  
  let match;
  const markdownMatches: Array<{start: number, end: number, text: string, url: string}> = [];
  
  while ((match = markdownLinkRegex.exec(processedContent)) !== null) {
    markdownMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
      url: match[2]
    });
  }
  
  let lastIndex = 0;
  
  for (const mdMatch of markdownMatches) {
    if (mdMatch.start > lastIndex) {
      const textBefore = processedContent.substring(lastIndex, mdMatch.start);
      elements.push(...parseBoldText(textBefore, isUserMessage));
    }
    
    const isFileLink = /\.(pdf|doc|docx)(\?|$)/i.test(mdMatch.url);
    
    if (isFileLink) {
      elements.push(
        <a
          key={`md-${mdMatch.start}`}
          href={mdMatch.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isUserMessage 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          } transition-colors duration-200 my-1`}
        >
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">{mdMatch.text}</span>
        </a>
      );
    } else {
      elements.push(
        <a
          key={`md-${mdMatch.start}`}
          href={mdMatch.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 underline ${
            isUserMessage 
              ? 'text-white hover:text-blue-100' 
              : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          {mdMatch.text}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    
    processedRanges.push({ start: mdMatch.start, end: mdMatch.end });
    lastIndex = mdMatch.end;
  }
  
  const remainingText = processedContent.substring(lastIndex);
  
  if (remainingText) {
    let urlLastIndex = 0;
    const urlMatches: Array<{start: number, end: number, url: string}> = [];
    
    while ((match = urlRegex.exec(remainingText)) !== null) {
      const absoluteStart = lastIndex + match.index;
      const absoluteEnd = absoluteStart + match[0].length;
      
      const isInProcessedRange = processedRanges.some(
        range => absoluteStart >= range.start && absoluteEnd <= range.end
      );
      
      if (!isInProcessedRange) {
        urlMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          url: match[0]
        });
      }
    }
    
    for (const urlMatch of urlMatches) {
      if (urlMatch.start > urlLastIndex) {
        const textBeforeUrl = remainingText.substring(urlLastIndex, urlMatch.start);
        elements.push(...parseBoldText(textBeforeUrl, isUserMessage));
      }
      
      const isFileLink = /\.(pdf|doc|docx)(\?|$)/i.test(urlMatch.url);
      
      if (isFileLink) {
        elements.push(
          <a
            key={`url-${lastIndex + urlMatch.start}`}
            href={urlMatch.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isUserMessage 
                ? 'bg-white/20 hover:bg-white/30 text-white' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            } transition-colors duration-200 my-1`}
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium break-all">{t('difyChat.fileUpload.downloadFile')}</span>
          </a>
        );
      } else {
        elements.push(
          <a
            key={`url-${lastIndex + urlMatch.start}`}
            href={urlMatch.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 underline break-all ${
              isUserMessage 
                ? 'text-white hover:text-blue-100' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {urlMatch.url}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        );
      }
      
      urlLastIndex = urlMatch.end;
    }
    
    if (urlLastIndex < remainingText.length) {
      const finalText = remainingText.substring(urlLastIndex);
      elements.push(...parseBoldText(finalText, isUserMessage));
    }
  }
  
  return elements.length > 0 ? elements : parseBoldText(processedContent, isUserMessage);
};

export default function DifyChat() {
  const { user, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentDifyConversationId, setCurrentDifyConversationId] = useState<string | null>(null);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [showRadarInterface, setShowRadarInterface] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState<string>('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [isRadarSession, setIsRadarSession] = useState(false);
  
  const [fundingOptions, setFundingOptions] = useState<FundingOption[]>([
    { id: 'A', label: t('difyChat.radarInterface.fundingOptions.A'), checked: false, amount: '' },
    { id: 'B', label: t('difyChat.radarInterface.fundingOptions.B'), checked: false, amount: '' },
    { id: 'C', label: t('difyChat.radarInterface.fundingOptions.C'), checked: false, amount: '' },
    { id: 'D', label: t('difyChat.radarInterface.fundingOptions.D'), checked: false, amount: '' },
    { id: 'E', label: t('difyChat.radarInterface.fundingOptions.E'), checked: false, amount: '' },
    { id: 'F', label: t('difyChat.radarInterface.fundingOptions.F'), checked: false, amount: '' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Thinking process messages
  const THINKING_MESSAGES = [
    t('difyChat.thinking.understanding'),
    t('difyChat.thinking.callingKnowledge'),
    t('difyChat.thinking.analyzingRegulations'),
    t('difyChat.thinking.generating'),
    t('difyChat.thinking.almostDone')
  ];

  const IDENTITY_CONFIRMATION_MESSAGE = t('difyChat.thinking.identityConfirmation');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversationsAndAutoLoad();
    // Refresh subscription info when component mounts
    refreshSubscription();
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      const plainText = stripMarkdown(content);
      await navigator.clipboard.writeText(plainText);
      setCopiedMessageIndex(index);
      toast.success(t('difyChat.messages.copiedSuccess') || '已复制到剪贴板');
      
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast.error(t('difyChat.messages.copyFailed') || '复制失败');
    }
  };

  const startThinkingAnimation = (isFirst: boolean) => {
    setThinkingMessageIndex(0);
    setIsFirstMessage(isFirst);
    
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
    }

    if (isFirst) {
      return;
    }

    thinkingIntervalRef.current = setInterval(() => {
      setThinkingMessageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= THINKING_MESSAGES.length - 1) {
          if (thinkingIntervalRef.current) {
            clearInterval(thinkingIntervalRef.current);
            thinkingIntervalRef.current = null;
          }
          return THINKING_MESSAGES.length - 1;
        }
        return nextIndex;
      });
    }, 5000);
  };

  const stopThinkingAnimation = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingMessageIndex(0);
    setIsFirstMessage(false);
  };

  const loadConversationsAndAutoLoad = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const loadedConversations = data || [];
      setConversations(loadedConversations);

      if (isInitialLoad && loadedConversations.length > 0) {
        const mostRecentConversation = loadedConversations[0];
        await loadConversation(mostRecentConversation.id);
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createNewConversation = async (difyConversationId: string | null = null, sessionType: 'radar' | 'normal' = 'normal') => {
    if (!user) return null;

    try {
      const identityMap: Record<string, string> = {
        [t('difyChat.welcome.identities.seller')]: t('difyChat.conversationTitles.seller'),
        [t('difyChat.welcome.identities.buyer')]: t('difyChat.conversationTitles.buyer'),
        [t('difyChat.welcome.identities.intermediary')]: t('difyChat.conversationTitles.intermediary'),
        [t('difyChat.welcome.identities.logistics')]: t('difyChat.conversationTitles.logistics'),
        [t('difyChat.welcome.identities.brand')]: t('difyChat.conversationTitles.brand'),
        [t('difyChat.welcome.identities.warehouse')]: t('difyChat.conversationTitles.warehouse'),
        [t('difyChat.welcome.identities.finance')]: t('difyChat.conversationTitles.finance')
      };

      const identityLabel = sessionType === 'radar' 
        ? t('difyChat.conversationTitles.radar')
        : (identityMap[selectedIdentity] || t('difyChat.conversationTitles.default'));
      
      const dateStr = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const title = `${identityLabel} - ${dateStr}`;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: title,
          dify_conversation_id: difyConversationId,
          session_type: sessionType,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Created new conversation:', data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversationDifyId = async (conversationId: string, difyConversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ dify_conversation_id: difyConversationId })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation dify_id:', error);
    }
  };

  const saveMessageToDatabase = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: role,
          content: content,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  /**
   * Check user subscription by directly querying the profiles table
   * This ensures we always get the latest subscription status from the database
   */
  const checkUserSubscription = async (): Promise<boolean> => {
    if (!user) {
      console.log('❌ No user found');
      return false;
    }

    try {
      console.log('='.repeat(60));
      console.log('🔍 CHECKING USER SUBSCRIPTION STATUS');
      console.log('='.repeat(60));
      console.log('👤 User ID:', user.id);
      console.log('📧 User Email:', user.email);

      // Query the profiles table directly to get the latest subscription info
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error querying profiles table:', error);
        console.log('⚠️ Profile not found in database - defaulting to FREE plan');
        return false;
      }

      if (!data) {
        console.log('⚠️ No profile data found - defaulting to FREE plan');
        return false;
      }

      console.log('📊 Profile Data Retrieved:');
      console.log('   - Email:', data.email);
      console.log('   - Subscription Plan:', data.subscription_plan);
      console.log('   - Subscription Status:', data.subscription_status);

      const isPaid = data.subscription_plan !== 'free' && data.subscription_status === 'active';
      
      console.log('='.repeat(60));
      console.log(`✅ SUBSCRIPTION CHECK RESULT: ${isPaid ? '💎 PAID USER' : '🆓 FREE USER'}`);
      console.log('='.repeat(60));
      console.log(`📌 Plan: ${data.subscription_plan}`);
      console.log(`📌 Status: ${data.subscription_status}`);
      console.log(`📌 API to use: ${isPaid ? 'PAID API (app-TIXqfUd5q44bkkComdoIRG6B)' : 'FREE API (app-eWwd99fqtvRwRyA3OZumjZ2i)'}`);
      console.log('='.repeat(60));
      
      return isPaid;
    } catch (error) {
      console.error('❌ Exception in checkUserSubscription:', error);
      return false;
    }
  };

  const callRadarAPI = async (query: string, isPaid: boolean) => {
    const apiKey = isPaid ? RADAR_API_CONFIG.paidApiKey : RADAR_API_CONFIG.freeApiKey;
    
    console.log('='.repeat(60));
    console.log(`🚀 CALLING ${isPaid ? '💎 PAID' : '🆓 FREE'} RADAR API`);
    console.log('='.repeat(60));
    console.log(`📍 API Endpoint: ${RADAR_API_CONFIG.baseUrl}/chat-messages`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
    console.log(`💬 Query: ${query.substring(0, 50)}...`);
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${RADAR_API_CONFIG.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: query,
          response_mode: 'streaming',
          conversation_id: '',
          user: user!.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }

      console.log('✅ API call successful, receiving stream...');
      return response.body;
    } catch (error) {
      console.error('❌ Error calling Radar API:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText: string, uploadedFileId?: string, uploadedFileName?: string) => {
    console.log('🚀 handleSendMessage called');
    console.log('📦 Session type check:', { isRadarSession, currentConversationId });
    console.log('📎 File info:', { uploadedFileId, uploadedFileName });
    
    // 检查是否有消息文本或上传的文件
    const hasMessageText = messageText.trim();
    const hasUploadedFile = uploadedFileId && uploadedFileName;
    
    if ((!hasMessageText && !hasUploadedFile) || loading) {
      console.log('⚠️ No message text or file to send');
      return;
    }
    
    // 如果只有文件没有文字，使用根据语言的默认消息（不会显示给用户）
    const displayText = hasMessageText ? messageText : '';
    
    // 根据用户语言生成默认消息
    const getDefaultMessage = (language: string): string => {
      const defaultMessages: Record<string, string> = {
        'zh': '请分析这份文档',
        'en': 'Please analyze this document',
        'fr': 'Veuillez analyser ce document',
        'de': 'Bitte analysieren Sie dieses Dokument',
        'es': 'Por favor analiza este documento',
        'it': 'Si prega di analizzare questo documento',
      };
      return defaultMessages[language] || defaultMessages['en'];
    };
    
    const queryText = hasMessageText ? messageText : getDefaultMessage(i18n.language);
    
    console.log('📝 Display text:', displayText);
    console.log('📝 Query text for Dify:', queryText);
    console.log('📝 User language:', i18n.language);

    if (isRadarSession) {
      console.log('🎯 Detected Radar Session - Routing to Radar API');
      return handleRadarMessage(messageText);
    }

    // 只有当用户输入了文字时，才在消息中显示内容
    const userMessage: Message = {
      role: 'user',
      content: displayText,
      timestamp: new Date(),
      ...(uploadedFileId && uploadedFileName ? {
        attachedFile: {
          name: uploadedFileName,
          type: getFileType(uploadedFileName)
        }
      } : {})
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let conversationIdForSaving = currentConversationId;
    let streamedContent = '';
    let streamedConversationId = '';

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const isFirst = userMessageCount === 0;

    // 🔥 FIX: Create conversation BEFORE sending the first message
    if (!conversationIdForSaving && isFirst) {
      console.log('🆕 Creating new conversation BEFORE first message');
      const newConversationId = await createNewConversation(null, 'normal');
      if (newConversationId) {
        conversationIdForSaving = newConversationId;
        setCurrentConversationId(newConversationId);
        await loadConversations();
        console.log('✅ Set currentConversationId:', newConversationId);
      }
    }

    const thinkingMessage: Message = {
      role: 'assistant',
      content: isFirst ? IDENTITY_CONFIRMATION_MESSAGE : THINKING_MESSAGES[0],
      timestamp: new Date(),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    startThinkingAnimation(isFirst);

    try {
      // 发送给Dify的请求使用queryText（可能是默认消息）
      const requestBody: DifyChatRequestBody = {
        query: queryText,
        user_id: user!.id
      };

      if (currentDifyConversationId) {
        requestBody.conversation_id = currentDifyConversationId;
      }

      if (uploadedFileId) {
        requestBody.files = [{
          type: "document",
          transfer_method: "local_file",
          upload_file_id: uploadedFileId
        }];
      }

      const session = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/dify_chat_v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.data?.session?.access_token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Edge Function 调用失败: ${response.status}`);
      }

      const data = response.body;

      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        
        let isFirstChunk = true;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6);
                  if (jsonStr.trim() === '') continue;
                  
                  const eventData = JSON.parse(jsonStr);
                  
                  if (eventData.event === 'message') {
                    const newContent = eventData.answer || '';
                    
                    if (isFirstChunk) {
                      stopThinkingAnimation();
                      
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage.role === 'assistant') {
                          lastMessage.isThinking = false;
                          lastMessage.isStreaming = true;
                          lastMessage.content = '';
                        }
                        return newMessages;
                      });
                      
                      isFirstChunk = false;
                    }
                    
                    streamedContent += newContent;
                    
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage.role === 'assistant') {
                        lastMessage.content = streamedContent;
                      }
                      return newMessages;
                    });
                  } else if (eventData.event === 'message_end') {
                    streamedConversationId = eventData.conversation_id || '';
                  }
                } catch (parseError) {
                  console.error('❌ Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
      }

      // Update dify_conversation_id if we got one
      if (conversationIdForSaving && streamedConversationId && !currentDifyConversationId) {
        await updateConversationDifyId(conversationIdForSaving, streamedConversationId);
        setCurrentDifyConversationId(streamedConversationId);
        console.log('✅ Updated dify_conversation_id:', streamedConversationId);
      }

      if (conversationIdForSaving && streamedContent) {
        await saveMessageToDatabase(conversationIdForSaving, 'user', messageText);
        await saveMessageToDatabase(conversationIdForSaving, 'assistant', streamedContent);
        console.log('✅ Saved messages to database');
      }

      toast.success(t('difyChat.messages.sendSuccess'));
    } catch (error: unknown) {
      console.error('❌ Error sending message:', error);
      
      stopThinkingAnimation();
      
      setMessages((prev) => prev.slice(0, -2));
      
      if (error instanceof Error) {
        toast.error(error.message || t('difyChat.messages.sendFailed'));
      } else {
        toast.error(t('difyChat.messages.sendFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRadarMessage = async (messageText: string) => {
    console.log('🎯 handleRadarMessage called - Using Radar API');
    
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let conversationIdForSaving = currentConversationId;
    let streamedContent = '';

    const thinkingMessage: Message = {
      role: 'assistant',
      content: '正在分析您的问题...',
      timestamp: new Date(),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const isPaidUser = await checkUserSubscription();
      
      toast.info(isPaidUser ? t('difyChat.messages.usingPaidAPI') : t('difyChat.messages.usingFreeAPI'));

      if (!conversationIdForSaving) {
        const dateStr = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user!.id,
            title: `${t('difyChat.conversationTitles.radar')} - ${dateStr}`,
            dify_conversation_id: null,
            session_type: 'radar'
          })
          .select()
          .single();

        if (!error && data) {
          conversationIdForSaving = data.id;
          setCurrentConversationId(data.id);
          await loadConversations();
        }
      }

      if (conversationIdForSaving) {
        await saveMessageToDatabase(conversationIdForSaving, 'user', messageText);
      }

      const stream = await callRadarAPI(messageText, isPaidUser);

      if (!stream) {
        throw new Error('未收到API响应');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === '') continue;
                
                const eventData = JSON.parse(jsonStr);
                
                if (eventData.event === 'message') {
                  const newContent = eventData.answer || '';
                  
                  if (isFirstChunk) {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage.role === 'assistant') {
                        lastMessage.isThinking = false;
                        lastMessage.isStreaming = true;
                        lastMessage.content = '';
                      }
                      return newMessages;
                    });
                    isFirstChunk = false;
                  }
                  
                  streamedContent += newContent;
                  
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content = streamedContent;
                    }
                    return newMessages;
                  });
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

      if (conversationIdForSaving && streamedContent) {
        await saveMessageToDatabase(conversationIdForSaving, 'assistant', streamedContent);
      }

      toast.success(t('difyChat.messages.sendSuccess'));
    } catch (error: unknown) {
      console.error('Error in Radar message:', error);
      
      setMessages((prev) => prev.slice(0, -1));
      
      if (error instanceof Error) {
        toast.error(error.message || t('difyChat.messages.sendFailed'));
      } else {
        toast.error(t('difyChat.messages.sendFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    // 检查是否有文字输入或上传的文件
    const hasInput = input.trim();
    const hasFile = uploadedFile?.id && uploadedFile?.name;
    
    if ((!hasInput && !hasFile) || loading) {
      return;
    }
    
    const fileIdToSend = uploadedFile?.id;
    const fileNameToSend = uploadedFile?.name;
    
    // 如果没有文字输入，传入空字符串给handleSendMessage
    await handleSendMessage(hasInput ? input : '', fileIdToSend, fileNameToSend);
    
    setUploadedFile(null);
  };

  const handleIdentitySelect = async (identity: string) => {
    setSelectedIdentity(identity);
    setIsRadarSession(false);
    await handleSendMessage(identity);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!user) {
      toast.error(t('common.pleaseLogin'));
      return;
    }

    try {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(t('difyChat.fileUpload.invalidFormat'));
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t('difyChat.fileUpload.fileTooLarge'));
        return;
      }

      setUploadingFile(true);
      toast.info(t('difyChat.fileUpload.uploading'));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', user.id);

      const { data, error } = await supabase.functions.invoke('dify-upload-file', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || t('difyChat.fileUpload.uploadFailed'));
      }

      if (!data || !data.id) {
        throw new Error(t('difyChat.fileUpload.uploadFailed'));
      }

      toast.success(t('difyChat.fileUpload.uploadSuccess'));
      const uploadedFileInfo = {
        id: data.id,
        name: file.name
      };
      setUploadedFile(uploadedFileInfo);

    } catch (error: unknown) {
      console.error('❌ Error uploading file:', error);
      if (error instanceof Error) {
        toast.error(error.message || t('difyChat.fileUpload.uploadFailed'));
      } else {
        toast.error(t('difyChat.fileUpload.uploadFailed'));
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    toast.info(t('difyChat.fileUpload.fileRemoved'));
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('dify_conversation_id, session_type')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
      setCurrentDifyConversationId(convData?.dify_conversation_id || null);
      
      setIsRadarSession(convData?.session_type === 'radar');
      
      setShowRadarInterface(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error(t('difyChat.messages.loadFailed'));
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
        setCurrentDifyConversationId(null);
        setIsRadarSession(false);
      }

      await loadConversations();
      setShowDeleteDialog(false);
      setConversationToDelete(null);
      toast.success(t('difyChat.messages.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error(t('difyChat.messages.deleteFailed'));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedConversations(new Set(conversations.map((c) => c.id)));
    } else {
      setSelectedConversations(new Set());
    }
  };

  const handleSelectConversation = (conversationId: string, checked: boolean) => {
    const newSelected = new Set(selectedConversations);
    if (checked) {
      newSelected.add(conversationId);
    } else {
      newSelected.delete(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedConversations.size === 0) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .in('id', Array.from(selectedConversations));

      if (error) throw error;

      if (currentConversationId && selectedConversations.has(currentConversationId)) {
        setMessages([]);
        setCurrentConversationId(null);
        setCurrentDifyConversationId(null);
        setIsRadarSession(false);
      }

      setSelectedConversations(new Set());
      await loadConversations();
      setShowBatchDeleteDialog(false);
      toast.success(t('difyChat.messages.batchDeleteSuccess', { count: selectedConversations.size }));
    } catch (error) {
      console.error('Error batch deleting conversations:', error);
      toast.error(t('difyChat.messages.batchDeleteFailed'));
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentDifyConversationId(null);
    setUploadedFile(null);
    setShowRadarInterface(false);
    setSelectedIdentity('');
    setIsRadarSession(false);
  };

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowDeleteDialog(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRadarButtonClick = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentDifyConversationId(null);
    setUploadedFile(null);
    setShowRadarInterface(true);
    setSelectedIdentity('');
    setIsRadarSession(true);
  };

  const handleFundingOptionChange = (id: string, checked: boolean) => {
    setFundingOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, checked } : option
      )
    );
  };

  const handleAmountChange = (id: string, amount: string) => {
    setFundingOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, amount } : option
      )
    );
  };

  const handleFundingSubmit = async () => {
    const selectedOptions = fundingOptions.filter(opt => opt.checked);
    
    if (selectedOptions.length === 0) {
      toast.error(t('difyChat.radarInterface.selectAtLeastOne'));
      return;
    }

    let queryContent = '我的跨境资金方式如下:\n\n';
    
    selectedOptions.forEach(option => {
      const amount = option.amount ? parseFloat(option.amount) : 0;
      queryContent += `方式 ${option.id}: ${option.label}\n金额: ¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
    });

    queryContent += '请帮我分析这些资金方式的合规风险。';

    const userMessage: Message = {
      role: 'user',
      content: queryContent,
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setShowRadarInterface(false);
    setIsRadarSession(true);
    setLoading(true);

    let conversationIdForSaving = currentConversationId;
    let streamedContent = '';

    const thinkingMessage: Message = {
      role: 'assistant',
      content: '正在分析您的资金方式...',
      timestamp: new Date(),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const isPaidUser = await checkUserSubscription();
      
      toast.info(isPaidUser ? t('difyChat.messages.usingPaidAPI') : t('difyChat.messages.usingFreeAPI'));

      if (!conversationIdForSaving) {
        const dateStr = new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user!.id,
            title: `${t('difyChat.conversationTitles.radar')} - ${dateStr}`,
            dify_conversation_id: null,
            session_type: 'radar'
          })
          .select()
          .single();

        if (!error && data) {
          conversationIdForSaving = data.id;
          setCurrentConversationId(data.id);
          await loadConversations();
        }
      }

      if (conversationIdForSaving) {
        await saveMessageToDatabase(conversationIdForSaving, 'user', queryContent);
      }

      const stream = await callRadarAPI(queryContent, isPaidUser);

      if (!stream) {
        throw new Error('未收到API响应');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === '') continue;
                
                const eventData = JSON.parse(jsonStr);
                
                if (eventData.event === 'message') {
                  const newContent = eventData.answer || '';
                  
                  if (isFirstChunk) {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage.role === 'assistant') {
                        lastMessage.isThinking = false;
                        lastMessage.isStreaming = true;
                        lastMessage.content = '';
                      }
                      return newMessages;
                    });
                    isFirstChunk = false;
                  }
                  
                  streamedContent += newContent;
                  
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content = streamedContent;
                    }
                    return newMessages;
                  });
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

      if (conversationIdForSaving && streamedContent) {
        await saveMessageToDatabase(conversationIdForSaving, 'assistant', streamedContent);
      }

      toast.success(t('difyChat.messages.analysisComplete'));
    } catch (error: unknown) {
      console.error('Error calling Radar API:', error);
      
      setMessages((prev) => prev.slice(0, -1));
      
      if (error instanceof Error) {
        toast.error(error.message || t('difyChat.messages.analysisFailed'));
      } else {
        toast.error(t('difyChat.messages.analysisFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const isChatInputDisabled = (messages.length === 0 && !showRadarInterface) || showRadarInterface;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-4">
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          className="mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('difyChat.backToHome')}
        </Button>
      </div>
      
      <ConfirmDialog
        open={showBatchDeleteDialog}
        onOpenChange={setShowBatchDeleteDialog}
        title={t('difyChat.confirmBatchDelete.title')}
        description={t('difyChat.confirmBatchDelete.description', { count: selectedConversations.size })}
        onConfirm={handleBatchDelete}
        confirmText={t('difyChat.confirmBatchDelete.confirmButton')}
        cancelText={t('difyChat.confirmBatchDelete.cancelButton')}
        variant="destructive"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('difyChat.confirmDelete.title')}
        description={t('difyChat.confirmDelete.description')}
        onConfirm={() => conversationToDelete && deleteConversation(conversationToDelete)}
        confirmText={t('difyChat.confirmDelete.confirmButton')}
        cancelText={t('difyChat.confirmDelete.cancelButton')}
        variant="destructive"
      />

      <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
      />

      <div className="container mx-auto px-4 pb-8">
        <div className="flex gap-6 h-[calc(100vh-14rem)]">
          <Card className="w-72 p-4 overflow-y-auto bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            {i18n.language === 'zh' && (
              <Button
                onClick={handleRadarButtonClick}
                className="w-full mb-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-bold text-sm py-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Radar className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="leading-tight" dangerouslySetInnerHTML={{ __html: t('difyChat.radarInterface.button') }} />
                </div>
              </Button>
            )}

            <Button
              onClick={startNewChat}
              className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('difyChat.newConversation')}
            </Button>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{t('difyChat.conversationHistory')}</h3>
                {conversations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedConversations.size === conversations.length && conversations.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                    <span className="text-xs text-gray-500">{t('difyChat.selectAll')}</span>
                  </div>
                )}
              </div>

              {selectedConversations.size > 0 && (
                <Button
                  onClick={() => setShowBatchDeleteDialog(true)}
                  variant="outline"
                  size="sm"
                  className="w-full mb-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {t('difyChat.deleteSelected', { count: selectedConversations.size })}
                </Button>
              )}

              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 ${
                    currentConversationId === conv.id ? 'bg-blue-100 border-2 border-blue-300 shadow-sm' : 'border border-transparent'
                  }`}
                >
                  <Checkbox
                    checked={selectedConversations.has(conv.id)}
                    onCheckedChange={(checked) => handleSelectConversation(conv.id, checked as boolean)}
                    className="h-4 w-4"
                  />
                  <div
                    onClick={() => loadConversation(conv.id)}
                    className="flex-1 truncate text-sm cursor-pointer text-gray-700 hover:text-blue-600"
                  >
                    {conv.title}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(conv.id)}
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {showRadarInterface ? (
                <div className="w-full h-full overflow-y-auto animate-fadeIn">
                  <div className="max-w-4xl mx-auto pt-4">
                    <Card className="w-full p-8 shadow-xl border-2 border-gray-200 bg-white">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {t('difyChat.radarInterface.formTitle')}
                      </h2>
                      
                      <div className="space-y-4 mb-8">
                        {fundingOptions.map((option) => (
                          <div key={option.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                            <Checkbox
                              checked={option.checked}
                              onCheckedChange={(checked) => handleFundingOptionChange(option.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                方式 {option.id}: {option.label}
                              </label>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-gray-600">{t('difyChat.radarInterface.amountLabel')}</span>
                                <div className="relative flex-1 max-w-xs">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={option.amount}
                                    onChange={(e) => handleAmountChange(option.id, e.target.value)}
                                    disabled={!option.checked}
                                    placeholder={t('difyChat.radarInterface.amountPlaceholder')}
                                    className="pl-8 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={handleFundingSubmit}
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              {t('difyChat.radarInterface.analyzing')}
                            </>
                          ) : (
                            t('difyChat.radarInterface.submitButton')
                          )}
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full animate-fadeIn">
                  <Card className="max-w-3xl w-full p-8 shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50">
                    <div className="text-center space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center mb-4">
                          <div className="relative">
                            <MessageSquare className="h-16 w-16 text-blue-600" />
                            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {t('difyChat.welcome.title')}
                        </h2>
                        <p className="text-gray-600 text-lg">
                          {t('difyChat.welcome.subtitle')}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {t('difyChat.welcome.description')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-3">
                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.seller'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.seller')}
                          </Button>

                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.buyer'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-green-50 hover:border-green-400 hover:text-green-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.buyer')}
                          </Button>

                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.intermediary'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.intermediary')}
                          </Button>

                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.logistics'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.logistics')}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.brand'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.brand')}
                          </Button>

                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.warehouse'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-teal-50 hover:border-teal-400 hover:text-teal-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.warehouse')}
                          </Button>

                          <Button
                            onClick={() => handleIdentitySelect(t('difyChat.welcome.identities.finance'))}
                            variant="outline"
                            className="w-full h-14 text-base font-medium hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md transition-all duration-200"
                            disabled={loading}
                          >
                            {t('difyChat.welcome.identities.finance')}
                          </Button>
                        </div>
                      </div>

                      {loading && (
                        <div className="flex items-center justify-center pt-4">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">正在处理...</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 animate-fadeIn ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-10 h-10 border-2 border-amber-300 shadow-md flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <Scale className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`group/message max-w-[70%] p-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg relative ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        {message.isThinking ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-gray-700">
                              {isFirstMessage ? IDENTITY_CONFIRMATION_MESSAGE : THINKING_MESSAGES[thinkingMessageIndex]}
                            </span>
                            <span className="inline-flex gap-0.5">
                              <span className="animate-bounce text-blue-600" style={{ animationDelay: '0ms' }}>.</span>
                              <span className="animate-bounce text-blue-600" style={{ animationDelay: '150ms' }}>.</span>
                              <span className="animate-bounce text-blue-600" style={{ animationDelay: '300ms' }}>.</span>
                            </span>
                          </div>
                        ) : (
                          <>
                            {message.role === 'user' && message.attachedFile && (
                              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/20">
                                <FileIcon type={message.attachedFile.type} />
                                <span className="text-sm text-white/90 truncate flex-1">{message.attachedFile.name}</span>
                              </div>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {parseMessageContent(message.content, message.role === 'user', t)}
                            </div>
                            {message.isStreaming && (
                              <span className="inline-block w-1 h-5 ml-1 bg-blue-600 animate-pulse" />
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {message.timestamp.toLocaleTimeString('zh-CN')}
                              </p>
                              {message.role === 'assistant' && !message.isStreaming && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyMessage(message.content, index)}
                                  className="h-6 px-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                                >
                                  {copiedMessageIndex === index ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-600" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="w-10 h-10 border-2 border-blue-200 shadow-md flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
              {uploadedFile && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-3 items-end">
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={isChatInputDisabled || loading || uploadingFile}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={isChatInputDisabled || loading || uploadingFile}
                />
                <div className="flex-1 relative group">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      isChatInputDisabled 
                        ? (showRadarInterface ? t('difyChat.input.placeholderRadarForm') : t('difyChat.input.placeholderSelectIdentity'))
                        : uploadedFile 
                          ? t('difyChat.input.placeholderWithFile')
                          : t('difyChat.input.placeholder')
                    }
                    className="min-h-[60px] max-h-[200px] resize-none bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={isChatInputDisabled || loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-indigo-500/5 group-focus-within:to-purple-500/5 pointer-events-none transition-all duration-500"></div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isChatInputDisabled || (!input.trim() && !uploadedFile) || loading}
                  className="h-[60px] px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}