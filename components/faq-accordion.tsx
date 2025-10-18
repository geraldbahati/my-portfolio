"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Types
export interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface FaqAccordionProps {
  faqs: FaqItem[];
  className?: string;
  itemClassName?: string;
  questionClassName?: string;
  answerClassName?: string;
  iconClassName?: string;
  borderClassName?: string;
  animationDelay?: number;
  animationDuration?: number;
}

/**
 * FaqAccordion Component
 *
 * A reusable, accessible accordion component for displaying FAQs.
 * Supports custom styling, animations, and both string and React node answers.
 *
 * @param faqs - Array of FAQ items with questions and answers
 * @param className - Additional classes for the container
 * @param itemClassName - Additional classes for each FAQ item
 * @param questionClassName - Additional classes for questions
 * @param answerClassName - Additional classes for answers
 * @param iconClassName - Additional classes for the expand/collapse icon
 * @param borderClassName - Additional classes for borders
 * @param animationDelay - Stagger delay between items (default: 0.05s)
 * @param animationDuration - Animation duration (default: 0.6s)
 */
export function FaqAccordion({
  faqs,
  className = "",
  itemClassName = "",
  questionClassName = "text-white text-base font-light tracking-wider",
  answerClassName = "text-gray-400 text-base leading-relaxed",
  iconClassName = "text-gray-400",
  borderClassName = "border-primary/50",
  animationDelay = 0.05,
  animationDuration = 0.6,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Determine if animations should be used
  const shouldAnimate = animationDuration > 0;

  return (
    <div className={`space-y-0 ${className}`}>
      {faqs.map((faq, index) => {
        const ItemWrapper = shouldAnimate ? motion.div : 'div';
        const itemProps = shouldAnimate
          ? {
              initial: { opacity: 0 },
              whileInView: { opacity: 1 },
              transition: { duration: animationDuration, delay: index * animationDelay },
              viewport: { once: true },
            }
          : {};

        return (
          <ItemWrapper
            key={index}
            {...itemProps}
            className={`border-t ${borderClassName} last:border-b last:${borderClassName} ${itemClassName}`}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-gray-300"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className={`pr-4 uppercase ${questionClassName}`}>
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`flex-shrink-0 ${iconClassName}`}
                aria-hidden="true"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="pb-6"
                  >
                    <div className={`max-w-3xl ${answerClassName}`}>
                      {typeof faq.answer === "string" ? (
                        <p>{faq.answer}</p>
                      ) : (
                        faq.answer
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </ItemWrapper>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
