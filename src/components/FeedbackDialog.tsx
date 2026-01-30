import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'feature_request' | 'bug_report' | 'user_experience' | 'other';

export default function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('user_experience');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('feedback.errors.ratingRequired'));
      return;
    }

    if (comment.trim().length < 10) {
      toast.error(t('feedback.errors.commentTooShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error(t('feedback.errors.notLoggedIn'));
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          rating,
          feedback_type: feedbackType,
          comment: comment.trim()
        });

      if (error) {
        console.error('Feedback submission error:', error);
        toast.error(t('feedback.errors.submitFailed'));
      } else {
        toast.success(t('feedback.success.submitted'));
        // Reset form
        setRating(0);
        setFeedbackType('user_experience');
        setComment('');
        onClose();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(t('feedback.errors.unexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('feedback.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('feedback.rating.label')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t(`feedback.rating.${rating}star`)}
              </p>
            )}
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('feedback.type.label')} <span className="text-red-500">*</span>
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user_experience">{t('feedback.type.userExperience')}</option>
              <option value="feature_request">{t('feedback.type.featureRequest')}</option>
              <option value="bug_report">{t('feedback.type.bugReport')}</option>
              <option value="other">{t('feedback.type.other')}</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('feedback.comment.label')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('feedback.comment.placeholder')}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              minLength={10}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {comment.length}/1000 {t('feedback.comment.characters')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('feedback.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('feedback.buttons.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('feedback.buttons.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
