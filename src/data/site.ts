/** Business facts and offers: update here, then review every affected page. */
export const site = {
  name: 'Paradox Fitness',
  coach: 'Nico',
  email: 'Nichomoser@pdoxfitness.com',
  phone: '(510) 606-0868',
  phoneHref: 'tel:+15106060868',
  address: '43255 Mission Blvd',
  city: 'Fremont, CA 94539',
  instagram: 'https://www.instagram.com/nichomoserpdox/',
  directions:
    'https://www.google.com/maps/search/?api=1&query=43255+Mission+Blvd+Fremont+CA+94539',
  checkout:
    'https://www.trainerize.me/profile/pdoxfitness/?code=7DAYTRIAL&mode=checkout&planGUID=2fc2486856bc410e87ce1e6c5382ac9c',
  inPersonPrice: '$85',
  onlinePrice: '$60',
  hours: ['Monday–Friday · 6:00 am–7:30 pm', 'Saturday · 6:00 am–12:00 pm'],
} as const;

export const faqs = [
  {
    question: 'Do I need training experience?',
    answer:
      'You can start with a conversation about where you are now and what you want to work toward. Nico will help you choose a starting point and training approach.',
  },
  {
    question: 'How does the free training week work?',
    answer:
      'Send an inquiry to arrange a complimentary in-person training week, with a maximum of three sessions. Nico will confirm the details and available times. An inquiry does not reserve a session.',
  },
  {
    question: 'Where is in-person training?',
    answer:
      'Training takes place at 43255 Mission Blvd in the Mission San Jose area of Fremont. Parking is shared with Intero.',
  },
  {
    question: 'What does in-person training cost afterward?',
    answer:
      'Sessions start at $85, with a minimum of two sessions per week. Billing is through Square every two weeks. Talk with Nico about the right arrangement before starting.',
  },
  {
    question: 'What if I want to train online?',
    answer:
      'The Paradox online membership provides structured programs, exercise tutorials, and coaching through Trainerize. The current offer is a seven-day trial, followed by $60 per month. Review the checkout terms before subscribing.',
  },
  {
    question: 'How do I book my first session?',
    answer:
      'Use the short inquiry form to tell Nico whether you are interested in in-person training, online coaching, or still deciding. He will follow up to discuss the next step.',
  },
] as const;
