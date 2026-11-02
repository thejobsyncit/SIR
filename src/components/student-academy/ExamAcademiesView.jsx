import React from 'react';
import { ExamEnquiryView } from './ExamEnquiryView';

export { ExamEnquiryView };

export const ExamAcademiesView = (props) => {
  return <ExamEnquiryView {...props} />;
};

export default ExamEnquiryView;
