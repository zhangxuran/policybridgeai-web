import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DisclaimerDialogProps {
  open: boolean;
  onAccept: (dataRetention: 'immediate' | '30days' | 'permanent') => void;
  onCancel: () => void;
}

export default function DisclaimerDialog({ open, onAccept, onCancel }: DisclaimerDialogProps) {
  const { t } = useTranslation();
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [dataRetention, setDataRetention] = useState<'immediate' | '30days' | 'permanent'>('30days');

  const handleAccept = () => {
    if (!agreedToDisclaimer) {
      return;
    }
    onAccept(dataRetention);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <DialogTitle className="text-xl">{t('disclaimerDialog.title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('disclaimerDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Nature */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('disclaimerDialog.serviceNature.title')}</h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-3">{t('disclaimerDialog.serviceNature.notConstitute')}</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.serviceNature.items.legalOpinion')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.serviceNature.items.legalConsultation')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.serviceNature.items.legalEvidence')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900 mb-3">{t('disclaimerDialog.recommendations.title')}</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.recommendations.items.consultLawyer')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.recommendations.items.dueDiligence')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t('disclaimerDialog.recommendations.items.notSoleDecision')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">{t('disclaimerDialog.limitations.title')}</p>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• {t('disclaimerDialog.limitations.items.aiErrors')}</li>
                <li>• {t('disclaimerDialog.limitations.items.dataDelay')}</li>
                <li>• {t('disclaimerDialog.limitations.items.noGuarantee')}</li>
              </ul>
            </div>
          </div>

          {/* Data Retention Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('disclaimerDialog.dataRetention.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('disclaimerDialog.dataRetention.description')}
            </p>
            
            <RadioGroup value={dataRetention} onValueChange={(value: string) => setDataRetention(value as 'immediate' | '30days' | 'permanent')}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                  <Label htmlFor="immediate" className="cursor-pointer flex-1">
                    <div className="font-semibold">{t('disclaimerDialog.dataRetention.options.immediate.title')}</div>
                    <div className="text-sm text-gray-600">{t('disclaimerDialog.dataRetention.options.immediate.description')}</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-blue-50 border-blue-200">
                  <RadioGroupItem value="30days" id="30days" className="mt-1" />
                  <Label htmlFor="30days" className="cursor-pointer flex-1">
                    <div className="font-semibold">{t('disclaimerDialog.dataRetention.options.30days.title')}</div>
                    <div className="text-sm text-gray-600">{t('disclaimerDialog.dataRetention.options.30days.description')}</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="permanent" id="permanent" className="mt-1" />
                  <Label htmlFor="permanent" className="cursor-pointer flex-1">
                    <div className="font-semibold">{t('disclaimerDialog.dataRetention.options.permanent.title')}</div>
                    <div className="text-sm text-gray-600">{t('disclaimerDialog.dataRetention.options.permanent.description')}</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="disclaimer"
              checked={agreedToDisclaimer}
              onCheckedChange={(checked) => setAgreedToDisclaimer(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="disclaimer"
              className="text-sm leading-relaxed cursor-pointer"
            >
              {t('disclaimerDialog.agreement.prefix')}
              <Link to="/disclaimer" target="_blank" className="text-blue-600 hover:text-blue-700 font-semibold mx-1">
                {t('disclaimerDialog.agreement.disclaimer')}
              </Link>
              {t('disclaimerDialog.agreement.suffix')}
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t('disclaimerDialog.cancelButton')}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!agreedToDisclaimer}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {t('disclaimerDialog.acceptButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}