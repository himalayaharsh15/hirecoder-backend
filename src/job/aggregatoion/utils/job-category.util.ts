import { JobCategory } from '@prisma/client';

export function detectJobCategory(
  title: string,
  description: string,
): JobCategory {
  const text = `${title} ${description}`.toLowerCase();

  // Technology
  if (
    text.includes('software engineer') ||
    text.includes('software developer') ||
    text.includes('frontend') ||
    text.includes('front-end') ||
    text.includes('backend') ||
    text.includes('back-end') ||
    text.includes('full stack') ||
    text.includes('full-stack') ||
    text.includes('react') ||
    text.includes('angular') ||
    text.includes('node.js') ||
    text.includes('typescript') ||
    text.includes('javascript') ||
    text.includes('devops') ||
    text.includes('cloud engineer') ||
    text.includes('mobile developer') ||
    text.includes('ios developer') ||
    text.includes('android developer') ||
    text.includes('qa engineer') ||
    text.includes('automation engineer')
  ) {
    return JobCategory.TECHNOLOGY;
  }

  // Data
  if (
    text.includes('data analyst') ||
    text.includes('data scientist') ||
    text.includes('data engineer') ||
    text.includes('business analyst') ||
    text.includes('business intelligence') ||
    text.includes('bi analyst') ||
    text.includes('power bi') ||
    text.includes('tableau') ||
    text.includes('machine learning') ||
    text.includes('analytics')
  ) {
    return JobCategory.DATA;
  }

  // Sales
  if (
    text.includes('sales executive') ||
    text.includes('sales manager') ||
    text.includes('sales representative') ||
    text.includes('sales associate') ||
    text.includes('business development') ||
    text.includes('account executive') ||
    text.includes('account manager') ||
    text.includes('sales development')
  ) {
    return JobCategory.SALES;
  }

  // Marketing
  if (
    text.includes('marketing') ||
    text.includes('digital marketing') ||
    text.includes('seo') ||
    text.includes('content marketing') ||
    text.includes('social media marketing')
  ) {
    return JobCategory.MARKETING;
  }

  // Finance
  if (
    text.includes('accountant') ||
    text.includes('accounting') ||
    text.includes('financial analyst') ||
    text.includes('finance manager') ||
    text.includes('investment analyst') ||
    text.includes('financial controller')
  ) {
    return JobCategory.FINANCE;
  }

  // Human Resources
  if (
    text.includes('human resources') ||
    text.includes('hr manager') ||
    text.includes('hr business partner') ||
    text.includes('recruiter') ||
    text.includes('talent acquisition') ||
    text.includes('people operations')
  ) {
    return JobCategory.HUMAN_RESOURCES;
  }

  // Design
  if (
    text.includes('ui designer') ||
    text.includes('ux designer') ||
    text.includes('product designer') ||
    text.includes('graphic designer') ||
    text.includes('visual designer')
  ) {
    return JobCategory.DESIGN;
  }

  // Operations
  if (
    text.includes('operations manager') ||
    text.includes('operations analyst') ||
    text.includes('supply chain') ||
    text.includes('procurement')
  ) {
    return JobCategory.OPERATIONS;
  }

  // Customer Support
  if (
    text.includes('customer support') ||
    text.includes('customer service') ||
    text.includes('technical support') ||
    text.includes('support specialist')
  ) {
    return JobCategory.CUSTOMER_SUPPORT;
  }

  return JobCategory.OTHER;
}
