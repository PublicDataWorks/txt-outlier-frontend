export const getSendNowError = (errorCode: string): string => {
  switch (errorCode) {
    case '0':
      return 'Internal Server Error, could not broadcast. Please contact admin.';
    case '1':
      return (
        'There is already a pending broadcast scheduled to run within the next 30 minutes. ' +
        'Please wait until until it finished or edit broadcast time.'
      );
    case '2':
      return 'There is already a broadcast in progress, please wait.';
    default:
      return 'An unexpected error occurred, please contact admin.';
  }
};

