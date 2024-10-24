import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [commentSummary, setCommentSummary] = useState('');
  const [impactSummary, setImpactSummary] = useState('');
  const [messageSummary, setMessageSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('lookup_context')
        .select('name, content')
        .in('name', ['comment_summary_prompt', 'impact_summary_prompt', 'message_summary_prompt']);

      if (!error && data) {
        data.forEach(item => {
          switch (item.name) {
            case 'comment_summary_prompt':
              setCommentSummary(item.content);
              break;
            case 'impact_summary_prompt':
              setImpactSummary(item.content);
              break;
            case 'message_summary_prompt':
              setMessageSummary(item.content);
              break;
          }
        });
      }
      setIsLoading(false);
    };

    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const updates = [
      { name: 'comment_summary_prompt', content: commentSummary },
      { name: 'impact_summary_prompt', content: impactSummary },
      { name: 'message_summary_prompt', content: messageSummary }
    ];

    for (const update of updates) {
      await supabase
        .from('lookup_context')
        .update({ content: update.content })
        .eq('name', update.name);
    }

    setIsLoading(false);
    onClose();
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
        <div className='bg-white p-4 rounded'>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white p-4 rounded max-w-lg w-full mx-4'>
        <h3 className='text-lg font-medium mb-4'>Edit Settings</h3>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Comment Summary Prompt
            </label>
            <textarea
              value={commentSummary}
              onChange={(e) => setCommentSummary(e.target.value)}
              className='block w-full p-2 border rounded h-24'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Impact Summary Prompt
            </label>
            <textarea
              value={impactSummary}
              onChange={(e) => setImpactSummary(e.target.value)}
              className='block w-full p-2 border rounded h-24'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Message Summary Prompt
            </label>
            <textarea
              value={messageSummary}
              onChange={(e) => setMessageSummary(e.target.value)}
              className='block w-full p-2 border rounded h-24'
            />
          </div>
        </div>
        <div className='mt-4 flex justify-end space-x-2'>
          <button
            onClick={handleSave}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            disabled={isLoading}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
