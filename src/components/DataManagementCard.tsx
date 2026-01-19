import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Database, Trash2, Settings, Clock, HardDrive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ConfirmDialog from './ConfirmDialog';
import { useTranslation } from 'react-i18next';

interface DataManagementCardProps {
  userId: string;
}

type DataRetentionType = 'immediate' | '30days' | 'permanent';

export default function DataManagementCard({ userId }: DataManagementCardProps) {
  const { t } = useTranslation();
  const [dataRetention, setDataRetention] = useState<DataRetentionType>('30days');
  const [conversationCount, setConversationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [tempRetention, setTempRetention] = useState<DataRetentionType>('30days');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDataStats();
    loadRetentionSettings();
  }, [userId]);

  const loadRetentionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('data_retention_preference')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading retention settings:', error);
        return;
      }

      if (data) {
        setDataRetention(data.data_retention_preference || '30days');
        setTempRetention(data.data_retention_preference || '30days');
      }
    } catch (error) {
      console.error('Error loading retention settings:', error);
    }
  };

  const loadDataStats = async () => {
    try {
      // Get conversation count
      const { count: convCount, error: convError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (convError) throw convError;
      setConversationCount(convCount || 0);

      // Get message count
      const { count: msgCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (msgError) throw msgError;
      setMessageCount(msgCount || 0);
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const handleSaveRetentionSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          data_retention_preference: tempRetention,
        });

      if (error) throw error;

      setDataRetention(tempRetention);
      setShowSettingsDialog(false);
      toast.success(t('dataManagement.toasts.settingsUpdated'));
    } catch (error) {
      console.error('Error saving retention settings:', error);
      toast.error(t('dataManagement.toasts.settingsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setLoading(true);
    try {
      // Delete all conversations (messages will be cascade deleted)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setConversationCount(0);
      setMessageCount(0);
      setShowClearDialog(false);
      toast.success(t('dataManagement.toasts.dataCleared'));
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error(t('dataManagement.toasts.clearFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getRetentionLabel = (retention: string) => {
    return t(`dataManagement.retentionOptions.${retention}`);
  };

  const getRetentionColor = (retention: string) => {
    switch (retention) {
      case 'immediate':
        return 'bg-red-500';
      case '30days':
        return 'bg-amber-500';
      case 'permanent':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const estimatedSize = Math.round((messageCount * 0.5 + conversationCount * 0.1) * 100) / 100;

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            {t('dataManagement.title')}
          </CardTitle>
          <CardDescription>{t('dataManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Retention Setting */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('dataManagement.retentionPolicy')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t(`dataManagement.retentionDescriptions.${dataRetention}`)}
                </p>
              </div>
            </div>
            <Badge className={getRetentionColor(dataRetention)}>
              {getRetentionLabel(dataRetention)}
            </Badge>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-gray-700">{t('dataManagement.statistics.conversations')}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{conversationCount}</p>
              <p className="text-xs text-gray-500 mt-1">{t('dataManagement.statistics.conversationsCount')}</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-gray-700">{t('dataManagement.statistics.storage')}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{estimatedSize}</p>
              <p className="text-xs text-gray-500 mt-1">{t('dataManagement.statistics.storageSize', { count: messageCount })}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setTempRetention(dataRetention);
                setShowSettingsDialog(true);
              }}
              variant="outline"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('dataManagement.actions.settings')}
            </Button>
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={conversationCount === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('dataManagement.actions.clearAll')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dataManagement.settingsDialog.title')}</DialogTitle>
            <DialogDescription>{t('dataManagement.settingsDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={tempRetention} onValueChange={(value: string) => setTempRetention(value as DataRetentionType)}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="cursor-pointer flex-1">
                  <p className="font-medium">{t('dataManagement.settingsDialog.options.immediate.title')}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dataManagement.settingsDialog.options.immediate.description')}
                  </p>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer mt-3">
                <RadioGroupItem value="30days" id="30days" />
                <Label htmlFor="30days" className="cursor-pointer flex-1">
                  <p className="font-medium">{t('dataManagement.settingsDialog.options.30days.title')}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dataManagement.settingsDialog.options.30days.description')}
                  </p>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer mt-3">
                <RadioGroupItem value="permanent" id="permanent" />
                <Label htmlFor="permanent" className="cursor-pointer flex-1">
                  <p className="font-medium">{t('dataManagement.settingsDialog.options.permanent.title')}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dataManagement.settingsDialog.options.permanent.description')}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              {t('dataManagement.settingsDialog.cancelButton')}
            </Button>
            <Button
              onClick={handleSaveRetentionSettings}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {loading ? t('dataManagement.settingsDialog.saving') : t('dataManagement.settingsDialog.saveButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title={t('dataManagement.clearDialog.title')}
        description={t('dataManagement.clearDialog.description')}
        onConfirm={handleClearAllData}
        confirmText={t('dataManagement.clearDialog.confirmButton')}
        cancelText={t('dataManagement.clearDialog.cancelButton')}
        variant="destructive"
      />
    </>
  );
}