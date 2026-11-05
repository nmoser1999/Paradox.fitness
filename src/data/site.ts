export const coach = { name: 'Nicho Moser', firstName: 'Nicho' } as const;

/** Business facts and offers: update here, then review every affected page. */
export const site = {
  name: 'Paradox Fitness',
  coach: coach.name,
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
    answer: `No training experience is needed to get in touch. Tell ${coach.firstName} where you are starting and what you want to work toward. He will help you choose an approach that fits your experience and goals.`,
  },
  {
    question: 'How does the free training week work?',
    answer: `The complimentary week includes up to three in-person sessions. Send an inquiry, then arrange the times and details with ${coach.firstName}. Your sessions are confirmed directly with him; submitting the form does not reserve a time.`,
  },
  {
    question: 'Where is in-person training?',
    answer:
      'Training takes place at 43255 Mission Blvd in the Mission San Jose area of Fremont. Parking is shared with Intero.',
  },
  {
    question: 'What does in-person training cost afterward?',
    answer: `Sessions start at ${site.inPersonPrice}, with a minimum of two sessions per week after the trial. Billing is through Square every two weeks. Confirm your plan and pricing with ${coach.firstName} before continuing.`,
  },
  {
    question: 'What if I want to train online?',
    answer: `The Paradox online membership includes structured programs, exercise tutorials, and coaching through Trainerize. Start with a seven-day trial, then ${site.onlinePrice} per month. Review the subscription terms at checkout before signing up.`,
  },
  {
    question: 'How do I arrange my first session?',
    answer: `Send the short inquiry form or contact ${coach.firstName} by email or phone. He will follow up to discuss your goals and arrange your training times. If you are still deciding between in-person and online coaching, he can help you choose.`,
  },
] as const;

export const onlineFaqs = [
  {
    question: 'What is included in the membership?',
    answer:
      'You get structured training programs, on-demand workouts, exercise demonstrations, coaching, and a shared training community through the Trainerize app.',
  },
  {
    question: 'How do I start the seven-day trial?',
    answer: `Use the trial link to open the Paradox Trainerize checkout. Review the offer and subscription terms there, then create your account. Membership is ${site.onlinePrice} per month after the trial.`,
  },
  {
    question: 'How do I check the cancellation terms?',
    answer: `Review the subscription and cancellation terms in Trainerize before you sign up. If anything is unclear, ask ${coach.firstName} before starting the trial.`,
  },
  {
    question: 'Can I ask a question before joining?',
    answer: `Yes. Choose online coaching on the inquiry form, or reach ${coach.firstName} by email or phone. Tell him about your goals and where you plan to train so you can discuss whether the membership fits.`,
  },
] as const;
