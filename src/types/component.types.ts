export type ComponentType = 
  | 'HeroBanner'
  | 'AboutSection'
  | 'EventsSection'
  | 'DepartmentCard'
  | 'FacultyProfile'
  | 'CourseCard'
  | 'NewsCard'
  | 'ContactForm'
  | 'ImageGallery'
  | 'TestimonialCard'
  | 'StatsSection'
  | 'Timeline'
  | 'Accordion'
  | 'TabSection'
  | 'PricingCard'
  | 'TeamMember'
  | 'FeatureCard';

export interface ComponentProps {
  [key: string]: any;
}
