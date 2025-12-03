import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @typedef {Object} Target
 * @property {string} [id] - Target element ID
 * @property {string} [className] - Target element className
 */

/**
 * @typedef {Object} Step
 * @property {number} step - Step number (order)
 * @property {string} [id] - Target element ID (for single target)
 * @property {string} [className] - Target element className (for single target)
 * @property {Target[]} [targets] - Array of targets for multiple highlights
 * @property {string} [path] - Route path for cross-page tours (e.g., '/about')
 * @property {string} [nextPath] - Path to navigate when clicking Next on this step
 * @property {function} [onNext] - Custom function to run when clicking Next on this step
 * @property {string} [nextLabel] - Custom label for Next button (default: 'Next' or 'Finish')
 * @property {string} [position] - Preferred tooltip position: 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right', or 'auto' (default)
 * @property {string} [title] - Optional title for the tooltip
 * @property {string} content - Content/description for the step
 */

/**
 * @typedef {Object} ReactGuideProps
 * @property {Step[]} steps - Array of tour steps
 * @property {boolean} [isOpen=false] - Whether the tour is active
 * @property {boolean} [isClickDisabled=false] - Whether clicks on highlighted element are disabled
 * @property {function} [onComplete] - Callback when tour completes
 * @property {function} [onSkip] - Callback when tour is skipped
 * @property {function} [onStepChange] - Callback when step changes (receives step number and path)
 * @property {function} [onNavigate] - Callback when navigation to different page is needed (receives path)
 */

/**
 * Find target element by id or className
 * @param {Target} target
 * @returns {HTMLElement|null}
 */
const getTargetElement = (target) => {
  if (!target) return null;
  if (target.id) {
    return document.getElementById(target.id);
  }
  if (target.className) {
    return document.querySelector(`.${target.className}`);
  }
  return null;
};

/**
 * Get all targets from a step (supports both single and multiple targets)
 * @param {Step} step
 * @returns {Target[]}
 */
const getStepTargets = (step) => {
  if (step.targets && Array.isArray(step.targets)) {
    return step.targets;
  }
  // Single target - convert to array format
  if (step.id || step.className) {
    return [{ id: step.id, className: step.className }];
  }
  return [];
};

/**
 * Get bounding rect that encompasses all target elements
 * @param {Target[]} targets
 * @returns {Object|null}
 */
const getCombinedRect = (targets) => {
  const rects = [];

  for (const target of targets) {
    const element = getTargetElement(target);
    if (element) {
      const rect = element.getBoundingClientRect();
      rects.push({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
    }
  }

  if (rects.length === 0) return null;

  // Calculate bounding box that contains all elements
  const minLeft = Math.min(...rects.map(r => r.left));
  const minTop = Math.min(...rects.map(r => r.top));
  const maxRight = Math.max(...rects.map(r => r.right));
  const maxBottom = Math.max(...rects.map(r => r.bottom));

  return {
    top: minTop + window.scrollY,
    left: minLeft + window.scrollX,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
    viewportTop: minTop,
    viewportLeft: minLeft,
    viewportRight: maxRight,
    viewportBottom: maxBottom,
    // Store individual rects for multiple highlights
    individualRects: rects,
  };
};

/**
 * ReactGuide - A lightweight React tour/guide component
 * @param {ReactGuideProps} props
 */
export function ReactGuide({
  steps = [],
  isOpen = false,
  isClickDisabled = false,
  onComplete,
  onSkip,
  onStepChange,
  onNavigate,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 15; // 3 seconds with 200ms intervals

  // Sort steps by step number
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);
  const currentStep = sortedSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === sortedSteps.length - 1;

  // Update target element position with retry logic
  const updateTargetPosition = useCallback((withRetry = false) => {
    if (!currentStep) return;

    const targets = getStepTargets(currentStep);
    const combinedRect = getCombinedRect(targets);

    if (combinedRect) {
      setTargetRect(combinedRect);
      retryCountRef.current = 0;
      setIsVisible(true);
    } else if (withRetry && retryCountRef.current < maxRetries) {
      // Elements not found, retry
      retryCountRef.current += 1;
      retryTimeoutRef.current = setTimeout(() => {
        updateTargetPosition(true);
      }, 200);
    } else if (retryCountRef.current >= maxRetries) {
      // Max retries reached, skip to next step
      console.warn(`Elements not found for step ${currentStep.step}, skipping...`);
      retryCountRef.current = 0;
      skipToNextValidStep();
    }
  }, [currentStep]);

  // Skip to next step that has a valid element
  const skipToNextValidStep = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else {
      const nextIndex = currentStepIndex + 1;
      const nextStep = sortedSteps[nextIndex];
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextStep?.step, nextStep?.path);

      // Handle navigation if next step has a different path
      if (nextStep?.path && onNavigate) {
        onNavigate(nextStep.path);
      }
    }
  }, [currentStepIndex, isLastStep, onComplete, onStepChange, onNavigate, sortedSteps]);

  // Cleanup retry timeout
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Handle initial navigation when tour opens on a step with a path
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Only navigate on initial open (step index 0) if it has a path
    if (currentStepIndex === 0 && currentStep.path && onNavigate) {
      onNavigate(currentStep.path);
    }
  }, [isOpen]); // Only run when isOpen changes

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsVisible(false);
      setTargetRect(null);
      return;
    }

    // Try to find elements with retry
    updateTargetPosition(true);

    // Update position on scroll/resize
    const handlePositionUpdate = () => updateTargetPosition(false);
    window.addEventListener('scroll', handlePositionUpdate);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isOpen, currentStep, updateTargetPosition]);

  // Scroll first target element into view
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const targets = getStepTargets(currentStep);
    if (targets.length > 0) {
      const element = getTargetElement(targets[0]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    // Run custom onNext function for current step if provided
    if (currentStep?.onNext) {
      currentStep.onNext();
    }

    if (isLastStep) {
      onComplete?.();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const nextStep = sortedSteps[nextIndex];

    // Check if we need to navigate to a different page
    const needsNavigation = currentStep?.nextPath ||
      (nextStep?.path && nextStep.path !== currentStep?.path);

    const targetPath = currentStep?.nextPath || nextStep?.path;

    if (needsNavigation && targetPath && onNavigate) {
      // Navigate first, then update step - keep overlay visible
      onNavigate(targetPath);

      // Update step after short delay for page to render
      setTimeout(() => {
        setCurrentStepIndex(nextIndex);
        onStepChange?.(nextStep?.step, nextStep?.path);
      }, 50);
    } else {
      // Same page - just update step, CSS handles smooth transition
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextStep?.step, nextStep?.path);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      const prevStep = sortedSteps[prevIndex];

      // Check if we need to navigate to a different page
      const needsNavigation = prevStep?.path && prevStep.path !== currentStep?.path;

      if (needsNavigation && prevStep?.path && onNavigate) {
        // Navigate first, then update step - keep overlay visible
        onNavigate(prevStep.path);

        // Update step after short delay for page to render
        setTimeout(() => {
          setCurrentStepIndex(prevIndex);
          onStepChange?.(prevStep?.step, prevStep?.path);
        }, 50);
      } else {
        // Same page - just update step, CSS handles smooth transition
        setCurrentStepIndex(prevIndex);
        onStepChange?.(prevStep?.step, prevStep?.path);
      }
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (!isOpen || !currentStep || sortedSteps.length === 0) {
    return null;
  }

  // Calculate optimal position for tooltip and arrow
  const position = calculatePosition(targetRect, currentStep?.position);

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <Overlay targetRect={targetRect} isVisible={isVisible} isClickDisabled={isClickDisabled} />

      {/* Arrow pointer to target */}
      <Arrow targetRect={targetRect} position={position} isVisible={isVisible} />

      {/* Tooltip card */}
      <Tooltip
        step={currentStep}
        targetRect={targetRect}
        position={position}
        currentStepIndex={currentStepIndex}
        totalSteps={sortedSteps.length}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isVisible={isVisible}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </>
  );
}

/**
 * Overlay component with spotlight effect (supports multiple highlights)
 */
function Overlay({ targetRect, isVisible, isClickDisabled }) {
  if (!targetRect) return null;

  const padding = 10;
  const hasMultipleTargets = targetRect.individualRects && targetRect.individualRects.length > 1;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hasMultipleTargets ? (
              // Multiple cutouts for multiple targets
              targetRect.individualRects.map((rect, index) => (
                <rect
                  key={index}
                  x={rect.left - padding}
                  y={rect.top - padding}
                  width={rect.width + padding * 2}
                  height={rect.height + padding * 2}
                  rx="8"
                  fill="black"
                />
              ))
            ) : (
              // Single cutout
              <rect
                x={targetRect.viewportLeft - padding}
                y={targetRect.viewportTop - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#spotlight-mask)"
          style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      {/* Highlight borders around targets */}
      {hasMultipleTargets ? (
        // Multiple highlight borders
        targetRect.individualRects.map((rect, index) => (
          <div
            key={index}
            style={{
              position: 'fixed',
              top: rect.top - padding,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
              border: '3px solid #3b82f6',
              borderRadius: '8px',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
              pointerEvents: 'none',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))
      ) : (
        // Single highlight border
        <div
          style={{
            position: 'fixed',
            top: targetRect.viewportTop - padding,
            left: targetRect.viewportLeft - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
            pointerEvents: 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Click blocker overlays when isClickDisabled is true */}
      {isClickDisabled && (
        hasMultipleTargets ? (
          targetRect.individualRects.map((rect, index) => (
            <div
              key={`blocker-${index}`}
              style={{
                position: 'fixed',
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
                borderRadius: '8px',
                pointerEvents: 'auto',
                cursor: 'not-allowed',
                zIndex: 9999,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          ))
        ) : (
          <div
            style={{
              position: 'fixed',
              top: targetRect.viewportTop - padding,
              left: targetRect.viewportLeft - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              borderRadius: '8px',
              pointerEvents: 'auto',
              cursor: 'not-allowed',
              zIndex: 9999,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        )
      )}
    </div>
  );
}

/**
 * Calculate optimal tooltip position based on target element location
 * @param {Object} targetRect - Target element rect
 * @param {string} preferredPosition - User's preferred position or 'auto'
 * @returns {Object} - Position info { placement, tooltipStyle, arrowStyle }
 */
function calculatePosition(targetRect, preferredPosition = 'auto') {
  if (!targetRect) return null;

  const padding = 8;
  const tooltipMargin = 20;
  const tooltipWidth = 320;
  const tooltipHeight = 250; // Increased to account for full card with buttons
  const viewportPadding = 20;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Target boundaries (with highlight padding)
  const highlightPadding = 10;
  const targetTop = targetRect.viewportTop - highlightPadding;
  const targetBottom = targetRect.viewportTop + targetRect.height + highlightPadding;
  const targetLeft = targetRect.viewportLeft - highlightPadding;
  const targetRight = targetRect.viewportLeft + targetRect.width + highlightPadding;
  const targetCenterX = targetRect.viewportLeft + targetRect.width / 2;
  const targetCenterY = targetRect.viewportTop + targetRect.height / 2;

  // Available space in each direction (from highlight box edges)
  const spaceTop = targetTop - viewportPadding;
  const spaceBottom = viewportHeight - targetBottom - viewportPadding;
  const spaceLeft = targetLeft - viewportPadding;
  const spaceRight = viewportWidth - targetRight - viewportPadding;

  // Calculate positions with actual space requirements
  const positions = {
    'top': {
      score: spaceTop * 1.2, // Prefer top/bottom over left/right
      fits: spaceTop >= tooltipHeight + tooltipMargin,
      top: targetTop - tooltipMargin - tooltipHeight,
      left: targetCenterX - tooltipWidth / 2,
    },
    'bottom': {
      score: spaceBottom * 1.2,
      fits: spaceBottom >= tooltipHeight + tooltipMargin,
      top: targetBottom + tooltipMargin,
      left: targetCenterX - tooltipWidth / 2,
    },
    'left': {
      score: spaceLeft,
      fits: spaceLeft >= tooltipWidth + tooltipMargin,
      top: targetCenterY - tooltipHeight / 2,
      left: targetLeft - tooltipMargin - tooltipWidth,
    },
    'right': {
      score: spaceRight,
      fits: spaceRight >= tooltipWidth + tooltipMargin,
      top: targetCenterY - tooltipHeight / 2,
      left: targetRight + tooltipMargin,
    },
    'top-left': {
      score: spaceTop * 1.1,
      fits: spaceTop >= tooltipHeight + tooltipMargin && spaceLeft >= 0,
      top: targetTop - tooltipMargin - tooltipHeight,
      left: Math.max(viewportPadding, targetLeft),
    },
    'top-right': {
      score: spaceTop * 1.1,
      fits: spaceTop >= tooltipHeight + tooltipMargin && spaceRight >= 0,
      top: targetTop - tooltipMargin - tooltipHeight,
      left: Math.min(targetRight - tooltipWidth, viewportWidth - tooltipWidth - viewportPadding),
    },
    'bottom-left': {
      score: spaceBottom * 1.1,
      fits: spaceBottom >= tooltipHeight + tooltipMargin && spaceLeft >= 0,
      top: targetBottom + tooltipMargin,
      left: Math.max(viewportPadding, targetLeft),
    },
    'bottom-right': {
      score: spaceBottom * 1.1,
      fits: spaceBottom >= tooltipHeight + tooltipMargin && spaceRight >= 0,
      top: targetBottom + tooltipMargin,
      left: Math.min(targetRight - tooltipWidth, viewportWidth - tooltipWidth - viewportPadding),
    },
  };

  // Determine placement
  let placement;

  if (preferredPosition && preferredPosition !== 'auto' && positions[preferredPosition]) {
    // User specified a position - use it if it fits, otherwise find best
    if (positions[preferredPosition].fits) {
      placement = preferredPosition;
    } else {
      // Preferred doesn't fit, find best alternative
      placement = findBestPosition(positions);
    }
  } else {
    // Auto mode - find the best position
    placement = findBestPosition(positions);
  }

  // Get position data
  let { top: tooltipTop, left: tooltipLeft } = positions[placement];

  // Final safety clamp - ensure tooltip is fully visible
  tooltipTop = Math.max(viewportPadding, Math.min(tooltipTop, viewportHeight - tooltipHeight - viewportPadding));
  tooltipLeft = Math.max(viewportPadding, Math.min(tooltipLeft, viewportWidth - tooltipWidth - viewportPadding));

  // Calculate arrow position based on placement
  const arrowInfo = calculateArrowPosition(placement, targetRect, tooltipTop, tooltipLeft, tooltipWidth, tooltipHeight);

  return {
    placement,
    tooltipStyle: {
      top: tooltipTop,
      left: tooltipLeft,
      width: tooltipWidth,
    },
    arrowStyle: arrowInfo,
    targetCenter: {
      x: targetCenterX,
      y: targetCenterY,
    },
  };
}

/**
 * Find the best position based on available space
 */
function findBestPosition(positions) {
  // Priority order - prefer top when element is near bottom of screen
  const priorityOrder = ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'right', 'left'];

  // First, try to find a position that fits completely
  for (const pos of priorityOrder) {
    if (positions[pos] && positions[pos].fits) {
      return pos;
    }
  }

  // Nothing fits perfectly - find position with most space
  // Prioritize positions that have the most vertical space for top/bottom placements
  let bestPos = 'top';
  let bestScore = -Infinity;

  for (const [pos, data] of Object.entries(positions)) {
    // Give bonus to positions that almost fit
    const adjustedScore = data.score + (data.fits ? 1000 : 0);
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestPos = pos;
    }
  }

  return bestPos;
}

/**
 * Calculate arrow position and rotation based on tooltip placement
 */
function calculateArrowPosition(placement, targetRect, tooltipTop, tooltipLeft, tooltipWidth, tooltipHeight) {
  const targetCenterX = targetRect.viewportLeft + targetRect.width / 2;
  const targetCenterY = targetRect.viewportTop + targetRect.height / 2;
  const highlightPadding = 10;

  const targetTopEdge = targetRect.viewportTop - highlightPadding;
  const targetBottomEdge = targetRect.viewportTop + targetRect.height + highlightPadding;
  const targetLeftEdge = targetRect.viewportLeft - highlightPadding;
  const targetRightEdge = targetRect.viewportLeft + targetRect.width + highlightPadding;

  let x, y, rotation;
  const gap = 8;

  switch (placement) {
    case 'top':
    case 'top-left':
    case 'top-right':
      x = targetCenterX;
      y = targetTopEdge - gap;
      rotation = 180;
      break;
    case 'bottom':
    case 'bottom-left':
    case 'bottom-right':
      x = targetCenterX;
      y = targetBottomEdge + gap;
      rotation = 0;
      break;
    case 'left':
      x = targetLeftEdge - gap;
      y = targetCenterY;
      rotation = -90;
      break;
    case 'right':
      x = targetRightEdge + gap;
      y = targetCenterY;
      rotation = 90;
      break;
    default:
      x = targetCenterX;
      y = targetBottomEdge + gap;
      rotation = 0;
  }

  return { x, y, rotation };
}

/**
 * Simple arrow pointing FROM tooltip TO target
 */
function Arrow({ targetRect, position, isVisible }) {
  if (!targetRect || !position || !position.arrowStyle) return null;

  const { x, y, rotation } = position.arrowStyle;
  const arrowSize = 16;

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: 10000,
        pointerEvents: 'none',
        transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <svg width={arrowSize * 2} height={arrowSize * 2} viewBox="0 0 24 24">
        <path
          d="M12 4 L6 14 L10 14 L10 20 L14 20 L14 14 L18 14 Z"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

/**
 * Tooltip card component
 */
function Tooltip({
  step,
  targetRect,
  position,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  isVisible,
  onNext,
  onBack,
  onSkip,
}) {
  if (!targetRect || !position) return null;

  const { tooltipStyle } = position;

  return (
    <div
      style={{
        position: 'fixed',
        top: tooltipStyle.top,
        left: tooltipStyle.left,
        width: tooltipStyle.width,
        zIndex: 10001,
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {step.title && (
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
          }}
        >
          {step.title}
        </h3>
      )}

      <p
        style={{
          margin: '0 0 20px 0',
          fontSize: '15px',
          color: '#4a4a4a',
          lineHeight: '1.6',
        }}
      >
        {step.content}
      </p>

      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>
        <div
          style={{
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: '#3b82f6',
              borderRadius: '2px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onSkip}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Skip tour
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isFirstStep && (
            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
              }}
            >
              Back
            </button>
          )}

          <button
            onClick={onNext}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            {step.nextLabel || (isLastStep ? 'Finish' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReactGuide;
