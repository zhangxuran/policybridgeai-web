import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, X, Upload } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Upload className="h-6 w-6 text-blue-600" />
            {t('upgradeDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t('upgradeDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Feature Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Trial Version */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">{t('upgradeDialog.trialVersion')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('upgradeDialog.features.basicChat')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">{t('upgradeDialog.features.noFileUpload')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">{t('upgradeDialog.features.noDeepAnalysis')}</span>
                </li>
              </ul>
            </div>

            {/* Professional Version */}
            <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {t('upgradeDialog.recommended')}
              </div>
              <h3 className="font-semibold text-lg mb-3 text-blue-700">{t('upgradeDialog.professionalVersion')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('upgradeDialog.features.smartChat')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{t('upgradeDialog.features.fileUpload')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{t('upgradeDialog.features.aiAnalysis')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{t('upgradeDialog.features.unlimitedUsage')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-900">{t('upgradeDialog.benefits.title')}</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• {t('upgradeDialog.benefits.format')}</li>
              <li>• {t('upgradeDialog.benefits.extraction')}</li>
              <li>• {t('upgradeDialog.benefits.comparison')}</li>
              <li>• {t('upgradeDialog.benefits.advice')}</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('upgradeDialog.cancelButton')}
          </Button>
          <Button
            onClick={handleUpgrade}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('upgradeDialog.upgradeButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}