import React, { useState } from 'react';

const SettingsModal = ({ onClose }) => {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');

  const handleSave = () => {
    // Logic to save the fields to the lookup_template table
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white p-4 rounded'>
        <h3>Edit Settings</h3>
        <input
          type='text'
          value={field1}
          onChange={(e) => setField1(e.target.value)}
          placeholder='Field 1'
          className='block w-full mb-2 p-2 border'
        />
        <input
          type='text'
          value={field2}
          onChange={(e) => setField2(e.target.value)}
          placeholder='Field 2'
          className='block w-full mb-2 p-2 border'
        />
        <input
          type='text'
          value={field3}
          onChange={(e) => setField3(e.target.value)}
          placeholder='Field 3'
          className='block w-full mb-2 p-2 border'
        />
        <button onClick={handleSave} className='bg-blue-500 text-white p-2 rounded'>
          Save
        </button>
        <button onClick={onClose} className='ml-2 bg-gray-500 text-white p-2 rounded'>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
