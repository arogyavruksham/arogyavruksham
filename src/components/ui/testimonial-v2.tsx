'use client'

import React from 'react';
import { motion } from "framer-motion";

// --- Types ---
export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Data ---
const defaultTestimonials: Testimonial[] = [
  {
    text: "The Snake Plant arrived in pristine condition! The packaging was so secure, and it looks even healthier than I expected. Absolutely thrilled.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Briana Patton",
    role: "Plant Enthusiast",
  },
  {
    text: "Fast delivery and amazing customer service. My Fiddle Leaf Fig is gorgeous and perfectly complements my living room.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Bilal Ahmed",
    role: "Interior Designer",
  },
  {
    text: "I was worried about ordering plants online, but my new Peace Lily was delivered flawlessly. Not a single leaf was damaged!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Saman Malik",
    role: "Homeowner",
  },
  {
    text: "Beautiful Aloe Vera plant and exceptional quality. The care instructions included were super helpful for a beginner like me.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Omar Raza",
    role: "New Plant Parent",
  },
  {
    text: "I've ordered from many places, but this was the best experience. Next-day delivery and the healthiest Monstera Deliciosa I've seen.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zainab Hussain",
    role: "Botanist",
  },
  {
    text: "My office space feels so much more vibrant now. Thank you for the quick delivery of the stunning ZZ Plant!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Khan",
    role: "Office Manager",
  },
  {
    text: "Highly appreciate the eco-friendly packaging! The Spider Plant was fully hydrated and looked fresh straight out of the box.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Farhan Siddiqui",
    role: "Eco-Conscious Buyer",
  },
  {
    text: "The 50% off sale was a steal. The quality of my new Rubber Plant wasn't compromised at all. Fast shipping and great communication.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Sheikh",
    role: "Loyal Customer",
  },
  {
    text: "This is my go-to shop for all things green. They never disappoint with their delivery times, and my Golden Pothos is thriving.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Hassan Ali",
    role: "Collector",
  },
];

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-black/5 max-w-xs w-full bg-white dark:bg-neutral-900 transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-[#1E4631]/30" 
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal m-0 transition-colors duration-300">
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800 group-hover:ring-[#1E4631]/30 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-neutral-900 dark:text-white transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="text-sm leading-5 tracking-tight text-neutral-500 dark:text-neutral-500 mt-0.5 transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export default function TestimonialsSection({ reviews }: { reviews?: Testimonial[] }) {
  let displayReviews = [...(reviews || [])];
  
  if (displayReviews.length > 0) {
    // Pad to ensure at least 9 items so all 3 columns have enough content to scroll smoothly
    while (displayReviews.length < 9) {
      displayReviews = [...displayReviews, ...displayReviews];
    }
  } else {
    displayReviews = [...defaultTestimonials];
  }

  const third = Math.ceil(displayReviews.length / 3);
  const firstColumn = displayReviews.slice(0, third);
  const secondColumn = displayReviews.slice(third, third * 2);
  const thirdColumn = displayReviews.slice(third * 2);

  return (
    <section 
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-16 my-10 relative overflow-hidden bg-[#f9fbf9]"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="container px-4 z-10 mx-auto max-w-[1440px]"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-[#1E4631]/20 py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-[#1E4631] bg-[#1E4631]/5 transition-colors">
              Customer Reviews
            </div>
          </div>

          <h2 id="testimonials-heading" className="font-serif text-[40px] font-bold tracking-tight mt-6 text-center text-[#1a1a1a] transition-colors">
            What our customers say
          </h2>
          <p className="text-center mt-5 text-gray-500 text-lg leading-relaxed max-w-sm transition-colors">
            Discover why thousands of plant lovers trust us for their green deliveries.
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[600px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
        </div>
      </motion.div>
    </section>
  );
}
