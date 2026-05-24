export const DEMO_CAMPAIGNS = [
  {
    id: 'demo-1',
    title: 'Help Build a Community Library',
    description: 'Help us build a free community library in our neighborhood. We need funds for books, shelves, and renovation of the space to create a welcoming learning environment for everyone.',
    goal_amount: 15000,
    current_amount: 3250,
    category: 'Community',
    status: 'active',
    donorCount: 24,
    image_url: null,
    user_id: 'demo',
  },
  {
    id: 'demo-2',
    title: 'Medical Fund for Sarah',
    description: 'Support Sarah\'s recovery journey. She needs urgent medical treatment and we\'re raising funds to cover hospital expenses and rehabilitation costs.',
    goal_amount: 50000,
    current_amount: 12300,
    category: 'Medical',
    status: 'active',
    donorCount: 87,
    image_url: null,
    user_id: 'demo',
  },
  {
    id: 'demo-3',
    title: 'Education for Underprivileged Children',
    description: 'Provide school supplies, uniforms, and tuition for 50 underprivileged children in our community. Every child deserves access to quality education.',
    goal_amount: 25000,
    current_amount: 8900,
    category: 'Education',
    status: 'active',
    donorCount: 56,
    image_url: null,
    user_id: 'demo',
  },
  {
    id: 'demo-4',
    title: 'Emergency Flood Relief',
    description: 'Our community was devastated by recent floods. We need funds for emergency supplies, temporary shelter, and rebuilding homes for affected families.',
    goal_amount: 75000,
    current_amount: 28300,
    category: 'Emergency',
    status: 'active',
    donorCount: 143,
    image_url: null,
    user_id: 'demo',
  },
  {
    id: 'demo-5',
    title: 'Startup: Eco-Friendly Packaging',
    description: 'Help us launch an eco-friendly packaging alternative to single-use plastics. We have the prototype and need funding for initial production run.',
    goal_amount: 35000,
    current_amount: 15200,
    category: 'Startup',
    status: 'active',
    donorCount: 41,
    image_url: null,
    user_id: 'demo',
  },
  {
    id: 'demo-6',
    title: 'Animal Shelter Renovation',
    description: 'Our local animal shelter needs urgent renovations to house more rescued animals. Help us create a safe, warm space for abandoned pets.',
    goal_amount: 20000,
    current_amount: 7800,
    category: 'Community',
    status: 'active',
    donorCount: 63,
    image_url: null,
    user_id: 'demo',
  },
]

export const DEMO_DONATIONS: Record<string, { donor_name: string; amount: number; message: string; anonymous: boolean; donor_email: string | null }[]> = {
  'demo-1': [
    { donor_name: 'Alice Johnson', amount: 500, message: 'Libraries change lives!', anonymous: false, donor_email: null },
    { donor_name: 'Bob Smith', amount: 250, message: 'Great initiative!', anonymous: false, donor_email: null },
    { donor_name: 'Carol Davis', amount: 100, message: null, anonymous: true, donor_email: null },
  ],
  'demo-2': [
    { donor_name: 'David Wilson', amount: 1000, message: 'Stay strong Sarah!', anonymous: false, donor_email: null },
    { donor_name: 'Eve Brown', amount: 500, message: 'Praying for your recovery', anonymous: false, donor_email: null },
    { donor_name: null, amount: 200, message: null, anonymous: true, donor_email: null },
  ],
  'demo-3': [
    { donor_name: 'Frank Miller', amount: 2000, message: 'Education is the future', anonymous: false, donor_email: null },
    { donor_name: 'Grace Lee', amount: 350, message: 'Every child matters', anonymous: false, donor_email: null },
  ],
  'demo-4': [
    { donor_name: 'Henry Taylor', amount: 5000, message: 'Stay safe everyone!', anonymous: false, donor_email: null },
    { donor_name: 'Iris Martinez', amount: 1500, message: null, anonymous: false, donor_email: null },
  ],
  'demo-5': [
    { donor_name: 'Jack Anderson', amount: 3000, message: 'Love the eco-friendly mission!', anonymous: false, donor_email: null },
  ],
  'demo-6': [
    { donor_name: 'Karen White', amount: 750, message: 'Save all the puppies!', anonymous: false, donor_email: null },
    { donor_name: 'Leo Harris', amount: 300, message: 'Animals deserve love too', anonymous: false, donor_email: null },
  ],
}

export function isDemoId(id: string) {
  return id.startsWith('demo-')
}
