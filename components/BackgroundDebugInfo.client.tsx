"use client";

import { useEffect, useState } from "react";

export default function BackgroundDebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    projectsVisible: false,
    projectsRatio: 0,
    faqVisible: false,
    faqRatio: 0,
    contactVisible: false,
    contactRatio: 0,
    bgColor: "",
    textColor: "",
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const projectsEl = document.querySelector('[data-section-id="ProjectsSectionPinned"]');
      const faqEl = document.querySelector('[data-section-id="ExpertiseFaqSection"]');
      const contactEl = document.querySelector('[data-section-id="ContactSection"]');
      const root = document.documentElement;

      setDebugInfo({
        projectsVisible: projectsEl ? isElementVisible(projectsEl) : false,
        projectsRatio: projectsEl ? getVisibilityRatio(projectsEl) : 0,
        faqVisible: faqEl ? isElementVisible(faqEl) : false,
        faqRatio: faqEl ? getVisibilityRatio(faqEl) : 0,
        contactVisible: contactEl ? isElementVisible(contactEl) : false,
        contactRatio: contactEl ? getVisibilityRatio(contactEl) : 0,
        bgColor: root.style.getPropertyValue('--page-bg-color') || 'not set',
        textColor: root.style.getPropertyValue('--page-text-auto') || 'not set',
      });
    };

    const interval = setInterval(updateDebugInfo, 100);
    return () => clearInterval(interval);
  }, []);

  const isElementVisible = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return rect.top < windowHeight && rect.bottom > 0;
  };

  const getVisibilityRatio = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.bottom <= 0 || rect.top >= windowHeight) return 0;

    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(windowHeight, rect.bottom);
    const visibleHeight = visibleBottom - visibleTop;
    const elementHeight = rect.height;

    return Math.min(1, Math.max(0, visibleHeight / elementHeight));
  };

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded z-50 text-xs font-mono">
      <div>Projects: {debugInfo.projectsVisible ? '✅' : '❌'} ({(debugInfo.projectsRatio * 100).toFixed(1)}%)</div>
      <div>FAQ: {debugInfo.faqVisible ? '✅' : '❌'} ({(debugInfo.faqRatio * 100).toFixed(1)}%)</div>
      <div>Contact: {debugInfo.contactVisible ? '✅' : '❌'} ({(debugInfo.contactRatio * 100).toFixed(1)}%)</div>
      <div>BG: {debugInfo.bgColor}</div>
      <div>Text: {debugInfo.textColor}</div>
      <div className="text-yellow-300 mt-2">
        Thresholds: Projects 20%, FAQ 40%, Contact 10%
      </div>
    </div>
  );
}