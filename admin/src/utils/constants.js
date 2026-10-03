export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Roles an Admin can assign. SUPER_ADMIN is provisioned out-of-band and is
// deliberately not assignable from the portal (the API rejects it).
export const USER_ROLES = [
  'USER',
  'ADMIN',
  'OWNER',
  'VENDOR',
  'OPERATOR',
  'COORDINATOR',
  'SERVICE_PROVIDER',
  'PRACTITIONER',
];

export const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const ISSUE_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];

export const ACTIVITY_MODULES = [
  { label: 'Users & Roles', value: 'profiles' },
  { label: 'SDUI Home', value: 'home' },
  { label: 'Marketplace', value: 'marketplace' },
  { label: 'Travel', value: 'travel' },
  { label: 'Prasad', value: 'prasad' },
  { label: 'Wellness', value: 'wellness' },
  { label: 'Issue Reports', value: 'issue-reports' },
  { label: 'Super Admin', value: 'oversight' },
];

export const HOME_SECTION_TYPES = [
  { label: 'Hero Carousel', value: 'HERO_CAROUSEL' },
  { label: 'Travel Categories', value: 'TRAVEL_CATEGORIES' },
  { label: 'Featured Destinations', value: 'FEATURED_DESTINATIONS' },
  { label: 'Featured Tours', value: 'FEATURED_TOURS' },
  { label: 'Cultural Experiences', value: 'CULTURAL_EXPERIENCES' },
  { label: 'Wellness & Skill Academies', value: 'WELLNESS' },
  { label: 'Promotions', value: 'PROMOTIONS' },
  { label: 'Marketplace Highlights', value: 'MARKETPLACE_HIGHLIGHTS' },
];

export const ACTION_TYPES = [
  { label: 'Screen Navigation', value: 'SCREEN' },
  { label: 'Shop Category', value: 'CATEGORY' },
  { label: 'Destination Route', value: 'DESTINATION' },
  { label: 'Tour Package Route', value: 'TOUR' },
  { label: 'External Govt URL', value: 'EXTERNAL_URL' },
];

export const FLUTTER_SCREEN_DESTINATIONS = [
  { label: 'Home Screen', value: 'home' },
  { label: 'Travel Section', value: 'travel' },
  { label: 'Shop (Marketplace)', value: 'shop' },
  { label: 'Prasad Pre-booking', value: 'prasad' },
  { label: 'Wellness & Healing', value: 'wellness' },
];


